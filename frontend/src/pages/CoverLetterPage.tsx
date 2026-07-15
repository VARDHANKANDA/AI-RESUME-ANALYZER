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
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Cover Letter Generator</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">AI-generated cover letters tailored to your resume and job</p>
      </div>

      <div className="card space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Select Resume</label>
            <select value={selectedId || ''} onChange={(e) => setSelectedId(Number(e.target.value))} className="input-field bg-white dark:bg-slate-950">
              {resumes.map((r) => <option key={r.id} value={r.id}>{r.original_filename}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="input-field bg-white dark:bg-slate-950">
              <option value="professional">Professional</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="formal">Formal</option>
              <option value="creative">Creative</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Job Description</label>
          <textarea value={jobText} onChange={(e) => setJobText(e.target.value)} rows={6} className="input-field resize-none bg-white dark:bg-slate-950" placeholder="Paste job description..." />
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary py-3">
          {loading ? <LoadingSpinner size="sm" /> : <><FiMail /> Generate Cover Letter</>}
        </button>
      </div>

      {coverLetter && (
        <div className="card">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Generated Cover Letter</h2>
            <button onClick={() => { navigator.clipboard.writeText(coverLetter); toast.success('Copied!'); }} className="btn-secondary">Copy</button>
          </div>
          <div className="whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50/40 p-6 text-sm leading-relaxed dark:bg-slate-950 dark:border-slate-800/80 dark:text-slate-300">{coverLetter}</div>
        </div>
      )}
    </div>
  );
}
