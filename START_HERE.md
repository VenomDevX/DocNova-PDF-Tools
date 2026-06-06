# 🎉 FRONTEND-BACKEND CONNECTION GUIDE

## 📊 What's Been Created

Your complete full-stack PDF tools application is ready with:

✅ **Flask Backend** (Python)
- 6 working API endpoints
- CORS enabled for frontend
- Error handling & validation
- Docker ready

✅ **React Frontend** (TypeScript)
- Service layer for API calls
- Example components
- TypeScript support
- Error handling

✅ **Documentation**
- QUICK_CONNECT.md (fastest setup)
- INTEGRATION_GUIDE.md (detailed)
- Code examples & troubleshooting

---

## ⚡ FASTEST WAY TO START (5 minutes)

### Step 1: Terminal 1 - Start Backend

```powershell
cd backend
python app.py
```

Wait for: `Running on http://127.0.0.1:5000`

### Step 2: Terminal 2 - Start Frontend

```powershell
npm run dev
```

Wait for: `VITE v... ready in X ms`

### Step 3: Open Browser

```
http://localhost:5173
```

**That's it! They're now connected!** 🎊

---

## 🔌 How They Connect

```
React Components
    ↓
pdfApi.ts (TypeScript Service)
    ↓ (HTTP Fetch)
Backend Flask API (http://localhost:5000)
    ↓ (Process Files)
Returns PDF/Blob
    ↓
Browser Download
```

---

## 📝 Use in Your Components

### Import
```typescript
import { pdfApi } from '@/services/pdfApi';
```

### Use
```typescript
// Example: Merge PDFs
const blob = await pdfApi.mergePDFs([file1, file2]);
pdfApi.downloadBlob(blob, 'merged.pdf');
```

### All Available Methods
```typescript
// Merge
pdfApi.mergePDFs(files)

// Compress
pdfApi.compressPDF(file)

// Split
pdfApi.splitPDF(file)

// Convert PDF to JPG
pdfApi.pdfToJpg(file)

// Convert JPG to PDF
pdfApi.jpgToPDF(files)

// Download
pdfApi.downloadBlob(blob, 'filename.pdf')

// Helper: Base64 to Blob
pdfApi.base64ToBlob(base64String, 'image/jpeg')
```

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `backend/app.py` | All API endpoints |
| `src/services/pdfApi.ts` | Frontend service |
| `src/components/tools/MergePDFTool.tsx` | Example component |
| `QUICK_CONNECT.md` | Quick reference |
| `INTEGRATION_GUIDE.md` | Detailed guide |

---

## 🧪 Test Connection

In browser console:
```javascript
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(console.log);
```

Expected: `{status: "healthy", timestamp: "..."}`

---

## 🚀 Both Are Running

✅ Backend: http://localhost:5000
✅ Frontend: http://localhost:5173
✅ Service: src/services/pdfApi.ts
✅ Components: Ready to use

---

## 📖 For More Details

- **QUICK_CONNECT.md** - Fastest reference
- **INTEGRATION_GUIDE.md** - Complete examples
- **backend/README.md** - API documentation

---

**You're all set! Start the servers and begin using your PDF tools!** 🎯
