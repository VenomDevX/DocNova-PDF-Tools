# DocNova PDF Tools - Backend API

A Flask-based REST API for PDF processing tools including merge, split, compress, and format conversion.

## 📋 Features

- **Merge PDF** - Combine multiple PDFs into one
- **Compress PDF** - Reduce PDF file size while maintaining quality
- **Split PDF** - Extract individual pages from a PDF
- **PDF to JPG** - Convert PDF pages to JPEG images
- **JPG to PDF** - Convert images to PDF
- **Word to PDF** - Convert DOCX documents to PDF (requires setup)
- **PDF to Word** - Convert PDF to DOCX (requires pdf2docx)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Optional: Install System Dependencies

For PDF to Image conversion, you need poppler:

**Windows (Recommended - via chocolatey):**
```bash
choco install poppler
```

Or download from: https://github.com/oschwartz10612/poppler-windows/releases/

**Mac:**
```bash
brew install poppler
```

**Linux:**
```bash
sudo apt-get install poppler-utils
```

### 3. Run the Server

```bash
python app.py
```

Server runs at: **http://localhost:5000**

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Merge PDFs
```
POST /api/merge-pdf
Content-Type: multipart/form-data
Body: files (multiple PDF files)
```

### Compress PDF
```
POST /api/compress-pdf
Content-Type: multipart/form-data
Body: file (PDF file)
```

### Split PDF
```
POST /api/split-pdf
Content-Type: multipart/form-data
Body: file (PDF file)
Response: JSON with base64-encoded PDF pages
```

### PDF to JPG
```
POST /api/pdf-to-jpg
Content-Type: multipart/form-data
Body: file (PDF file)
Response: JSON with base64-encoded JPG images
```

### JPG to PDF
```
POST /api/jpg-to-pdf
Content-Type: multipart/form-data
Body: files (multiple JPG/JPEG/PNG files)
```

### Word to PDF
```
POST /api/word-to-pdf
Content-Type: multipart/form-data
Body: file (DOCX file)
Note: Requires LibreOffice or docx2pdf library
```

### PDF to Word
```
POST /api/pdf-to-word
Content-Type: multipart/form-data
Body: file (PDF file)
Note: Requires pdf2docx library
```

## 🔧 Configuration

Edit `.env` file to modify:
- `FLASK_ENV` - Environment (development/production)
- `FLASK_DEBUG` - Enable debug mode
- `MAX_CONTENT_LENGTH` - Max file size (default: 100MB)

## 📦 Dependencies

- **Flask** - Web framework
- **Flask-CORS** - Enable CORS for frontend integration
- **PyPDF2** - PDF manipulation
- **python-docx** - Word document handling
- **pillow** - Image processing
- **pdf2image** - PDF to image conversion
- **reportlab** - PDF generation

## 🔌 Frontend Integration

Connect from React frontend:

```javascript
// Example: Merge PDFs
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);

const response = await fetch('http://localhost:5000/api/merge-pdf', {
  method: 'POST',
  body: formData
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
// Download or display...
```

## 📝 Error Handling

All endpoints return JSON errors:
```json
{
  "error": "Error message description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `400` - Bad request (missing files, invalid format)
- `500` - Server error
- `501` - Feature not implemented

## 🐛 Troubleshooting

### "No module named 'pdf2image'"
```bash
pip install pdf2image
```

### "poppler not found" (on pdf-to-jpg)
Install poppler system package (see above)

### "401 CORS error"
CORS is enabled by default. If issues persist, check Flask-CORS config in `app.py`

## 📄 License

Part of DocNova PDF Tools Website

## 🔐 Security Notes

- Max file size: 100MB (configurable)
- Temp files auto-cleaned after processing
- No data persistence (stateless)
- CORS enabled for frontend integration
