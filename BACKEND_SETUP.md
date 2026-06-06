# 🚀 Backend Setup Complete!

## ✅ What's Been Created

Your Flask PDF Tools backend is now ready! Here's what was set up:

```
backend/
├── app.py                  # Main Flask application with all API endpoints
├── config.py              # Configuration management
├── client_example.py      # Example Python client for testing
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── Dockerfile            # Docker containerization
├── docker-compose.yml    # Docker Compose setup
├── README.md             # API documentation
└── uploads/              # Temporary file storage
```

## 📋 API Endpoints Available

### ✨ Implemented & Ready:
- ✅ `GET /health` - Health check
- ✅ `POST /api/merge-pdf` - Merge multiple PDFs
- ✅ `POST /api/compress-pdf` - Compress PDF files
- ✅ `POST /api/split-pdf` - Split PDF into pages
- ✅ `POST /api/pdf-to-jpg` - Convert PDF pages to JPG
- ✅ `POST /api/jpg-to-pdf` - Convert JPG images to PDF

### ⚙️ Requires Additional Setup:
- `POST /api/word-to-pdf` - Needs LibreOffice (see below)
- `POST /api/pdf-to-word` - Needs pdf2docx library

## 🎯 Quick Start

### 1. Server is Already Running!
The backend is running at: **http://localhost:5000**

### 2. Stop & Restart (if needed)
```powershell
# Stop the current server
# Press Ctrl+C in the terminal running the backend

# Restart
cd backend
python app.py
```

### 3. Test an Endpoint
```powershell
# Test health check
curl http://localhost:5000/health

# Or use Python
python client_example.py
```

## 🔗 Connect Frontend to Backend

Update your React app to call the backend:

```javascript
// Example: Merge PDFs from React
const mergePDFs = async (files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const response = await fetch('http://localhost:5000/api/merge-pdf', {
    method: 'POST',
    body: formData
  });
  
  const blob = await response.blob();
  // Download or process the blob...
};
```

### CORS Configuration
CORS is enabled by default for development. For production, update in `config.py`:
```python
CORS_ORIGINS = ["https://yourdomain.com"]
```

## 🐳 Docker Deployment

### Run with Docker Compose
```bash
cd backend
docker-compose up -d
```

Access at: http://localhost:5000

### Manual Docker Build
```bash
docker build -t docnova-backend .
docker run -p 5000:5000 -v $(pwd)/uploads:/app/uploads docnova-backend
```

## 📦 Optional: Advanced Features

### Add Word to PDF Conversion
Requires LibreOffice on system:

**Windows (Chocolatey):**
```powershell
choco install libreoffice
```

Then install Python package:
```bash
pip install docx2pdf
```

Update `app.py` Word endpoints to use the library.

### Add PDF to Word Conversion
```bash
pip install pdf2docx
```

Update `app.py` PDF to Word endpoint.

### Add Poppler (for better PDF-to-Image conversion)
**Windows (Chocolatey):**
```powershell
choco install poppler
```

Or download: https://github.com/oschwartz10612/poppler-windows/releases/

## 🔧 Configuration

Edit `backend/.env`:
```env
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=1
MAX_CONTENT_LENGTH=104857600  # 100MB file size limit
```

Edit `backend/config.py` for:
- CORS settings
- File type restrictions
- Maximum file size

## 📊 File Size Limits

- Current: **100MB** per file
- Change in `.env`: `MAX_CONTENT_LENGTH=<bytes>`

Example: 50MB = `52428800`

## 🧪 Testing Endpoints

### Using cURL
```bash
# Health check
curl http://localhost:5000/health

# Merge PDFs
curl -X POST -F "files=@file1.pdf" -F "files=@file2.pdf" \
  http://localhost:5000/api/merge-pdf --output merged.pdf

# Compress PDF
curl -X POST -F "file=@input.pdf" \
  http://localhost:5000/api/compress-pdf --output compressed.pdf
```

### Using Python Client
```python
from client_example import PDFToolsClient

client = PDFToolsClient()
result = client.merge_pdfs(["file1.pdf", "file2.pdf"])
print(result)
```

## 📝 API Response Format

### Success Response
```json
{
  "status": "healthy",
  "timestamp": "2026-06-05T03:15:42.629+05:30"
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

## 🐛 Troubleshooting

### Port 5000 Already in Use
```powershell
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### pdf2image Error (pdf-to-jpg endpoint)
Install poppler-utils:
```powershell
choco install poppler
```

### Import Errors
Reinstall dependencies:
```bash
pip install --upgrade -r requirements.txt
```

### CORS Issues
If frontend gets CORS errors, check that Flask-CORS is enabled in `app.py`

## 🚀 Production Deployment

For production, use a WSGI server:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

Or use the Docker container:
```bash
docker-compose up -d
```

## 📚 Next Steps

1. ✅ Backend is running
2. ⏭️ Connect React frontend to backend
3. ⏭️ Add file upload UI to frontend
4. ⏭️ Test all endpoints
5. ⏭️ Deploy to production

## 📞 Support

For issues with:
- **PyPDF2**: https://github.com/py-pdf/PyPDF2
- **Pillow**: https://pillow.readthedocs.io/
- **Flask**: https://flask.palletsprojects.com/
- **pdf2image**: https://github.com/Belval/pdf2image

---

**Backend Status**: ✅ **RUNNING**  
**Server URL**: http://localhost:5000  
**API Docs**: See README.md in backend folder
