import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiMessageCircle } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { analysisAPI, resumeAPI } from '../services/api';
import type { Resume } from '../types';

interface Question {
  question: string;
  category: string;
  tips: string;
}

export default function InterviewPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [jobText, setJobText] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    resumeAPI.list({ page_size: 50 }).then(({ data }) => {
      setResumes(data.items);
      if (data.items.length > 0) setSelectedId(data.items[0].id);
    });
  }, []);

  const generate = async () => {
    if (!selectedId) return toast.error('Select a resume');
    setLoading(true);
    try {
      const { data } = await analysisAPI.interviewQuestions({ resume_id: selectedId, job_text: jobText, count: 10 });
      setQuestions((data as { data?: { questions?: Question[] } }).data?.questions || []);
      toast.success('Questions generated!');
    } catch {
      toast.error('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const categoryColors: Record<string, string> = {
    technical: 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30',
    behavioral: 'bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/30',
    situational: 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Interview Question Generator</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Practice with AI-generated interview questions</p>
      </div>

      <div className="card space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Select Resume</label>
          <select value={selectedId || ''} onChange={(e) => setSelectedId(Number(e.target.value))} className="input-field bg-white dark:bg-slate-950">
            {resumes.map((r) => <option key={r.id} value={r.id}>{r.original_filename}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Job Description (optional)</label>
          <textarea value={jobText} onChange={(e) => setJobText(e.target.value)} rows={4} className="input-field resize-none bg-white dark:bg-slate-950" placeholder="Paste job description for targeted questions..." />
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary py-3">
          {loading ? <LoadingSpinner size="sm" /> : <><FiMessageCircle /> Generate Questions</>}
        </button>
      </div>

      {questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="card hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">Q{i + 1}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${categoryColors[q.category] || categoryColors.behavioral}`}>
                  {q.category}
                </span>
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-base">{q.question}</p>
              {q.tips && (
                <div className="mt-3 border-t border-slate-100 dark:border-slate-800/40 pt-3 text-sm text-slate-600 dark:text-slate-455 font-medium leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/40">
                  💡 <span className="font-bold text-slate-700 dark:text-slate-300">Tip:</span> {q.tips}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
