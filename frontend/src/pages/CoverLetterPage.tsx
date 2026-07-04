import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiMail } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { analysisAPI, resumeAPI } from '../services/api';
import type { Resume } from '../types';

export default function CoverLetterPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [jobText, setJobText] = useState('');
  const [tone, setTone] = useState('professional');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    resumeAPI.list({ page_size: 50 }).then(({ data }) => {
      setResumes(data.items);
      if (data.items.length > 0) setSelectedId(data.items[0].id);
    });
  }, []);

  const generate = async () => {
    if (!selectedId || jobText.length < 10) return toast.error('Select resume and enter job description');
    setLoading(true);
    try {
      const { data } = await analysisAPI.coverLetter({ resume_id: selectedId, job_text: jobText, tone });
      setCoverLetter((data as { data?: { cover_letter?: string } }).data?.cover_letter || '');
      toast.success('Cover letter generated!');
    } catch {
      toast.error('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Cover Letter Generator</h1>
        <p className="mt-1 text-gray-500">AI-generated cover letters tailored to your resume and job</p>
      </div>

      <div className="card space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Select Resume</label>
            <select value={selectedId || ''} onChange={(e) => setSelectedId(Number(e.target.value))} className="input-field">
              {resumes.map((r) => <option key={r.id} value={r.id}>{r.original_filename}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="input-field">
              <option value="professional">Professional</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="formal">Formal</option>
              <option value="creative">Creative</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Job Description</label>
          <textarea value={jobText} onChange={(e) => setJobText(e.target.value)} rows={6} className="input-field resize-none" placeholder="Paste job description..." />
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary">
          {loading ? <LoadingSpinner size="sm" /> : <><FiMail /> Generate Cover Letter</>}
        </button>
      </div>

      {coverLetter && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Generated Cover Letter</h2>
            <button onClick={() => { navigator.clipboard.writeText(coverLetter); toast.success('Copied!'); }} className="btn-secondary">Copy</button>
          </div>
          <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-6 text-sm leading-relaxed dark:bg-gray-800">{coverLetter}</div>
        </div>
      )}
    </div>
  );
}
