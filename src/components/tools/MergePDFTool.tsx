import { useState } from 'react';
import { pdfApi } from '@/services/pdfApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function MergePDFTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setError(null);
      setSuccess(false);
    }
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const result = await pdfApi.mergePDFs(files);
      if (result) {
        pdfApi.downloadBlob(result, 'merged.pdf');
        setSuccess(true);
        setFiles([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge PDFs');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div>
        <h3 className="text-xl font-semibold mb-2">Merge PDF</h3>
        <p className="text-sm text-gray-600">Combine multiple PDFs into one file</p>
      </div>

      <div className="space-y-4">
        <Input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileChange}
          disabled={loading}
          className="cursor-pointer"
        />

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{files.length} file(s) selected:</p>
            <ul className="space-y-1">
              {files.map((file, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                  <span>{file.name}</span>
                  <button
                    onClick={() => removeFile(idx)}
                    className="text-red-500 hover:text-red-700"
                    disabled={loading}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={handleMerge}
          disabled={loading || files.length < 2}
          className="w-full"
        >
          {loading ? 'Merging...' : 'Merge PDFs'}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            ✓ PDFs merged successfully! Download started.
          </div>
        )}
      </div>
    </div>
  );
}
