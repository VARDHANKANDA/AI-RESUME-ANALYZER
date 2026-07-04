import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiTrash2, FiSearch } from 'react-icons/fi';
import FileUpload from '../components/FileUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import SkillTags from '../components/SkillTags';
import { resumeAPI } from '../services/api';
import { formatDate, formatFileSize } from '../utils/helpers';
import type { Resume } from '../types';

export default function UploadPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const pageSize = 10;

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const { data } = await resumeAPI.list({ page, page_size: pageSize, search: search || undefined });
      setResumes(data.items);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResumes(); }, [page, search]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      await resumeAPI.upload(file);
      toast.success('Resume uploaded and parsed successfully!');
      fetchResumes();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Upload failed';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this resume?')) return;
    try {
      await resumeAPI.delete(id);
      toast.success('Resume deleted');
      fetchResumes();
    } catch {
      toast.error('Failed to delete resume');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Upload Resume</h1>
        <p className="mt-1 text-gray-500">Upload PDF or DOCX files for AI analysis</p>
      </div>

      <div className="card">
        {uploading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Uploading and parsing resume..." />
          </div>
        ) : (
          <FileUpload onFileSelect={handleUpload} />
        )}
      </div>

      <div className="card">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Your Resumes ({total})</h2>
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search resumes..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-10 sm:w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : resumes.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No resumes uploaded yet</p>
        ) : (
          <>
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div key={resume.id} className="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{resume.original_filename}</h3>
                      <p className="text-sm text-gray-500">
                        {resume.file_type.toUpperCase()} · {formatFileSize(resume.file_size)} · {formatDate(resume.created_at)}
                      </p>
                      {resume.parsed_data?.name && (
                        <p className="mt-1 text-sm text-primary-600">{resume.parsed_data.name}</p>
                      )}
                    </div>
                    <button onClick={() => handleDelete(resume.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <FiTrash2 />
                    </button>
                  </div>
                  {resume.parsed_data?.skills && resume.parsed_data.skills.length > 0 && (
                    <div className="mt-3">
                      <SkillTags skills={resume.parsed_data.skills} max={8} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
