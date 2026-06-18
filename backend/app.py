import os
from dotenv import load_dotenv
load_dotenv()
import io
import json
import base64
import zipfile
import uuid
from datetime import datetime
from xml.etree import ElementTree as ET
from flask import Flask, request, jsonify, send_file
from validators import validate_request, AIProcessSchema, AIChatSchema, PDFOperationSchema
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.utils import secure_filename
from PyPDF2 import PdfMerger, PdfReader, PdfWriter
from PIL import Image, ImageDraw
from docx import Document
from pdf2image import convert_from_path
from reportlab.lib.pagesizes import A4, landscape, letter
from reportlab.pdfgen import canvas
import tempfile
import shutil
import subprocess
import time
import signal
import glob
from pathlib import Path

try:
    import fitz
except ImportError:
    fitz = None

app = Flask(__name__)
# Strictly configure CORS for production security
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:5175,http://127.0.0.1:5175").split(",")
CORS(app, resources={
    r"/api/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    },
    r"/health": {
        "origins": "*",
        "methods": ["GET"]
    }
})

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["60 per minute"],
    storage_uri="memory://"
)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
RESULTS_FOLDER = os.path.join(UPLOAD_FOLDER, 'results')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

@app.after_request
def add_security_headers(response):
    # Content-Security-Policy: restrict script and style sources
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self';"
    # X-Frame-Options: DENY to prevent clickjacking
    response.headers['X-Frame-Options'] = 'DENY'
    # X-Content-Type-Options: nosniff
    response.headers['X-Content-Type-Options'] = 'nosniff'
    # Strict-Transport-Security to force HTTPS
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    # Referrer-Policy: strict-origin-when-cross-origin
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    
    # Remove the X-Powered-By header if present to avoid leaking framework information
    if 'X-Powered-By' in response.headers:
        del response.headers['X-Powered-By']
        
    return response

ALLOWED_PDF = {'pdf'}
ALLOWED_IMAGES = {'jpg', 'jpeg', 'png', 'webp'}
ALLOWED_DOCS = {'docx', 'doc'}
ALLOWED_SPREADSHEETS = {'xlsx', 'xls', 'csv'}
ALLOWED_PRESENTATIONS = {'pptx', 'ppt'}

try:
    import magic
except ImportError:
    magic = None

MAX_IMAGE_SIZE = 5 * 1024 * 1024
MAX_DOC_SIZE = 25 * 1024 * 1024

# --- Free-tier memory safety knobs (overridable via env) ---
# Documents larger than this skip LibreOffice (which is RAM-heavy) and use the
# lightweight text fallback instead, to avoid OOM on small instances.
LIBREOFFICE_MAX_BYTES = int(os.environ.get('LIBREOFFICE_MAX_BYTES', 8 * 1024 * 1024))
# Hard timeout (seconds) for a single LibreOffice conversion before it is killed.
LIBREOFFICE_TIMEOUT = int(os.environ.get('LIBREOFFICE_TIMEOUT', 60))
# How long an incoming request will wait for the single conversion slot before
# giving up with a "server busy" response (keeps requests from piling up).
LIBREOFFICE_WAIT_SECONDS = int(os.environ.get('LIBREOFFICE_WAIT_SECONDS', 8))
# Cross-process lock so only ONE LibreOffice conversion runs at a time, even
# across multiple gunicorn workers.
LIBREOFFICE_LOCK_PATH = os.path.join(UPLOAD_FOLDER, 'libreoffice.lock')

MIME_TYPE_MAP = {
    'pdf': ['application/pdf'],
    'jpg': ['image/jpeg'],
    'jpeg': ['image/jpeg'],
    'png': ['image/png'],
    'webp': ['image/webp'],
    # OOXML formats (.docx/.xlsx/.pptx) are ZIP containers; libmagic often
    # reports them as application/zip (or octet-stream for sparse files), so
    # those are accepted alongside the canonical Office MIME types.
    'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'application/zip', 'application/octet-stream'],
    'doc': ['application/msword', 'application/x-ole-storage', 'application/octet-stream'],
    'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'application/zip', 'application/octet-stream'],
    'xls': ['application/vnd.ms-excel', 'application/x-ole-storage', 'application/octet-stream'],
    'pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint', 'application/zip', 'application/octet-stream'],
    'ppt': ['application/vnd.ms-powerpoint', 'application/x-ole-storage', 'application/octet-stream'],
    'csv': ['text/csv', 'text/plain', 'application/csv', 'application/vnd.ms-excel', 'application/octet-stream'],
}

def scan_for_malware(filepath):
    # Mock malware scanner hook
    return True

def allowed_file(file_obj, allowed_types):
    if not file_obj or not file_obj.filename:
        return False
    filename = file_obj.filename
    if '.' not in filename: return False
    ext = filename.rsplit('.', 1)[1].lower()
    if ext not in allowed_types: return False

    if magic is None:
        return True
    
    # Read the first 2048 bytes to determine MIME type
    try:
        header = file_obj.read(2048)
        file_obj.seek(0)
        mime_type = magic.from_buffer(header, mime=True)
    except Exception:
        file_obj.seek(0)
        return True
        
    expected_mimes = MIME_TYPE_MAP.get(ext, [])
    if not expected_mimes:
        return False
    return mime_type in expected_mimes

def save_uploaded_file(file, suffix):
    ext = file.filename.rsplit('.', 1)[1].lower() if file.filename and '.' in file.filename else suffix.lstrip('.')
    
    file.seek(0, os.SEEK_END)
    file_length = file.tell()
    file.seek(0)
    
    if ext in ALLOWED_IMAGES and file_length > MAX_IMAGE_SIZE:
        raise ValueError('Image exceeds size limit of 5MB.')
    elif file_length > MAX_DOC_SIZE:
        raise ValueError('Document exceeds size limit of 25MB.')
        
    safe_filename = f"{uuid.uuid4().hex}.{ext}"
    temp_path = os.path.join(UPLOAD_FOLDER, safe_filename)
    
    file.save(temp_path)
    os.chmod(temp_path, 0o600)

    return temp_path


class ConversionBusyError(Exception):
    """Raised when the single LibreOffice conversion slot is occupied."""


# Cache the resolved LibreOffice binary path (None = checked and not found).
_SOFFICE_PATH = False


def find_soffice():
    """Locate the LibreOffice/soffice binary, if installed."""
    global _SOFFICE_PATH
    if _SOFFICE_PATH is not False:
        return _SOFFICE_PATH

    candidates = [os.environ.get('SOFFICE_PATH'), 'soffice', 'libreoffice']
    resolved = None
    for candidate in candidates:
        if not candidate:
            continue
        resolved = shutil.which(candidate) or (candidate if os.path.exists(candidate) else None)
        if resolved:
            break

    if not resolved:
        for path in (
            r'C:\Program Files\LibreOffice\program\soffice.exe',
            r'C:\Program Files (x86)\LibreOffice\program\soffice.exe',
            '/usr/bin/soffice',
            '/usr/bin/libreoffice',
            '/opt/libreoffice/program/soffice',
        ):
            if os.path.exists(path):
                resolved = path
                break

    _SOFFICE_PATH = resolved
    return resolved


def _kill_process_tree(proc):
    """Forcefully terminate a LibreOffice process and any children it spawned."""
    if proc is None or proc.poll() is not None:
        return
    try:
        if os.name == 'posix':
            # soffice forks a soffice.bin child; kill the whole process group.
            os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
        else:
            subprocess.run(['taskkill', '/F', '/T', '/PID', str(proc.pid)],
                           capture_output=True, check=False)
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass


def _sweep_stale_temp_dirs(max_age_seconds=900):
    """Best-effort removal of leftover LibreOffice temp dirs from crashed jobs,
    so the small disk/RAM footprint of the free tier doesn't accumulate."""
    try:
        now = time.time()
        for path in glob.glob(os.path.join(UPLOAD_FOLDER, 'lo_*')):
            try:
                if now - os.path.getmtime(path) > max_age_seconds:
                    shutil.rmtree(path, ignore_errors=True)
            except OSError:
                pass
    except Exception:
        pass


def acquire_conversion_slot(wait_seconds=LIBREOFFICE_WAIT_SECONDS):
    """Cross-process lock ensuring only one LibreOffice conversion runs at a
    time. Returns True if the slot was acquired, False if the server is busy."""
    deadline = time.time() + max(wait_seconds, 0)
    while True:
        try:
            fd = os.open(LIBREOFFICE_LOCK_PATH, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(fd, str(os.getpid()).encode())
            os.close(fd)
            return True
        except FileExistsError:
            # Reclaim a stale lock left by a crashed/killed worker.
            try:
                age = time.time() - os.path.getmtime(LIBREOFFICE_LOCK_PATH)
                if age > LIBREOFFICE_TIMEOUT + 30:
                    os.remove(LIBREOFFICE_LOCK_PATH)
                    continue
            except OSError:
                pass
            if time.time() >= deadline:
                return False
            time.sleep(0.4)
        except OSError:
            return False


def release_conversion_slot():
    try:
        os.remove(LIBREOFFICE_LOCK_PATH)
    except OSError:
        pass


def libreoffice_convert_to_pdf(src_path):
    """Convert a document to PDF with LibreOffice on demand.

    Memory-safe for free hosting: LibreOffice is launched only for this single
    job (never kept resident), runs under a hard timeout, is force-killed (with
    its children) on timeout/error, and all temp files are removed afterwards.

    Returns PDF bytes, or None if LibreOffice is unavailable, busy, times out,
    or otherwise fails (callers then use the lightweight text fallback)."""
    soffice = find_soffice()
    if not soffice:
        return None

    # Serialize conversions across all workers so the box never runs two
    # memory-heavy LibreOffice processes at once.
    if not acquire_conversion_slot():
        raise ConversionBusyError()

    _sweep_stale_temp_dirs()
    out_dir = tempfile.mkdtemp(prefix='lo_', dir=UPLOAD_FOLDER)
    proc = None
    try:
        # Isolated, throwaway user profile so nothing persists between jobs.
        profile_uri = Path(out_dir, 'profile').as_uri()
        cmd = [
            soffice, '--headless', '--norestore', '--nolockcheck', '--nodefault',
            f'-env:UserInstallation={profile_uri}',
            '--convert-to', 'pdf', '--outdir', out_dir, src_path,
        ]
        popen_kwargs = {'stdout': subprocess.PIPE, 'stderr': subprocess.PIPE}
        if os.name == 'posix':
            popen_kwargs['start_new_session'] = True  # own process group for clean kill

        proc = subprocess.Popen(cmd, **popen_kwargs)
        try:
            proc.communicate(timeout=LIBREOFFICE_TIMEOUT)
        except subprocess.TimeoutExpired:
            _kill_process_tree(proc)
            proc.wait()
            return None

        base = os.path.splitext(os.path.basename(src_path))[0]
        pdf_path = os.path.join(out_dir, base + '.pdf')
        if os.path.exists(pdf_path):
            with open(pdf_path, 'rb') as handle:
                return handle.read()
        return None
    except ConversionBusyError:
        raise
    except Exception:
        return None
    finally:
        # Guarantee the process is gone and temp files are cleaned, always.
        _kill_process_tree(proc)
        shutil.rmtree(out_dir, ignore_errors=True)
        release_conversion_slot()


def office_to_pdf_thumbnails(temp_path, max_pages=40, label_prefix='Page'):
    """Render an office file (ppt/pptx/xls/xlsx/csv/doc/docx) into per-page
    JPEG thumbnails by converting to PDF with LibreOffice and rasterizing each
    page with PyMuPDF. Returns a list of {label, thumbnail} preview items, or
    None when LibreOffice/PyMuPDF is unavailable, busy, or conversion fails
    (callers then fall back to lightweight text/row extraction)."""
    pymupdf = get_pymupdf()
    if pymupdf is None:
        return None
    try:
        pdf_bytes = libreoffice_convert_to_pdf(temp_path)
    except ConversionBusyError:
        return None
    if not pdf_bytes:
        return None

    items = []
    doc = pymupdf.open(stream=pdf_bytes, filetype='pdf')
    try:
        matrix = pymupdf.Matrix(1.6, 1.6)  # ~150 DPI thumbnails
        for index, page in enumerate(doc):
            if index >= max_pages:
                break
            pix = page.get_pixmap(matrix=matrix, alpha=False)
            image = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
            items.append({
                'label': f'{label_prefix} {index + 1}',
                'thumbnail': image_to_base64(image, 'JPEG', 82),
            })
    finally:
        doc.close()
    return items or None


def result_meta_path(job_id):
    return os.path.join(RESULTS_FOLDER, f'{secure_filename(job_id)}.json')

def save_result_meta(meta):
    with open(result_meta_path(meta['jobId']), 'w', encoding='utf-8') as handle:
        json.dump(meta, handle)

def load_result_meta(job_id):
    path = result_meta_path(job_id)
    if not os.path.exists(path):
        return None
    with open(path, 'r', encoding='utf-8') as handle:
        return json.load(handle)

def result_kind_for_filename(filename):
    extension = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if extension == 'pdf':
        return 'pdf'
    if extension in ALLOWED_IMAGES:
        return 'image'
    if extension in ALLOWED_DOCS:
        return 'document'
    if extension in ALLOWED_SPREADSHEETS:
        return 'spreadsheet'
    if extension in ALLOWED_PRESENTATIONS:
        return 'presentation'
    if extension == 'zip':
        return 'archive'
    if extension in {'txt', 'text'}:
        return 'text'
    return 'generic'

def get_pdf_page_count(path):
    try:
        return len(PdfReader(path).pages)
    except Exception:
        return 0

def send_writer_pdf(writer, download_name):
    output = io.BytesIO()
    writer.write(output)
    output.seek(0)
    return send_file(
        output,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=download_name
    )

def parse_page_range(page_range, total_pages):
    if not page_range:
        return list(range(total_pages))

    selected = set()
    for part in page_range.replace(' ', '').split(','):
        if not part:
            continue
        if '-' in part:
            start_text, end_text = part.split('-', 1)
            start = int(start_text)
            end = int(end_text)
            if start > end:
                start, end = end, start
            selected.update(range(start - 1, end))
        else:
            selected.add(int(part) - 1)

    return sorted(page for page in selected if 0 <= page < total_pages)

def get_pymupdf():
    global fitz
    if fitz is not None:
        return fitz

    try:
        import fitz as pymupdf
        fitz = pymupdf
        return fitz
    except ImportError:
        return None

def render_pdf_pages(temp_path, dpi=120, page_indices=None):
    """Render PDF pages to PIL images using the best local renderer available."""
    selected_indices = None if page_indices is None else sorted(set(page_indices))
    pymupdf = get_pymupdf()
    if pymupdf is not None:
        document = pymupdf.open(temp_path)
        try:
            zoom = dpi / 72
            matrix = pymupdf.Matrix(zoom, zoom)
            images = []
            indices = selected_indices if selected_indices is not None else range(len(document))
            for page_index in indices:
                if page_index < 0 or page_index >= len(document):
                    continue
                page = document[page_index]
                pixmap = page.get_pixmap(matrix=matrix, alpha=False)
                image = Image.open(io.BytesIO(pixmap.tobytes('png'))).convert('RGB')
                images.append((page_index, image))
            return images
        finally:
            document.close()

    try:
        images = convert_from_path(temp_path, dpi=dpi)
        indices = selected_indices if selected_indices is not None else range(len(images))
        return [(page_index, images[page_index]) for page_index in indices if 0 <= page_index < len(images)]
    except Exception:
        reader = PdfReader(temp_path)
        images = []
        indices = selected_indices if selected_indices is not None else range(len(reader.pages))
        for page_index in indices:
            if page_index < 0 or page_index >= len(reader.pages):
                continue
            page = reader.pages[page_index]
            image = Image.new('RGB', (1240, 1754), 'white')
            draw = ImageDraw.Draw(image)
            y = 80
            draw.text((80, 40), f'Page {page_index + 1}', fill='black')

            text = page.extract_text() or '[Install PyMuPDF to preview scanned/image PDFs]'
            for raw_line in text.splitlines():
                line = raw_line.strip()
                if not line:
                    y += 18
                    continue

                chunks = [line[i:i + 110] for i in range(0, len(line), 110)]
                for chunk in chunks:
                    if y > 1660:
                        break
                    draw.text((80, y), chunk, fill='black')
                    y += 22

            images.append((page_index, image))
        return images

def image_to_base64(image, image_format='JPEG', quality=85):
    output = io.BytesIO()
    save_kwargs = {}
    if image_format.upper() in {'JPEG', 'JPG', 'WEBP'}:
        save_kwargs['quality'] = quality
    if image.mode not in {'RGB', 'RGBA'}:
        image = image.convert('RGB')
    if image_format.upper() == 'JPEG' and image.mode == 'RGBA':
        background = Image.new('RGB', image.size, (255, 255, 255))
        background.paste(image, mask=image.split()[-1])
        image = background
    image.save(output, format='JPEG' if image_format.upper() == 'JPG' else image_format.upper(), **save_kwargs)
    output.seek(0)
    return base64.b64encode(output.getvalue()).decode('utf-8')

def page_size_from_request():
    page_size = request.form.get('pageSize', 'Letter').lower()
    orientation = request.form.get('orientation', 'portrait').lower()
    size = A4 if page_size == 'a4' else letter
    return landscape(size) if orientation == 'landscape' else size

def draw_wrapped(pdf, text, x, y, max_chars=95, line_height=14, min_y=72):
    for raw_line in (text or '').splitlines() or ['']:
        line = raw_line.strip()
        chunks = [''] if not line else [line[i:i + max_chars] for i in range(0, len(line), max_chars)]
        for chunk in chunks:
            if y < min_y:
                pdf.showPage()
                pdf.setFont('Helvetica', 11)
                _, height = pdf._pagesize
                y = height - 72
            pdf.drawString(x, y, chunk)
            y -= line_height
        y -= 4
    return y

def xml_escape(value):
    return str(value or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def column_name(index):
    name = ''
    index += 1
    while index:
        index, remainder = divmod(index - 1, 26)
        name = chr(65 + remainder) + name
    return name

def document_preview_items(temp_path):
    document = Document(temp_path)
    text = '\n'.join(paragraph.text for paragraph in document.paragraphs if paragraph.text.strip())
    chunks = [text[i:i + 1800] for i in range(0, max(len(text), 1), 1800)]
    return [{
        'label': f'Document page {index + 1}',
        'text': chunk or '[Empty document]'
    } for index, chunk in enumerate(chunks[:8])]

def parse_xlsx_sheets(temp_path):
    namespace = {
        'm': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
        'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
        'rel': 'http://schemas.openxmlformats.org/package/2006/relationships',
    }
    with zipfile.ZipFile(temp_path) as archive:
        shared = []
        if 'xl/sharedStrings.xml' in archive.namelist():
            shared_root = ET.fromstring(archive.read('xl/sharedStrings.xml'))
            for item in shared_root.findall('.//m:si', namespace):
                shared.append(''.join(item.itertext()))

        workbook = ET.fromstring(archive.read('xl/workbook.xml'))
        rels_root = ET.fromstring(archive.read('xl/_rels/workbook.xml.rels'))
        rels = {rel.attrib.get('Id'): rel.attrib.get('Target', '') for rel in rels_root.findall('rel:Relationship', namespace)}
        sheets = []

        for sheet in workbook.findall('.//m:sheet', namespace):
            name = sheet.attrib.get('name', 'Sheet')
            rel_id = sheet.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
            target = rels.get(rel_id, '')
            if not target:
                continue
            sheet_path = target.lstrip('/')
            if not sheet_path.startswith('xl/'):
                sheet_path = 'xl/' + sheet_path
            sheet_path = sheet_path.replace('xl/../', '')
            if sheet_path not in archive.namelist():
                continue

            root = ET.fromstring(archive.read(sheet_path))
            rows = []
            for row in root.findall('.//m:row', namespace)[:16]:
                values = []
                for cell in row.findall('m:c', namespace)[:10]:
                    cell_type = cell.attrib.get('t')
                    value_node = cell.find('m:v', namespace)
                    inline_node = cell.find('.//m:t', namespace)
                    value = ''
                    if cell_type == 's' and value_node is not None and value_node.text:
                        index = int(value_node.text)
                        value = shared[index] if 0 <= index < len(shared) else ''
                    elif inline_node is not None and inline_node.text:
                        value = inline_node.text
                    elif value_node is not None and value_node.text:
                        value = value_node.text
                    values.append(value)
                if any(values):
                    rows.append(values)
            sheets.append({'name': name, 'rows': rows or [['No previewable cells']]})

        return sheets or [{'name': 'Sheet 1', 'rows': [['No previewable cells']]}]

def spreadsheet_preview_items(temp_path):
    sheets = parse_xlsx_sheets(temp_path)
    return [{
        'label': sheet['name'],
        'rows': sheet['rows'],
        'text': '\n'.join(' | '.join(row) for row in sheet['rows'][:8])
    } for sheet in sheets]

def parse_pptx_slides(temp_path):
    namespace = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}
    with zipfile.ZipFile(temp_path) as archive:
        slide_names = sorted(
            [name for name in archive.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')],
            key=lambda name: int(''.join(ch for ch in os.path.basename(name) if ch.isdigit()) or '0')
        )
        slides = []
        for name in slide_names:
            root = ET.fromstring(archive.read(name))
            text = '\n'.join(node.text for node in root.findall('.//a:t', namespace) if node.text)
            slides.append(text or '[No slide text]')
        return slides or ['[No slide text]']

def presentation_preview_items(temp_path):
    slides = parse_pptx_slides(temp_path)
    return [{'label': f'Slide {index + 1}', 'text': text} for index, text in enumerate(slides)]

def create_basic_xlsx(sheets):
    output = io.BytesIO()
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
        sheet_overrides = ''.join(
            f'<Override PartName="/xl/worksheets/sheet{index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            for index in range(len(sheets))
        )
        archive.writestr('[Content_Types].xml',
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            f'{sheet_overrides}</Types>')
        archive.writestr('_rels/.rels',
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            '</Relationships>')
        sheet_entries = ''.join(
            f'<sheet name="{xml_escape(sheet["name"][:31])}" sheetId="{index + 1}" r:id="rId{index + 1}"/>'
            for index, sheet in enumerate(sheets)
        )
        archive.writestr('xl/workbook.xml',
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            f'<sheets>{sheet_entries}</sheets></workbook>')
        rel_entries = ''.join(
            f'<Relationship Id="rId{index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{index + 1}.xml"/>'
            for index in range(len(sheets))
        )
        archive.writestr('xl/_rels/workbook.xml.rels',
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            f'{rel_entries}</Relationships>')
        archive.writestr('xl/styles.xml',
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font/></fonts><fills count="1"><fill/></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="1"><xf/></cellXfs></styleSheet>')

        for sheet_index, sheet in enumerate(sheets):
            rows_xml = ''
            for row_index, row in enumerate(sheet['rows'], start=1):
                cells = ''
                for col_index, value in enumerate(row):
                    ref = f'{column_name(col_index)}{row_index}'
                    cells += f'<c r="{ref}" t="inlineStr"><is><t>{xml_escape(value)}</t></is></c>'
                rows_xml += f'<row r="{row_index}">{cells}</row>'
            archive.writestr(f'xl/worksheets/sheet{sheet_index + 1}.xml',
                '<?xml version="1.0" encoding="UTF-8"?>'
                '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
                f'<sheetData>{rows_xml}</sheetData></worksheet>')

    output.seek(0)
    return output

def create_basic_pptx(slides):
    output = io.BytesIO()
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
        slide_overrides = ''.join(
            f'<Override PartName="/ppt/slides/slide{index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'
            for index in range(len(slides))
        )
        archive.writestr('[Content_Types].xml',
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>'
            '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>'
            '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>'
            '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>'
            f'{slide_overrides}</Types>')
        archive.writestr('_rels/.rels',
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>'
            '</Relationships>')
        slide_ids = ''.join(f'<p:sldId id="{256 + index}" r:id="rId{index + 2}"/>' for index in range(len(slides)))
        presentation_rels = '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>'
        presentation_rels += ''.join(
            f'<Relationship Id="rId{index + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{index + 1}.xml"/>'
            for index in range(len(slides))
        )
        archive.writestr('ppt/presentation.xml',
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
            'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
            '<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>'
            f'<p:sldIdLst>{slide_ids}</p:sldIdLst>'
            '<p:sldSz cx="9144000" cy="6858000" type="screen4x3"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>')
        archive.writestr('ppt/_rels/presentation.xml.rels',
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            f'{presentation_rels}</Relationships>')
        archive.writestr('ppt/slideMasters/slideMaster1.xml',
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
            '<p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>'
            '<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>')
        archive.writestr('ppt/slideMasters/_rels/slideMaster1.xml.rels',
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>'
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>'
            '</Relationships>')
        archive.writestr('ppt/slideLayouts/slideLayout1.xml',
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">'
            '<p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld></p:sldLayout>')
        archive.writestr('ppt/slideLayouts/_rels/slideLayout1.xml.rels',
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>'
            '</Relationships>')
        archive.writestr('ppt/theme/theme1.xml',
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="DocNova"><a:themeElements><a:clrScheme name="DocNova"><a:dk1><a:srgbClr val="111827"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:accent1><a:srgbClr val="2563EB"/></a:accent1></a:clrScheme><a:fontScheme name="DocNova"><a:majorFont><a:latin typeface="Arial"/></a:majorFont><a:minorFont><a:latin typeface="Arial"/></a:minorFont></a:fontScheme><a:fmtScheme name="DocNova"/></a:themeElements></a:theme>')

        for index, text in enumerate(slides, start=1):
            safe_text = xml_escape(text[:3000])
            archive.writestr(f'ppt/slides/slide{index}.xml',
                '<?xml version="1.0" encoding="UTF-8"?>'
                '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
                '<p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>'
                '<p:sp><p:nvSpPr><p:cNvPr id="2" name="Text"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="720000" y="720000"/><a:ext cx="7700000" cy="5200000"/></a:xfrm></p:spPr>'
                f'<p:txBody><a:bodyPr wrap="square"/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="2400"/><a:t>{safe_text}</a:t></a:r></a:p></p:txBody></p:sp>'
                '</p:spTree></p:cSld></p:sld>')
            archive.writestr(f'ppt/slides/_rels/slide{index}.xml.rels',
                '<?xml version="1.0" encoding="UTF-8"?>'
                '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>'
                '</Relationships>')

    output.seek(0)
    return output

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'renderer': 'pymupdf' if get_pymupdf() is not None else 'fallback'
    })

# ==================== RESULT JOBS ====================
@app.route('/api/result/create', methods=['POST'])
@limiter.limit("60 per minute")
def create_result_job():
    """Persist a processed output so the frontend can open a clean result page."""
    try:
        file = request.files.get('file')
        if not file:
            return jsonify({'error': 'No result file provided'}), 400

        job_id = uuid.uuid4().hex[:16]
        output_name = secure_filename(request.form.get('outputFileName') or file.filename or 'docnova-output')
        stored_name = f'{job_id}_{output_name}'
        stored_path = os.path.join(RESULTS_FOLDER, stored_name)
        file.save(stored_path)

        kind = result_kind_for_filename(output_name)
        output_size = os.path.getsize(stored_path)
        page_count = get_pdf_page_count(stored_path) if kind == 'pdf' else 0

        try:
            summary = json.loads(request.form.get('summary', '[]'))
        except Exception:
            summary = []
        try:
            items = json.loads(request.form.get('items', '[]'))
        except Exception:
            items = []

        meta = {
            'jobId': job_id,
            'outputFileName': output_name,
            'outputFileSize': output_size,
            'pageCount': page_count,
            'previewUrl': f'/api/result/{job_id}/preview',
            'downloadUrl': f'/api/result/{job_id}/download',
            'deleteUrl': f'/api/result/{job_id}',
            'toolType': request.form.get('toolType', ''),
            'toolLabel': request.form.get('toolLabel', ''),
            'outputFormat': request.form.get('outputFormat', ''),
            'kind': kind,
            'storedName': stored_name,
            'createdAt': datetime.now().isoformat(),
            'summary': summary,
            'items': items,
        }
        save_result_meta(meta)

        public_meta = {key: value for key, value in meta.items() if key != 'storedName'}
        return jsonify(public_meta)
    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500

@app.route('/api/result/<job_id>', methods=['GET'])
def get_result_job(job_id):
    meta = load_result_meta(job_id)
    if not meta:
        return jsonify({'error': 'Result not found'}), 404
    return jsonify({key: value for key, value in meta.items() if key != 'storedName'})

@app.route('/api/result/<job_id>/download', methods=['GET'])
def download_result_job(job_id):
    meta = load_result_meta(job_id)
    if not meta:
        return jsonify({'error': 'Result not found'}), 404
    path = os.path.join(RESULTS_FOLDER, meta['storedName'])
    if not os.path.exists(path):
        return jsonify({'error': 'Result file missing'}), 404
    return send_file(path, as_attachment=True, download_name=meta['outputFileName'])

@app.route('/api/result/<job_id>/preview', methods=['GET'])
def preview_result_job(job_id):
    meta = load_result_meta(job_id)
    if not meta:
        return jsonify({'error': 'Result not found'}), 404

    path = os.path.join(RESULTS_FOLDER, meta['storedName'])
    if not os.path.exists(path):
        return jsonify({'error': 'Result file missing'}), 404

    try:
        kind = meta.get('kind', 'generic')
        if kind == 'pdf':
            total_pages = meta.get('pageCount') or get_pdf_page_count(path)
            requested_range = request.args.get('pageRange', '')
            requested_page = request.args.get('page', '')
            if requested_page:
                requested_range = requested_page
            page_indices = parse_page_range(requested_range, total_pages) if requested_range else list(range(total_pages))
            images = render_pdf_pages(path, dpi=150, page_indices=page_indices)
            return jsonify({
                'kind': 'pdf',
                'total': total_pages,
                'pages': [
                    {'page': page_index + 1, 'image': image_to_base64(image, 'JPEG', 88)}
                    for page_index, image in images
                ]
            })

        if kind == 'image':
            image = Image.open(path).convert('RGB')
            image.thumbnail((1400, 1600))
            return jsonify({
                'kind': 'image',
                'total': 1,
                'pages': [{'page': 1, 'image': image_to_base64(image, 'JPEG', 90)}]
            })

        if kind == 'text':
            with open(path, 'r', encoding='utf-8', errors='replace') as handle:
                text = handle.read()
            return jsonify({'kind': 'text', 'total': 1, 'text': text})

        if kind == 'archive':
            return jsonify({
                'kind': 'archive',
                'total': len(meta.get('items', [])),
                'items': meta.get('items', [])
            })

        return jsonify({
            'kind': kind,
            'total': 1,
            'items': meta.get('items', []),
            'text': f'{meta.get("outputFileName", "Output file")} is ready to download.'
        })
    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500

@app.route('/api/result/<job_id>', methods=['DELETE'])
def delete_result_job(job_id):
    meta = load_result_meta(job_id)
    if not meta:
        return jsonify({'success': True})
    file_path = os.path.join(RESULTS_FOLDER, meta.get('storedName', ''))
    meta_path = result_meta_path(job_id)
    for path in [file_path, meta_path]:
        try:
            if path and os.path.exists(path):
                os.remove(path)
        except Exception:
            pass
    return jsonify({'success': True})

# ==================== MERGE PDF ====================
@app.route('/api/merge-pdf', methods=['POST'])
@limiter.limit("5 per minute")
def merge_pdf():
    """Merge multiple PDFs into one"""
    temp_paths = []
    output_path = None
    
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        if not files or len(files) < 2:
            return jsonify({'error': 'At least 2 PDFs required for merging'}), 400
        
        writer = PdfWriter()
        base_page = None

        # Save uploaded files and add to merger
        for file in files:
            if file and file.filename and allowed_file(file, ALLOWED_PDF):
                filename = secure_filename(file.filename)
                temp_path = os.path.join(UPLOAD_FOLDER, f"temp_{datetime.now().timestamp()}_{filename}")
                file.save(temp_path)
                temp_paths.append(temp_path)

                reader = PdfReader(temp_path)
                for page in reader.pages:
                    if base_page is None:
                        base_page = page
                        writer.add_page(base_page)
                    else:
                        base_page.merge_page(page)

        if len(temp_paths) < 2:
            return jsonify({'error': 'At least 2 valid PDF files required'}), 400

        # Write merged PDF to temporary file
        output_path = os.path.join(UPLOAD_FOLDER, f"merged_{datetime.now().timestamp()}.pdf")
        with open(output_path, 'wb') as output_file:
            writer.write(output_file)

        # Read and send the merged PDF
        return send_file(
            output_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='merged_document.pdf'
        )

    except Exception as e:
        return jsonify({'error': 'Merge failed.'}), 500

    finally:
        # Cleanup input temp files
        for path in temp_paths:
            try:
                if os.path.exists(path):
                    os.remove(path)
            except:
                pass

@app.route('/api/pdf/merge-selected', methods=['POST'])
@limiter.limit("5 per minute")
def merge_selected_pdf():
    """Merge selected pages from multiple PDFs in a custom order"""
    temp_paths = {}

    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400

        files = request.files.getlist('files')
        file_ids = json.loads(request.form.get('fileIds', '[]'))
        selected_pages = json.loads(request.form.get('selectedPages', '[]'))

        if not files or not file_ids or len(files) != len(file_ids):
            return jsonify({'error': 'File metadata is incomplete'}), 400
        if not selected_pages:
            return jsonify({'error': 'No pages selected'}), 400

        readers = {}
        for file, file_id in zip(files, file_ids):
            if not file or not allowed_file(file, ALLOWED_PDF):
                continue
            temp_path = save_uploaded_file(file, '.pdf')
            temp_paths[file_id] = temp_path
            readers[file_id] = PdfReader(temp_path)

        writer = PdfWriter()
        ordered_pages = sorted(selected_pages, key=lambda page: page.get('order', 0))

        for selected in ordered_pages:
            file_id = selected.get('fileId')
            page_index = int(selected.get('pageIndex', -1))
            reader = readers.get(file_id)
            if reader is None:
                return jsonify({'error': 'Missing source PDF.', 'details': f'Missing source PDF for {file_id}'}), 400
            if page_index < 0 or page_index >= len(reader.pages):
                return jsonify({'error': 'Invalid page selected.', 'details': f'Invalid page selected from {selected.get("fileName", "PDF")}'}), 400

            page = reader.pages[page_index]

            # Apply rotation if present
            rotation = int(selected.get('rotation', 0))
            if rotation:
                page.rotate(rotation)

            writer.add_page(page)

        return send_writer_pdf(writer, 'merged-selected.pdf')

    except Exception as e:
        return jsonify({'error': 'Merge failed.'}), 500

    finally:
        for path in temp_paths.values():
            try:
                if os.path.exists(path):
                    os.remove(path)
            except:
                pass

# ==================== COMPRESS PDF ====================
@app.route('/api/compress-pdf', methods=['POST'])
@limiter.limit("5 per minute")
def compress_pdf():
    """Compress PDF to reduce file size"""
    temp_path = None
    output_path = None
    
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not file or not allowed_file(file, ALLOWED_PDF):
            return jsonify({'error': 'Invalid PDF file'}), 400
        
        temp_path = os.path.join(UPLOAD_FOLDER, f"temp_{datetime.now().timestamp()}_input.pdf")
        file.save(temp_path)
        
        reader = PdfReader(temp_path)
        writer = PdfWriter()
        
        for page in reader.pages:
            page.compress_content_streams()
            writer.add_page(page)
        
        # Write to file instead of BytesIO
        output_path = os.path.join(UPLOAD_FOLDER, f"compressed_{datetime.now().timestamp()}.pdf")
        with open(output_path, 'wb') as output_file:
            writer.write(output_file)
        
        return send_file(
            output_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='compressed.pdf'
        )
    
    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500
    
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass

# ==================== SPLIT PDF ====================
@app.route('/api/pdf/split', methods=['POST'])
@app.route('/api/split-pdf', methods=['POST'])
@limiter.limit("5 per minute")
def split_pdf():
    """Split PDF into individual pages"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not file or not allowed_file(file, ALLOWED_PDF):
            return jsonify({'error': 'Invalid PDF file'}), 400
        
        temp_path = os.path.join(UPLOAD_FOLDER, f"temp_{datetime.now().timestamp()}_input.pdf")
        file.save(temp_path)
        
        try:
            reader = PdfReader(temp_path)
            pages_data = []
            
            page_indices = parse_page_range(request.form.get('pageRange', ''), len(reader.pages))
            if not page_indices:
                return jsonify({'error': 'No valid pages selected'}), 400

            for idx in page_indices:
                page = reader.pages[idx]
                writer = PdfWriter()
                writer.add_page(page)
                
                output = io.BytesIO()
                writer.write(output)
                output.seek(0)
                pages_data.append({
                    'page': idx + 1,
                    'data': output.getvalue()
                })
            
            # Return all pages as a JSON response with base64 encoded PDFs
            response_data = []
            for page_info in pages_data:
                import base64
                encoded = base64.b64encode(page_info['data']).decode('utf-8')
                response_data.append({
                    'page': page_info['page'],
                    'pdf': encoded
                })
            
            return jsonify({'pages': response_data, 'total': len(response_data)})
        
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500

# ==================== PDF TO JPG ====================
@app.route('/api/pdf/thumbnails', methods=['POST'])
@app.route('/api/preview/pdf', methods=['POST'])
@app.route('/api/convert/pdf-to-image', methods=['POST'])
@app.route('/api/pdf-to-jpg', methods=['POST'])
@limiter.limit("5 per minute")
def pdf_to_jpg():
    """Convert PDF pages to JPG images"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not file or not allowed_file(file, ALLOWED_PDF):
            return jsonify({'error': 'Invalid PDF file'}), 400
        
        temp_path = os.path.join(UPLOAD_FOLDER, f"temp_{datetime.now().timestamp()}_input.pdf")
        file.save(temp_path)
        
        try:
            total_pages = get_pdf_page_count(temp_path)
            page_indices = parse_page_range(request.form.get('pageRange', ''), total_pages)
            images = render_pdf_pages(temp_path, dpi=150, page_indices=page_indices)
            images_data = []
            image_format = request.form.get('format', 'jpg').lower()
            if image_format not in {'jpg', 'jpeg', 'png', 'webp'}:
                image_format = 'jpg'
            pil_format = 'JPEG' if image_format in {'jpg', 'jpeg'} else image_format.upper()
            quality = int(request.form.get('quality', '85'))
            
            for idx, image in images:
                encoded = image_to_base64(image, pil_format, quality)
                images_data.append({
                    'page': idx + 1,
                    'image': encoded
                })
            
            return jsonify({'images': images_data, 'total': total_pages, 'returned': len(images_data)})
        
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500

# ==================== UNIVERSAL PREVIEWS ====================
@app.route('/api/preview/image', methods=['POST'])
@limiter.limit("5 per minute")
def preview_image():
    try:
        file = request.files.get('file')
        if not file or not allowed_file(file, ALLOWED_IMAGES):
            return jsonify({'error': 'Invalid image file'}), 400
        temp_path = save_uploaded_file(file, '')
        try:
            image = Image.open(temp_path).convert('RGB')
            image.thumbnail((520, 720))
            return jsonify({
                'kind': 'image',
                'total': 1,
                'items': [{
                    'label': 'Image 1',
                    'thumbnail': image_to_base64(image, 'JPEG', 86),
                    'text': file.filename
                }],
                'metadata': {'name': file.filename, 'size': os.path.getsize(temp_path)}
            })
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500

@app.route('/api/preview/document', methods=['POST'])
@limiter.limit("5 per minute")
def preview_document():
    try:
        file = request.files.get('file')
        if not file or not allowed_file(file, ALLOWED_DOCS):
            return jsonify({'error': 'Invalid document'}), 400
        if not file.filename.lower().endswith('.docx'):
            return jsonify({
                'kind': 'document',
                'total': 1,
                'items': [{'label': 'Document preview', 'text': 'DOC preview requires LibreOffice. Processing will use a safe placeholder.'}],
                'metadata': {'name': file.filename}
            })
        temp_path = save_uploaded_file(file, '.docx')
        try:
            items = document_preview_items(temp_path)
            return jsonify({'kind': 'document', 'total': len(items), 'items': items, 'metadata': {'name': file.filename}})
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500

@app.route('/api/preview/spreadsheet', methods=['POST'])
@limiter.limit("5 per minute")
def preview_spreadsheet():
    try:
        file = request.files.get('file')
        if not file or not allowed_file(file, ALLOWED_SPREADSHEETS):
            return jsonify({'error': 'Invalid spreadsheet'}), 400

        ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else 'xlsx'
        temp_path = save_uploaded_file(file, '.' + ext)
        try:
            # Preferred: render real worksheets (formatting, merged cells) via
            # LibreOffice. Supports xls/xlsx/csv.
            rendered = office_to_pdf_thumbnails(temp_path, max_pages=40, label_prefix='Sheet')
            if rendered:
                return jsonify({'kind': 'spreadsheet', 'total': len(rendered), 'items': rendered, 'metadata': {'name': file.filename}})

            # Fallback: extract real cell rows (xlsx only) so we still show data,
            # not a placeholder.
            if ext == 'xlsx':
                items = spreadsheet_preview_items(temp_path)
                return jsonify({'kind': 'spreadsheet', 'total': len(items), 'items': items, 'metadata': {'name': file.filename}})

            return jsonify({
                'kind': 'spreadsheet',
                'total': 1,
                'items': [{'label': 'Workbook preview', 'rows': [['Full preview for this format needs LibreOffice on the server.']], 'text': 'Full preview for this format needs LibreOffice on the server.'}],
                'metadata': {'name': file.filename}
            })
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500

@app.route('/api/preview/presentation', methods=['POST'])
@limiter.limit("5 per minute")
def preview_presentation():
    try:
        file = request.files.get('file')
        if not file or not allowed_file(file, ALLOWED_PRESENTATIONS):
            return jsonify({'error': 'Invalid presentation'}), 400

        ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else 'pptx'
        temp_path = save_uploaded_file(file, '.' + ext)
        try:
            # Preferred: render real slide images via LibreOffice. Supports ppt/pptx.
            rendered = office_to_pdf_thumbnails(temp_path, max_pages=80, label_prefix='Slide')
            if rendered:
                return jsonify({'kind': 'presentation', 'total': len(rendered), 'items': rendered, 'metadata': {'name': file.filename}})

            # Fallback: extract slide text outline (pptx only).
            if ext == 'pptx':
                items = presentation_preview_items(temp_path)
                return jsonify({'kind': 'presentation', 'total': len(items), 'items': items, 'metadata': {'name': file.filename}})

            return jsonify({
                'kind': 'presentation',
                'total': 1,
                'items': [{'label': 'Slide preview', 'text': 'Full slide rendering for this format needs LibreOffice on the server.'}],
                'metadata': {'name': file.filename}
            })
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500

@app.route('/api/output/preview', methods=['POST'])
@limiter.limit("5 per minute")
def preview_output():
    file = request.files.get('file')
    if not file or not file.filename:
        return jsonify({'error': 'No file provided'}), 400
    extension = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if extension == 'pdf':
        return pdf_to_jpg()
    if extension in ALLOWED_IMAGES:
        return preview_image()
    if extension in ALLOWED_DOCS:
        return preview_document()
    if extension in ALLOWED_SPREADSHEETS:
        return preview_spreadsheet()
    if extension in ALLOWED_PRESENTATIONS:
        return preview_presentation()
    return jsonify({
        'kind': 'generic',
        'total': 1,
        'items': [{'label': file.filename, 'text': 'Preview metadata only.'}],
        'metadata': {'name': file.filename}
    })

# ==================== JPG TO PDF ====================
@app.route('/api/convert/image-to-pdf', methods=['POST'])
@app.route('/api/jpg-to-pdf', methods=['POST'])
@limiter.limit("5 per minute")
def jpg_to_pdf():
    """Convert JPG images to PDF"""
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        if not files:
            return jsonify({'error': 'No image files provided'}), 400
        
        images = []
        temp_paths = []
        
        try:
            for file in files:
                if file and allowed_file(file, ALLOWED_IMAGES):
                    temp_path = os.path.join(UPLOAD_FOLDER, f"temp_{datetime.now().timestamp()}_{secure_filename(file.filename)}")
                    file.save(temp_path)
                    temp_paths.append(temp_path)
                    
                    img = Image.open(temp_path)
                    if img.mode in ('RGBA', 'LA', 'P'):
                        rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                        rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                        images.append(rgb_img)
                    else:
                        images.append(img)
            
            if not images:
                return jsonify({'error': 'No valid images provided'}), 400
            
            output = io.BytesIO()
            images[0].save(output, format='PDF', save_all=True, append_images=images[1:], duration=100, loop=0)
            output.seek(0)
            
            return send_file(
                output,
                mimetype='application/pdf',
                as_attachment=True,
                download_name='images.pdf'
            )
        
        finally:
            for path in temp_paths:
                if os.path.exists(path):
                    os.remove(path)
    
    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500

# ==================== WORD TO PDF ====================
@app.route('/api/convert/word-to-pdf', methods=['POST'])
@app.route('/api/word-to-pdf', methods=['POST'])
@limiter.limit("5 per minute")
def word_to_pdf():
    """Convert a Word document to PDF.

    Uses LibreOffice for a high-fidelity, layout-accurate conversion that
    matches the on-screen preview. Falls back to a basic text-based PDF
    (DOCX only) when LibreOffice is unavailable, busy, or the file is too
    large to convert safely on a low-memory instance."""
    temp_path = None
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if not file or not allowed_file(file, ALLOWED_DOCS):
            return jsonify({'error': 'Invalid Word document'}), 400

        is_docx = file.filename.lower().endswith('.docx')
        suffix = '.docx' if is_docx else '.doc'

        # Size guard: save_uploaded_file enforces MAX_DOC_SIZE and raises
        # ValueError, which we surface as a clear 413 instead of crashing.
        try:
            temp_path = save_uploaded_file(file, suffix)
        except ValueError as size_error:
            return jsonify({'error': str(size_error)}), 413

        try:
            # Skip the RAM-heavy LibreOffice path for large DOCX files; the
            # lightweight text fallback handles them without risking OOM.
            file_size = os.path.getsize(temp_path)
            use_libreoffice = file_size <= LIBREOFFICE_MAX_BYTES

            if use_libreoffice:
                try:
                    pdf_bytes = libreoffice_convert_to_pdf(temp_path)
                except ConversionBusyError:
                    return jsonify({'error': 'The server is busy converting another document. Please try again in a few seconds.'}), 503
                if pdf_bytes:
                    return send_file(
                        io.BytesIO(pdf_bytes),
                        mimetype='application/pdf',
                        as_attachment=True,
                        download_name='converted.pdf'
                    )

            # Fallback: basic text extraction (DOCX only).
            if not is_docx:
                if file_size > LIBREOFFICE_MAX_BYTES:
                    return jsonify({'error': 'This .doc file is too large to convert on the current plan. Please upload a smaller file or convert it to .docx.'}), 413
                return jsonify({'error': 'Legacy .doc conversion requires LibreOffice, which is not available on this server. Please upload a .docx file.'}), 400

            document = Document(temp_path)
            output = io.BytesIO()
            pdf = canvas.Canvas(output, pagesize=letter)
            width, height = letter
            x = 72
            y = height - 72
            line_height = 14
            max_chars = 95

            pdf.setFont('Helvetica', 11)
            for paragraph in document.paragraphs:
                text = paragraph.text.strip()
                lines = [''] if not text else [text[i:i + max_chars] for i in range(0, len(text), max_chars)]

                for line in lines:
                    if y < 72:
                        pdf.showPage()
                        pdf.setFont('Helvetica', 11)
                        y = height - 72
                    pdf.drawString(x, y, line)
                    y -= line_height
                y -= 4

            pdf.save()
            output.seek(0)

            return send_file(
                output,
                mimetype='application/pdf',
                as_attachment=True,
                download_name='converted.pdf'
            )
        
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    except Exception as e:
        if 'Package not found' in str(e):
            return jsonify({'error': 'Invalid or corrupted DOCX file. Please ensure the file is a valid Word document, not a PDF or .doc file renamed to .docx.'}), 400
        return jsonify({'error': 'Unknown Error'}), 500

# ==================== PDF TO WORD ====================
@app.route('/api/convert/pdf-to-word', methods=['POST'])
@app.route('/api/pdf-to-word', methods=['POST'])
@limiter.limit("5 per minute")
def pdf_to_word():
    """Convert PDF text to a basic DOCX document"""
    temp_path = None
    try:
        file = request.files.get('file')
        if not file or not allowed_file(file, ALLOWED_PDF):
            return jsonify({'error': 'Invalid PDF file'}), 400

        temp_path = save_uploaded_file(file, '.pdf')
        reader = PdfReader(temp_path)
        page_indices = parse_page_range(request.form.get('pageRange', ''), len(reader.pages))

        document = Document()
        for output_index, page_index in enumerate(page_indices):
            page = reader.pages[page_index]
            if output_index > 0:
                document.add_page_break()
            document.add_heading(f'Page {page_index + 1}', level=2)
            text = page.extract_text() or ''
            if text.strip():
                for line in text.splitlines():
                    clean = ''.join(c for c in line if ord(c) >= 32 or c in '\t\n\r')
                    if clean.strip():
                        document.add_paragraph(clean)
            else:
                document.add_paragraph('[No extractable text on this page]')

        output = io.BytesIO()
        document.save(output)
        output.seek(0)

        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name='converted.docx'
        )
    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

# ==================== PDF TO EXCEL ====================
@app.route('/api/convert/pdf-to-excel', methods=['POST'])
@app.route('/api/pdf-to-excel', methods=['POST'])
@limiter.limit("5 per minute")
def pdf_to_excel():
    """Convert PDF text into a simple XLSX workbook"""
    temp_path = None
    try:
        file = request.files.get('file')
        if not file or not allowed_file(file, ALLOWED_PDF):
            return jsonify({'error': 'Invalid PDF file'}), 400

        temp_path = save_uploaded_file(file, '.pdf')
        reader = PdfReader(temp_path)
        page_indices = parse_page_range(request.form.get('pageRange', ''), len(reader.pages))
        sheets = []
        for page_index in page_indices:
            text = reader.pages[page_index].extract_text() or '[No extractable text on this page]'
            rows = [['Line', 'Text']]
            for line_number, line in enumerate(text.splitlines()[:250], start=1):
                if line.strip():
                    rows.append([line_number, line.strip()])
            sheets.append({'name': f'Page {page_index + 1}', 'rows': rows})

        output = create_basic_xlsx(sheets or [{'name': 'PDF', 'rows': [['Text'], ['No extractable text']]}])
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name='converted.xlsx'
        )
    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

# ==================== EXCEL TO PDF ====================
@app.route('/api/convert/excel-to-pdf', methods=['POST'])
@app.route('/api/excel-to-pdf', methods=['POST'])
@limiter.limit("5 per minute")
def excel_to_pdf():
    """Convert an XLSX workbook preview into a simple PDF"""
    temp_path = None
    try:
        file = request.files.get('file')
        if not file or not allowed_file(file, ALLOWED_SPREADSHEETS):
            return jsonify({'error': 'Invalid spreadsheet'}), 400

        if not file.filename.lower().endswith('.xlsx'):
            sheets = [{'name': 'Workbook', 'rows': [['XLS conversion requires LibreOffice'], [file.filename]]}]
        else:
            temp_path = save_uploaded_file(file, '.xlsx')
            sheets = parse_xlsx_sheets(temp_path)

        output = io.BytesIO()
        pdf = canvas.Canvas(output, pagesize=page_size_from_request())
        width, height = pdf._pagesize
        for sheet_index, sheet in enumerate(sheets):
            if sheet_index > 0:
                pdf.showPage()
            pdf.setFont('Helvetica-Bold', 14)
            pdf.drawString(48, height - 54, sheet['name'])
            pdf.setFont('Helvetica', 9)
            y = height - 82
            for row in sheet['rows'][:42]:
                line = '   |   '.join(str(cell) for cell in row[:8])
                y = draw_wrapped(pdf, line, 48, y, max_chars=110, line_height=11, min_y=48)
        pdf.save()
        output.seek(0)
        return send_file(output, mimetype='application/pdf', as_attachment=True, download_name='converted.pdf')
    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

# ==================== PDF TO POWERPOINT ====================
@app.route('/api/convert/pdf-to-powerpoint', methods=['POST'])
@app.route('/api/pdf-to-powerpoint', methods=['POST'])
@limiter.limit("5 per minute")
def pdf_to_powerpoint():
    """Convert PDF text pages into a basic PPTX deck"""
    temp_path = None
    try:
        file = request.files.get('file')
        if not file or not allowed_file(file, ALLOWED_PDF):
            return jsonify({'error': 'Invalid PDF file'}), 400

        temp_path = save_uploaded_file(file, '.pdf')
        reader = PdfReader(temp_path)
        page_indices = parse_page_range(request.form.get('pageRange', ''), len(reader.pages))
        slides = []
        for page_index in page_indices:
            text = reader.pages[page_index].extract_text() or '[No extractable text on this page]'
            slides.append(f'Page {page_index + 1}\n\n{text}')
        output = create_basic_pptx(slides or ['No extractable text'])
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation',
            as_attachment=True,
            download_name='converted.pptx'
        )
    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

# ==================== POWERPOINT TO PDF ====================
@app.route('/api/convert/powerpoint-to-pdf', methods=['POST'])
@app.route('/api/powerpoint-to-pdf', methods=['POST'])
@app.route('/api/ppt-to-pdf', methods=['POST'])
@limiter.limit("5 per minute")
def powerpoint_to_pdf():
    """Convert PPTX slide text into a simple PDF"""
    temp_path = None
    try:
        file = request.files.get('file')
        if not file or not allowed_file(file, ALLOWED_PRESENTATIONS):
            return jsonify({'error': 'Invalid presentation'}), 400

        if file.filename.lower().endswith('.pptx'):
            temp_path = save_uploaded_file(file, '.pptx')
            slides = parse_pptx_slides(temp_path)
        else:
            
            slides = [f'PPT conversion requires LibreOffice.\n{file.filename}']

        page_indices = parse_page_range(request.form.get('pageRange', ''), len(slides))
        output = io.BytesIO()
        pdf = canvas.Canvas(output, pagesize=page_size_from_request())
        width, height = pdf._pagesize
        for output_index, slide_index in enumerate(page_indices):
            if output_index > 0:
                pdf.showPage()
            pdf.setFont('Helvetica-Bold', 16)
            pdf.drawString(72, height - 72, f'Slide {slide_index + 1}')
            pdf.setFont('Helvetica', 11)
            draw_wrapped(pdf, slides[slide_index], 72, height - 104, max_chars=95, line_height=14, min_y=72)
        pdf.save()
        output.seek(0)
        return send_file(output, mimetype='application/pdf', as_attachment=True, download_name='converted.pdf')
    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

# ==================== OCR ====================
@app.route('/api/ocr', methods=['POST'])
@app.route('/api/pdf/ocr', methods=['POST'])
@limiter.limit("5 per minute")
def ocr():
    """Return extractable text for PDFs and a graceful placeholder for images"""
    temp_path = None
    try:
        file = request.files.get('file')
        if not file or not file.filename:
            return jsonify({'error': 'No file provided'}), 400

        extension = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
        lang = request.form.get('lang', 'eng')
        output_type = request.form.get('outputType', 'txt')

        if extension == 'pdf':
            temp_path = save_uploaded_file(file, '.pdf')
            reader = PdfReader(temp_path)
            page_indices = parse_page_range(request.form.get('pageRange', ''), len(reader.pages))
            parts = []
            for page_index in page_indices:
                text = reader.pages[page_index].extract_text() or '[No extractable text on this page]'
                parts.append(f'--- Page {page_index + 1} ---\n{text}')
            text = '\n\n'.join(parts)
        elif extension in ALLOWED_IMAGES:
            text = f'OCR placeholder for {file.filename}\nLanguage: {lang}\nInstall Tesseract OCR on the backend for real image text extraction.'
        else:
            return jsonify({'error': 'OCR supports PDF and image files'}), 400

        return jsonify({
            'text': text,
            'outputType': output_type,
            'metadata': {'language': lang, 'filename': file.filename}
        })
    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/api/pdf/extract', methods=['POST'])
@app.route('/api/extract-pages', methods=['POST'])
@limiter.limit("5 per minute")
def extract_pages():
    """Extract selected pages into a new PDF"""
    temp_path = None

    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if not file or not allowed_file(file, ALLOWED_PDF):
            return jsonify({'error': 'Invalid PDF file'}), 400

        temp_path = save_uploaded_file(file, '.pdf')
        reader = PdfReader(temp_path)
        page_indices = parse_page_range(request.form.get('pageRange', ''), len(reader.pages))
        if not page_indices:
            return jsonify({'error': 'No valid pages selected'}), 400

        writer = PdfWriter()
        for page_index in page_indices:
            writer.add_page(reader.pages[page_index])

        return send_writer_pdf(writer, 'extracted-pages.pdf')

    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/api/pdf/delete-pages', methods=['POST'])
@app.route('/api/delete-pages', methods=['POST'])
@limiter.limit("5 per minute")
def delete_pages():
    """Delete selected pages from a PDF"""
    temp_path = None

    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if not file or not allowed_file(file, ALLOWED_PDF):
            return jsonify({'error': 'Invalid PDF file'}), 400

        temp_path = save_uploaded_file(file, '.pdf')
        reader = PdfReader(temp_path)
        remove_indices = set(parse_page_range(request.form.get('pageRange', ''), len(reader.pages)))
        if not remove_indices:
            return jsonify({'error': 'Enter pages to delete'}), 400

        writer = PdfWriter()
        for page_index, page in enumerate(reader.pages):
            if page_index not in remove_indices:
                writer.add_page(page)

        if len(writer.pages) == 0:
            return jsonify({'error': 'Cannot delete every page'}), 400

        return send_writer_pdf(writer, 'pages-deleted.pdf')

    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/api/pdf/rotate', methods=['POST'])
@app.route('/api/rotate-pdf', methods=['POST'])
@limiter.limit("5 per minute")
def rotate_pdf():
    """Rotate every page in a PDF"""
    temp_path = None

    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if not file or not allowed_file(file, ALLOWED_PDF):
            return jsonify({'error': 'Invalid PDF file'}), 400

        rotation = int(request.form.get('rotation', '90'))
        if rotation not in {90, 180, 270}:
            return jsonify({'error': 'Rotation must be 90, 180, or 270 degrees'}), 400

        temp_path = save_uploaded_file(file, '.pdf')
        reader = PdfReader(temp_path)
        selected = set(parse_page_range(request.form.get('pageRange', ''), len(reader.pages)))
        writer = PdfWriter()
        for page_index, page in enumerate(reader.pages):
            writer.add_page(page.rotate(rotation) if page_index in selected else page)

        return send_writer_pdf(writer, 'rotated.pdf')

    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/api/pdf/apply-editor-edits', methods=['POST'])
@limiter.limit("60 per minute")
def apply_editor_edits():
    """Flatten PDF editor layers into a PDF output."""
    temp_path = None
    output_path = None

    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if not file or not allowed_file(file, ALLOWED_PDF):
            return jsonify({'error': 'Invalid PDF file'}), 400

        pymupdf = get_pymupdf()
        if pymupdf is None:
            return jsonify({'error': 'PDF editor export requires PyMuPDF'}), 503

        layers = json.loads(request.form.get('layers', '[]') or '[]')
        if not isinstance(layers, list):
            layers = []

        temp_path = save_uploaded_file(file, '.pdf')
        doc = pymupdf.open(temp_path)

        for layer in layers:
            if not isinstance(layer, dict):
                continue
            if layer.get('temporary') and not layer.get('applied'):
                continue
            page_index = int(layer.get('pageIndex') or 0)
            if page_index < 0 or page_index >= len(doc):
                continue

            page = doc[page_index]
            page_rect = page.rect
            x_scale = page_rect.width / 680
            y_scale = page_rect.height / 900
            layer_type = str(layer.get('type') or '')
            text = str(layer.get('text') or '')
            rect = editor_layer_rect(pymupdf, layer, x_scale, y_scale)
            color = editor_hex_color(layer.get('color') or '#0f172a')
            opacity = max(0.05, min(float(layer.get('opacity') or 1), 1))

            try:
                if layer_type == 'crop':
                    crop_rect = rect & page_rect
                    if not crop_rect.is_empty:
                        page.set_cropbox(crop_rect)
                elif layer_type == 'redact':
                    page.add_redact_annot(rect, fill=(0, 0, 0))
                    page.apply_redactions()
                elif layer_type == 'highlight':
                    page.draw_rect(rect, color=None, fill=(1, 0.86, 0.12), overlay=True)
                elif layer_type == 'draw':
                    draw_paths = json.loads(text or '[]')
                    if isinstance(draw_paths, list):
                        for path in draw_paths:
                            points = []
                            if isinstance(path, list):
                                for point in path:
                                    if isinstance(point, dict):
                                        points.append(pymupdf.Point(float(point.get('x', 0)) * x_scale, float(point.get('y', 0)) * y_scale))
                            for start, end in zip(points, points[1:]):
                                page.draw_line(start, end, color=color, width=2.4, overlay=True)
                elif layer_type == 'add-image' and text.startswith('data:image/'):
                    image_bytes = base64.b64decode(text.split(',', 1)[1])
                    page.insert_image(rect, stream=image_bytes, keep_proportion=True, overlay=True)
                elif layer_type in {'edit', 'add-text', 'annotate', 'watermark', 'page-numbers'}:
                    font_size = float(layer.get('fontSize') or 0)
                    if font_size <= 0:
                        font_size = 11
                        if layer_type in {'edit', 'add-text', 'annotate'}:
                            font_size = max(8, min(28, rect.height * 0.32))
                        elif layer_type == 'watermark':
                            font_size = max(18, min(54, rect.height * 0.52))
                    font_size = max(6, min(font_size, 96))
                    align_map = {'left': 0, 'center': 1, 'right': 2, 'justify': 3}
                    align = align_map.get(str(layer.get('align') or 'center'), 1)
                    page.insert_textbox(
                        rect,
                        text,
                        fontsize=font_size,
                        fontname='helv',
                        color=color,
                        align=align,
                        overlay=True,
                    )
            except Exception as layer_error:
                print(f"Skipping editor layer {layer_type}: {layer_error}")

        output_path = os.path.join(UPLOAD_FOLDER, f"edited_{datetime.now().timestamp()}.pdf")
        doc.save(output_path, garbage=4, deflate=True)
        doc.close()

        return send_file(output_path, mimetype='application/pdf', as_attachment=True, download_name='edited.pdf')

    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

def editor_layer_rect(pymupdf, layer, x_scale, y_scale):
    x = float(layer.get('x') or 0) * x_scale
    y = float(layer.get('y') or 0) * y_scale
    width = max(1, float(layer.get('width') or 1)) * x_scale
    height = max(1, float(layer.get('height') or 1)) * y_scale
    return pymupdf.Rect(x, y, x + width, y + height)

def editor_hex_color(value):
    raw = str(value or '#0f172a').strip()
    if raw.startswith('#'):
        raw = raw[1:]
    if len(raw) == 3:
        raw = ''.join(ch * 2 for ch in raw)
    try:
        return tuple(int(raw[index:index + 2], 16) / 255 for index in (0, 2, 4))
    except Exception:
        return (0.06, 0.09, 0.16)

@app.route('/api/lock-pdf', methods=['POST'])
@app.route('/api/protect-pdf', methods=['POST'])
@app.route('/api/encrypt-pdf', methods=['POST'])
@limiter.limit("5 per minute")
def encrypt_pdf():
    """Password protect a PDF"""
    temp_path = None

    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        password = request.form.get('password', '')
        if not password:
            return jsonify({'error': 'Password is required'}), 400

        file = request.files['file']
        if not file or not allowed_file(file, ALLOWED_PDF):
            return jsonify({'error': 'Invalid PDF file'}), 400

        temp_path = save_uploaded_file(file, '.pdf')
        reader = PdfReader(temp_path)
        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)
        writer.encrypt(password)

        return send_writer_pdf(writer, 'protected.pdf')

    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/api/unlock-pdf', methods=['POST'])
@app.route('/api/remove-password', methods=['POST'])
@app.route('/api/decrypt-pdf', methods=['POST'])
@limiter.limit("5 per minute")
def decrypt_pdf():
    """Remove password protection from a PDF"""
    temp_path = None

    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        password = request.form.get('password', '')
        file = request.files['file']
        if not file or not allowed_file(file, ALLOWED_PDF):
            return jsonify({'error': 'Invalid PDF file'}), 400

        temp_path = save_uploaded_file(file, '.pdf')
        reader = PdfReader(temp_path)
        if reader.is_encrypted:
            if not password:
                return jsonify({'error': 'Password is required'}), 400
            if reader.decrypt(password) == 0:
                return jsonify({'error': 'Incorrect password'}), 400

        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)

        return send_writer_pdf(writer, 'unlocked.pdf')

    except Exception as e:
        return jsonify({'error': 'Unknown Error'}), 500

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/ai/process', methods=['POST'])
def ai_process():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No JSON payload provided'}), 400
            
        file_base64 = data.get('fileBase64')
        tool_id = data.get('toolId')
        model = data.get('model', 'gemini-3.5-flash')
        allowed_models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-flash-latest', 'gemini-flash-lite-latest']
        if model not in allowed_models:
            model = 'gemini-3.5-flash'
        
        if not file_base64:
            return jsonify({'error': 'No file provided'}), 400
            
        import base64
        import fitz  # PyMuPDF
        
        pdf_bytes = base64.b64decode(file_base64)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        document_text = ""
        for page in doc:
            document_text += page.get_text()
            
        # extract settings
        required_sections = []
        if str(data.get('includeKeyPoints', '')).lower() == 'true': required_sections.append('Key Points')
        if str(data.get('includeImportantDates', '')).lower() == 'true': required_sections.append('Important Dates')
        if str(data.get('includeConclusion', '')).lower() == 'true': required_sections.append('Main Conclusion')
        if str(data.get('includeActionItems', '')).lower() == 'true': required_sections.append('Action Items')
        if str(data.get('includePageReferences', '')).lower() == 'true': required_sections.append('Page References')
        if str(data.get('includeSimpleExplanation', '')).lower() == 'true': required_sections.append('Simple Explanation')
        
        system_instruction = ""
        additional_prompt = ""
        
        is_json_output = False

        if tool_id == 'resume-analyzer':
            system_instruction = "You are DocNova AI, an expert HR professional and Resume Analyzer. Score the resume, identify key strengths, list missing skills based on standard industry requirements, and provide actionable improvements."
        elif tool_id == 'quiz-generator':
            system_instruction = "You are DocNova AI, an expert educator. Generate a comprehensive multiple-choice quiz based ONLY on the provided document text. Include an answer key at the end."
        elif tool_id == 'flashcards':
            system_instruction = "You are DocNova AI, an expert study assistant. Generate a series of Flashcards (Question and Answer format) from the provided text to help the user memorize key concepts."
        elif tool_id == 'translator':
            lang = data.get('language', 'the requested language')
            system_instruction = f"You are DocNova AI, an expert translator. Translate the following text into {lang}. Preserve the original formatting and meaning as much as possible."
        elif tool_id == 'contract-review':
            system_instruction = "You are DocNova AI, an expert legal assistant. Review the provided contract. Highlight potential risks, loopholes, obligations, and key terms. Use simple language to explain complex legal jargon."
        elif tool_id == 'table-extractor':
            system_instruction = "You are DocNova AI. Your task is to identify any tabular or structured data in the text and format it cleanly into Markdown tables."
        elif tool_id == 'pdf-chat':
            system_instruction = "You are DocNova AI, an expert document assistant. Answer the user's questions based ONLY on the provided document text. If the answer is not in the text, say so."
            additional_prompt = "Please summarize the document briefly and suggest 3 questions the user could ask about it to start the chat."
        elif tool_id == 'email-writer':
            tone = data.get('tone', 'Professional')
            system_instruction = (
                "You are DocNova AI, an expert email copywriter. Using ONLY the provided document as context, "
                "draft a clear, well-structured email. Do not invent facts that are not supported by the document. "
                "Format the output in clean Markdown with a **Subject:** line first, then the email body with a greeting, "
                "concise paragraphs, and a professional sign-off. Keep it natural and ready to send."
            )
            additional_prompt = f"Write the email in a {tone} tone. If a recipient or purpose is implied by the document, address it directly."
        elif tool_id == 'smart-rewriter':
            tone = data.get('tone', 'Professional')
            system_instruction = (
                "You are DocNova AI, an expert editor and rewriter. Rewrite the provided document text to improve clarity, "
                "flow, grammar, and readability while strictly preserving the original meaning and context. Do not add new "
                "information. Return the rewritten text in clean Markdown, preserving headings, lists, and structure where present."
            )
            additional_prompt = f"Rewrite in a {tone} tone. Keep the same language as the source unless a different output language is requested."
        else:
            is_json_output = True
            system_instruction = "You are DocNova AI, an expert PDF summarization assistant. Summarize only from the provided document text. Do not invent information. Create a structured summary based on the user's settings. You MUST format the output as a RAW JSON object with this exact structure: {\"overview\": \"string summary\", \"keyPoints\": [{\"title\": \"string\", \"desc\": \"string\"}], \"importantDates\": [{\"date\": \"string like MMM DD, YYYY\", \"title\": \"string\"}], \"actionItems\": [{\"text\": \"string\", \"priority\": \"High|Medium|Low\"}], \"conclusion\": \"string\"}."
            
        req_sections_str = "\n".join(required_sections) if required_sections else "Generate standard output for this tool."
        summary_len_str = f"Summary length: {data.get('summaryLength')}" if data.get('summaryLength') else ""
        output_style_str = f"Output style: {data.get('outputStyle')}" if data.get('outputStyle') else ""
        
        format_instruction = "Generate the result according to these settings. Output MUST be valid JSON as per system instructions." if is_json_output else "Generate the result according to these settings. Use Markdown headers (##)."
        
        user_prompt = f"""
        Document text:
        {document_text[:100000]}
        
        Settings:
        Tone: {data.get('tone', 'Professional')}
        Language: {data.get('language', 'English')}
        {summary_len_str}
        {output_style_str}
        
        Required sections to generate:
        {req_sections_str}
        
        {additional_prompt}
        
        {format_instruction}
        """
        
        from google import genai
        from google.genai import types
        import os
        from collections import defaultdict
        
        # Simple in-memory token budget per IP (reset daily in production via cron/redis)
        if not hasattr(app, 'token_budgets'):
            app.token_budgets = defaultdict(int)
        
        client_ip = request.remote_addr
        if app.token_budgets[client_ip] > 50000:
            return jsonify({'error': 'Daily token budget exceeded. Please try again later.'}), 429
        
        client = genai.Client() # Uses GEMINI_API_KEY from env
        
        config_args = {
            "system_instruction": system_instruction,
            "temperature": 0.2,
            "max_output_tokens": 2048, # Prevent runaway costs
        }
        if is_json_output:
            config_args["response_mime_type"] = "application/json"
            
        models_to_try = [model]
        for m in allowed_models:
            if m != model and 'pro' not in m: # Skip Pro models in fallback to avoid 0-quota traps
                models_to_try.append(m)
                
        last_error = None
        for fallback_model in models_to_try:
            try:
                print(f"Trying model: {fallback_model}...")
                response = client.models.generate_content(
                    model=fallback_model,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(**config_args)
                )
                
                # Log usage and update budget
                used_tokens = response.usage_metadata.total_token_count if response.usage_metadata else 0
                app.token_budgets[client_ip] += used_tokens
                print(f"[SECURITY] LLM Usage Log - IP: {client_ip}, Model: {fallback_model}, Tokens Used: {used_tokens}, Total Budget Consumed: {app.token_budgets[client_ip]}/50000")
                
                return jsonify({'success': True, 'result': response.text})
            except Exception as e:
                error_str = str(e)
                last_error = error_str
                print(f'Gemini Error on {fallback_model}:', error_str)
                continue # Always try next model, whether 429 Quota or 404 Not Found!
                
        return jsonify({'error': 'API Quota reached for all available free models. Please try again after some time.'}), 429

    except Exception as e:
        error_str = str(e)
        import traceback
        print('Gemini Unexpected error:', e)
        traceback.print_exc()
        return jsonify({'error': f'Failed to process document: {error_str}'}), 500

@app.route('/api/ai/chat', methods=['POST'])
@validate_request(AIChatSchema)
def ai_chat():
    try:
        from google import genai
        from google.genai import types
        import json
        from collections import defaultdict
        
        # Simple in-memory token budget per IP (reset daily in production via cron/redis)
        if not hasattr(app, 'token_budgets'):
            app.token_budgets = defaultdict(int)
        
        client_ip = request.remote_addr
        if app.token_budgets[client_ip] > 50000:
            return jsonify({'error': 'Daily token budget exceeded. Please try again later.'}), 429

        file_part = None
        data = getattr(request, 'validated_data', {})
        messages = data.get('messages', [])
        model = data.get('model', 'gemini-3.5-flash')

        if not request.is_json:
            uploaded_file = request.files.get('file')
            if uploaded_file and uploaded_file.filename:
                file_bytes = uploaded_file.read()
                mime_type = uploaded_file.content_type or 'application/pdf'
                file_part = types.Part.from_bytes(data=file_bytes, mime_type=mime_type)

        if not messages:
            return jsonify({'error': 'No messages provided'}), 400
            
        allowed_models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-flash-latest', 'gemini-flash-lite-latest']
        if model not in allowed_models:
            model = 'gemini-3.5-flash'
            
        system_instruction = "You are the DocNova AI Assistant. You are a helpful, knowledgeable, and polite assistant integrated into a web app called DocNova PDF Tools. DocNova is a platform for manipulating, converting, organizing, and editing PDF documents."
        
        client = genai.Client()
        
        # Convert messages to Gemini format
        conversation_text = ""
        for m in messages[:-1]:
            role = "User" if m['role'] == 'user' else "Assistant"
            conversation_text += f"{role}: {m['content']}\n\n"
            
        current_message = messages[-1]['content']
        full_prompt = f"Previous conversation:\n{conversation_text}\n\nUser: {current_message}\n\nAssistant:" if conversation_text else current_message
        
        contents = [file_part, full_prompt] if file_part else full_prompt
        
        models_to_try = [model]
        for m in allowed_models:
            if m != model and 'pro' not in m:
                models_to_try.append(m)
                
        last_error = None
        for fallback_model in models_to_try:
            try:
                print(f"Trying chat model: {fallback_model}...")
                response = client.models.generate_content(
                    model=fallback_model,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.7,
                        max_output_tokens=2048, # Prevent runaway costs
                    )
                )
                
                # Log usage and update budget
                used_tokens = response.usage_metadata.total_token_count if hasattr(response, 'usage_metadata') and response.usage_metadata else 0
                app.token_budgets[client_ip] += used_tokens
                print(f"[SECURITY] LLM Usage Log - IP: {client_ip}, Model: {fallback_model}, Tokens Used: {used_tokens}, Total Budget Consumed: {app.token_budgets[client_ip]}/50000")
                
                return jsonify({'success': True, 'result': response.text})
            except Exception as e:
                error_str = str(e)
                last_error = error_str
                print(f'Gemini Error on chat {fallback_model}:', error_str)
                continue # Always try next model!
                
        return jsonify({'error': 'API Quota reached for all available free models. Please try again after some time.'}), 429

    except Exception as e:
        error_str = str(e)
        print('Gemini Unexpected chat error:', e)
        return jsonify({'error': 'Failed to process chat'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Pre-deploy gate: Debug mode and development logging are off in production
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
