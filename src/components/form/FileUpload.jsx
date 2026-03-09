import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, X, Check, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { toast } from 'react-hot-toast';

const FileUpload = ({ onFilesSelected }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);

  const handleDrag = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }, [files]); // Depend on 'files' to append correctly

  const handleFiles = (newFiles) => {
    const fileList = Array.from(newFiles);
    const validFiles = [];

    fileList.forEach(file => {
      // 1. Validate Type (PDF Only)
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} is not a PDF.`);
        return;
      }
      // 2. Validate Size (Limit 15MB)
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`${file.name} is too large (Max 15MB).`);
        return;
      }
      // 3. Prevent Duplicates (Simple name check)
      if (files.some(f => f.name === file.name)) {
        toast.error(`${file.name} is already added.`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      // ✅ FIX: Append new files to the existing array instead of replacing it
      const updatedList = [...files, ...validFiles]; 
      setFiles(updatedList);
      onFilesSelected(updatedList);
    }
  };

  const removeFile = (index) => {
    const updatedList = files.filter((_, i) => i !== index);
    setFiles(updatedList);
    onFilesSelected(updatedList);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* ✅ FIX: Always show the drag area so users can add more files.
         We condense it slightly if files exist to save space.
      */}
      <div 
        className={cn(
          "relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer group",
          dragActive 
            ? "border-[var(--primary)] bg-[var(--primary)]/5 h-[140px]" 
            : "border-[var(--sys-glass-border)] bg-[var(--glass-surface)]/30 hover:bg-[var(--background)]/50",
          files.length > 0 ? "h-[100px]" : "h-[140px]"
        )}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
      >
        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
            <div className="p-1.5 bg-[var(--glass-surface)] rounded-full shadow-sm border border-[var(--sys-glass-border)] mb-2 group-hover:scale-110 transition-transform">
              {files.length > 0 ? <Plus className="w-4 h-4 text-[var(--primary)]" /> : <UploadCloud className="w-4 h-4 text-[var(--primary)]" />}
            </div>
            <div>
              <p className="font-bold text-[var(--text)] text-xs">
                {files.length > 0 ? "Add more PDFs" : "Drag & drop PDFs"}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Max 15MB per file</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf" 
              multiple // ✅ FIX: Allow multiple file selection in system dialog
              onChange={(e) => e.target.files && handleFiles(e.target.files)} 
            />
        </label>
      </div>

      {/* ✅ FIX: Render the list of selected files below the drop zone */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
           {files.map((file, index) => (
             <div key={index} className="flex items-center gap-3 w-full bg-[var(--glass-surface)] p-2.5 rounded-xl border border-[var(--sys-glass-border)] shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="p-1.5 bg-[var(--secondary)]/10 rounded-lg shrink-0">
                  <FileText className="w-4 h-4 text-[var(--secondary)]" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-[var(--text)] truncate">{file.name}</p>
                  <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                    <Check className="w-2.5 h-2.5 text-[var(--success)]" /> 
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB • Ready</span>
                  </div>
                </div>
                <button 
                  type="button" // Important: preventing form submit
                  onClick={() => removeFile(index)} 
                  className="p-1 hover:bg-[var(--danger)]/10 text-[var(--text-muted)] hover:text-[var(--danger)] rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;