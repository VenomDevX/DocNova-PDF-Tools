# 🔗 CONNECT FRONTEND & BACKEND - QUICK CHECKLIST

## ✅ Prerequisites

- [ ] Backend running at `http://localhost:5000`
- [ ] `npm` or `pnpm` installed
- [ ] Python 3.11+ installed
- [ ] Node.js installed

---

## 🚀 QUICKEST WAY (Windows)

### Step 1: Open PowerShell
```powershell
cd 'c:\Users\PARTH\Desktop\New folder (2)\Design DocNova PDF Tools Website'
```

### Step 2: Start Backend (Terminal 1)
```powershell
cd backend
python app.py
```

**Wait for message:** `Running on http://127.0.0.1:5000`

### Step 3: Start Frontend (Terminal 2)
```powershell
cd 'c:\Users\PARTH\Desktop\New folder (2)\Design DocNova PDF Tools Website'
npm run dev
```

**Wait for message:** `VITE v... ready in X ms`

### Step 4: Open Browser
Visit: **http://localhost:5173**

---

## 📁 FILES ALREADY CREATED FOR YOU

### Backend Service (TypeScript)
```
src/services/pdfApi.ts  ✓ Ready to use
```

### Example React Component
```
src/components/tools/MergePDFTool.tsx  ✓ Copy-paste ready
```

### Integration Guide
```
INTEGRATION_GUIDE.md  ✓ Complete with examples
```

---

## 🔌 HOW TO USE IN YOUR COMPONENTS

### Import the Service
```typescript
import { pdfApi } from '@/services/pdfApi';
```

### Use Any Method
```typescript
// Merge PDFs
const mergedBlob = await pdfApi.mergePDFs([file1, file2]);

// Compress PDF
const compressedBlob = await pdfApi.compressPDF(pdfFile);

// Convert PDF to JPG
const images = await pdfApi.pdfToJpg(pdfFile);

// Convert JPG to PDF
const pdfBlob = await pdfApi.jpgToPDF([img1, img2]);

// Download
pdfApi.downloadBlob(blob, 'output.pdf');
```

---

## 🧪 TEST THE CONNECTION

### In Browser Console
```javascript
// Check if backend is alive
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### Expected Response
```json
{
  "status": "healthy",
  "timestamp": "2026-06-05T11:24:31..."
}
```

---

## ⚡ AVAILABLE API ENDPOINTS

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Check backend status |
| `/api/merge-pdf` | POST | Merge multiple PDFs |
| `/api/compress-pdf` | POST | Compress PDF |
| `/api/split-pdf` | POST | Split PDF into pages |
| `/api/pdf-to-jpg` | POST | Convert PDF to images |
| `/api/jpg-to-pdf` | POST | Convert images to PDF |

---

## 📋 COMMON TASKS

### 1. Add Merge PDF Tool to Your App
```typescript
import { MergePDFTool } from '@/components/tools/MergePDFTool';

export default function App() {
  return <MergePDFTool />;
}
```

### 2. Create New Tool Component
```typescript
import { useState } from 'react';
import { pdfApi } from '@/services/pdfApi';

export function MyPDFTool() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    if (!file) return;
    
    try {
      setLoading(true);
      const result = await pdfApi.compressPDF(file);
      if (result) {
        pdfApi.downloadBlob(result, 'output.pdf');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleProcess} disabled={loading}>
        {loading ? 'Processing...' : 'Process'}
      </button>
    </div>
  );
}
```

### 3. Handle Errors
```typescript
try {
  const result = await pdfApi.mergePDFs(files);
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
    // Show error to user
  }
}
```

---

## 🐛 TROUBLESHOOTING

### ❌ "Cannot GET /api/merge-pdf"
- **Check:** Is backend running? (http://localhost:5000/health)
- **Fix:** Start backend: `python app.py`

### ❌ CORS Error
- **Check:** Is backend CORS enabled?
- **Fix:** Already enabled in `app.py`

### ❌ "File size limit exceeded"
- **Check:** File > 100MB?
- **Fix:** Change in `backend/.env`: `MAX_CONTENT_LENGTH=...`

### ❌ Port 5000 already in use
```powershell
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 📊 PROJECT STRUCTURE

```
Design DocNova PDF Tools Website/
├── backend/                    (Flask API)
│   ├── app.py                 (All endpoints)
│   ├── config.py              (Configuration)
│   ├── requirements.txt        (Dependencies)
│   ├── .env                   (Environment)
│   ├── Dockerfile             (Docker)
│   └── uploads/               (Temp files)
│
├── src/                        (React Frontend)
│   ├── services/
│   │   └── pdfApi.ts          (Backend connector)
│   ├── components/
│   │   └── tools/
│   │       └── MergePDFTool.tsx (Example component)
│   ├── App.tsx                (Main app)
│   └── main.tsx               (Entry point)
│
├── INTEGRATION_GUIDE.md        (Full guide)
├── BACKEND_SETUP.md            (Backend docs)
├── package.json                (Frontend deps)
└── vite.config.ts             (Vite config)
```

---

## 🎯 COMPLETE SETUP FLOW

```
1. Terminal 1: Start Backend
   └─ cd backend
   └─ python app.py
   └─ Waits: http://localhost:5000

2. Terminal 2: Start Frontend  
   └─ npm run dev
   └─ Waits: http://localhost:5173

3. Open Browser
   └─ http://localhost:5173
   └─ Frontend automatically connects to backend

4. Use the App!
   └─ Upload files
   └─ Click buttons
   └─ Download results
```

---

## ✨ YOU'RE READY!

Both servers are configured and ready to communicate. 

**Just follow the "QUICKEST WAY" section above** ⬆️

---

## 🆘 NEED HELP?

Check these files:
- `INTEGRATION_GUIDE.md` - Complete integration steps
- `BACKEND_SETUP.md` - Backend documentation  
- `backend/README.md` - API documentation
- `src/services/pdfApi.ts` - TypeScript service

---

**Happy coding! 🚀**
