import { useCallback, useState } from 'react';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
}

export default function FileUpload({
  onFileSelect,
  accept = '.pdf,.docx',
  maxSizeMB = 10,
  label = 'Drag & drop your file here',
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const validateFile = (file: File): boolean => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'docx'].includes(ext)) {
      setError('Only PDF and DOCX files are allowed');
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be under ${maxSizeMB}MB`);
      return false;
    }
    setError('');
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const clearFile = () => {
    setSelectedFile(null);
    setError('');
  };

  return (
    <div className="w-full animate-fade-in">
      {!selectedFile ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-300 ${
            dragActive
              ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/20'
              : 'border-slate-300 hover:border-primary-500 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:border-primary-900/20 bg-slate-50/20 dark:bg-slate-900/10'
          }`}
        >
          <FiUploadCloud className="mb-4 h-12 w-12 text-primary-500 animate-bounce" />
          <p className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-200">{label}</p>
          <p className="mb-5 text-sm text-slate-500 dark:text-slate-400 font-medium">PDF or DOCX up to {maxSizeMB}MB</p>
          <label className="btn-primary cursor-pointer py-2.5 px-4 font-semibold text-sm">
            Browse Files
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border border-primary-200/50 bg-primary-50/20 p-4 dark:border-primary-800/40 dark:bg-primary-950/25">
          <FiFile className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          <div className="flex-1">
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{selectedFile.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={clearFile} className="rounded-xl p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-slate-500 dark:text-slate-400">
            <FiX className="h-5 w-5" />
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400 font-semibold">{error}</p>}
    </div>
  );
}
