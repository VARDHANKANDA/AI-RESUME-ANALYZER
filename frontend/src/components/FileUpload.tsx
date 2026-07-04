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
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all ${
            dragActive
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 hover:border-primary-400 dark:border-gray-700'
          }`}
        >
          <FiUploadCloud className="mb-4 h-12 w-12 text-primary-500" />
          <p className="mb-2 text-lg font-medium text-gray-700 dark:text-gray-300">{label}</p>
          <p className="mb-4 text-sm text-gray-500">PDF or DOCX up to {maxSizeMB}MB</p>
          <label className="btn-primary cursor-pointer">
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
        <div className="flex items-center gap-4 rounded-xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
          <FiFile className="h-8 w-8 text-primary-600" />
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={clearFile} className="rounded-lg p-2 hover:bg-gray-200 dark:hover:bg-gray-700">
            <FiX className="h-5 w-5" />
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
