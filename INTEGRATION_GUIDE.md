# 🔗 Frontend-Backend Integration Guide

## 📋 Overview

This guide shows how to connect your **React Frontend** (Vite) with the **Flask Backend** running on `http://localhost:5000`.

---

## 🎯 STEP 1: Verify Backend is Running

```bash
# Check if backend is running
curl http://localhost:5000/health

# Expected response:
# {"status": "healthy", "timestamp": "2026-06-05T11:24:31..."}
```

✅ If you see the response, backend is ready!

---

## 🚀 STEP 2: Setup Frontend Environment Variables

Create a `.env` file in the root of your project:

```env
# .env (in project root, NOT in backend folder)
VITE_API_URL=http://localhost:5000
```

Or use the default (already configured in `src/services/pdfApi.ts`):
- Development: `http://localhost:5000`
- Production: Update in deployment

---

## 📦 STEP 3: The Frontend Service (Already Created!)

Your React API service is ready at: `src/services/pdfApi.ts`

This file contains all methods to call the backend:

```typescript
// Import the service
import { pdfApi } from '@/services/pdfApi';

// Use methods
const mergedPdf = await pdfApi.mergePDFs([file1, file2]);
const compressedPdf = await pdfApi.compressPDF(file);
const jpgImages = await pdfApi.pdfToJpg(pdfFile);
// ... etc
```

---

## 💻 STEP 4: Create React Components

Here are example components you can add to your frontend:

### A. Merge PDF Component

Create `src/components/MergePDFTool.tsx`:

```typescript
import { useState } from 'react';
import { pdfApi } from '@/services/pdfApi';

export function MergePDFTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Select at least 2 PDFs');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await pdfApi.mergePDFs(files);
      if (result) {
        pdfApi.downloadBlob(result, 'merged.pdf');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error merging PDFs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Merge PDF</h2>
      
      <input
        type="file"
        multiple
        accept=".pdf"
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
        className="mb-4"
      />
      
      <p className="text-sm text-gray-600 mb-4">
        Selected: {files.length} files
      </p>

      <button
        onClick={handleMerge}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Merging...' : 'Merge PDFs'}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
```

### B. Compress PDF Component

Create `src/components/CompressPDFTool.tsx`:

```typescript
import { useState } from 'react';
import { pdfApi } from '@/services/pdfApi';

export function CompressPDFTool() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompress = async () => {
    if (!file) {
      setError('Select a PDF first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await pdfApi.compressPDF(file);
      if (result) {
        pdfApi.downloadBlob(result, 'compressed.pdf');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error compressing PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Compress PDF</h2>
      
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />
      
      {file && <p className="text-sm text-gray-600 mb-4">File: {file.name}</p>}

      <button
        onClick={handleCompress}
        disabled={loading || !file}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Compressing...' : 'Compress PDF'}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
```

### C. PDF to JPG Component

Create `src/components/PDFToJpgTool.tsx`:

```typescript
import { useState } from 'react';
import { pdfApi } from '@/services/pdfApi';

export function PDFToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);

  const handleConvert = async () => {
    if (!file) {
      setError('Select a PDF first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await pdfApi.pdfToJpg(file);
      
      if (result.images) {
        const imageBlobs = result.images.map((img: any) =>
          pdfApi.base64ToBlob(img.image, 'image/jpeg')
        );
        setImages(imageBlobs.map(blob => URL.createObjectURL(blob)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error converting PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">PDF to JPG</h2>
      
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <button
        onClick={handleConvert}
        disabled={loading || !file}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Converting...' : 'Convert to JPG'}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <div className="grid grid-cols-3 gap-4 mt-6">
        {images.map((img, idx) => (
          <img key={idx} src={img} alt={`Page ${idx + 1}`} className="w-full border" />
        ))}
      </div>
    </div>
  );
}
```

---

## 🔌 STEP 5: Add Components to Your App

Update your main app file (e.g., `src/App.tsx`):

```typescript
import { MergePDFTool } from './components/MergePDFTool';
import { CompressPDFTool } from './components/CompressPDFTool';
import { PDFToJpgTool } from './components/PDFToJpgTool';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function App() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">DocNova PDF Tools</h1>

      <Tabs defaultValue="merge" className="w-full">
        <TabsList>
          <TabsTrigger value="merge">Merge</TabsTrigger>
          <TabsTrigger value="compress">Compress</TabsTrigger>
          <TabsTrigger value="convert">PDF to JPG</TabsTrigger>
        </TabsList>

        <TabsContent value="merge">
          <MergePDFTool />
        </TabsContent>

        <TabsContent value="compress">
          <CompressPDFTool />
        </TabsContent>

        <TabsContent value="convert">
          <PDFToJpgTool />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 🧪 STEP 6: Test the Connection

### Option A: Run Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
# Backend runs at http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Frontend runs at http://localhost:5173
```

### Option B: Test Health Check

In React component or console:
```javascript
import { pdfApi } from '@/services/pdfApi';

// Test connection
const health = await pdfApi.healthCheck();
console.log(health);
```

---

## 🐛 Troubleshooting

### ❌ CORS Error: "Access to XMLHttpRequest blocked"

**Solution 1:** Ensure backend is running
```bash
curl http://localhost:5000/health
```

**Solution 2:** Check CORS is enabled in `backend/app.py`
```python
CORS(app)  # Should be present
```

**Solution 3:** Update CORS origin in `backend/config.py` if needed

### ❌ "Backend not reachable"

Make sure:
1. ✅ Backend is running: `http://localhost:5000`
2. ✅ Port 5000 is not blocked
3. ✅ Firewall allows localhost connections

### ❌ File upload fails

Check:
1. File size < 100MB (default limit)
2. File format is correct (PDF, JPG, etc.)
3. Backend has write permissions to `backend/uploads/`

### ❌ "TypeError: Cannot read property 'blob'"

Make sure response handling is correct:
```javascript
const blob = await response.blob();
if (!blob || blob.size === 0) {
  throw new Error('Empty response');
}
```

---

## 🔐 CORS Configuration

### Development (localhost)
```python
# In backend/app.py - already configured
CORS(app)  # Allows all origins
```

### Production
Update `backend/config.py`:
```python
CORS_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com"
]
```

Then in `backend/app.py`:
```python
CORS(app, resources={
    r"/api/*": {"origins": app.config['CORS_ORIGINS']}
})
```

---

## 📊 API Endpoints Reference

| Method | Endpoint | Input | Output |
|--------|----------|-------|--------|
| GET | `/health` | - | JSON status |
| POST | `/api/merge-pdf` | files (multiple) | PDF blob |
| POST | `/api/compress-pdf` | file | PDF blob |
| POST | `/api/split-pdf` | file | JSON pages |
| POST | `/api/pdf-to-jpg` | file | JSON images |
| POST | `/api/jpg-to-pdf` | files (multiple) | PDF blob |

---

## 📝 Complete Integration Checklist

- [ ] Backend running at `http://localhost:5000`
- [ ] Frontend environment variables set (`.env`)
- [ ] `src/services/pdfApi.ts` imported
- [ ] React components created
- [ ] Components added to main app
- [ ] Health check works: `pdfApi.healthCheck()`
- [ ] Test with sample file
- [ ] Error handling working
- [ ] File download working
- [ ] CORS properly configured

---

## 🚀 Next: Deploy Both

### Local Testing
```bash
# Terminal 1
cd backend && python app.py

# Terminal 2
npm run dev
```

### Production Deployment
```bash
# Backend with Docker
docker-compose up -d

# Frontend build
npm run build
# Deploy dist/ folder to hosting
```

---

## 💡 Tips

✅ Keep both servers running during development  
✅ Use React DevTools to debug component state  
✅ Check browser console for errors  
✅ Monitor backend terminal for request logs  
✅ Use postman/curl to test endpoints directly  

---

**You're all set! Your frontend and backend are ready to work together!** 🎉
