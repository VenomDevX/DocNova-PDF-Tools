import React, { useState, useEffect } from 'react';
import { FileText, Clock, FileStack } from 'lucide-react';
import { motion } from 'motion/react';

interface RecentFile {
  id: string;
  name: string;
  date: string;
  pages: number;
}

interface PhotoLibraryGalleryProps {
  onSelectRecent: (file: File) => void;
}

export function PhotoLibraryGallery({ onSelectRecent }: PhotoLibraryGalleryProps) {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  useEffect(() => {
    const mockFiles = [
      { id: '1', name: 'Q3_Financial_Report_2025.pdf', date: 'Today, 10:42 AM', pages: 24 },
      { id: '2', name: 'Vendor_Agreement_Draft.pdf', date: 'Yesterday', pages: 12 },
      { id: '3', name: 'Marketing_Strategy_Brief.pdf', date: 'Monday', pages: 8 },
      { id: '4', name: 'Employee_Handbook.pdf', date: 'Last Week', pages: 45 },
      { id: '5', name: 'Project_Nova_Specs.pdf', date: 'Last Week', pages: 18 },
      { id: '6', name: 'Competitor_Analysis.pdf', date: 'Last Month', pages: 32 },
    ];
    setRecentFiles(mockFiles);
  }, []);

  return (
    <div className="mt-8 flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <Clock size={18} className="text-blue-400" />
          Recent Documents
        </h3>
        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
          View All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pr-2" style={{ scrollbarWidth: 'none' }}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {recentFiles.map((file, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={file.id}
              onClick={() => alert(`In a production app, this would load: ${file.name}`)}
              className="group relative aspect-[3/4] rounded-2xl bg-[#1a1a1a] border border-gray-800 overflow-hidden cursor-pointer hover:border-blue-500/50 transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] flex flex-col"
            >
              <div className="flex-1 bg-gradient-to-br from-[#121212] to-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                <FileText size={48} className="text-gray-700 group-hover:text-blue-500/50 transition-colors duration-300" />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-medium text-gray-300 border border-white/10">
                  Processed
                </div>
              </div>

              <div className="p-3 bg-[#121212] border-t border-gray-800/50">
                <h4 className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                  {file.name}
                </h4>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] text-gray-500">{file.date}</span>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <FileStack size={10} />
                    {file.pages}
                  </div>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
