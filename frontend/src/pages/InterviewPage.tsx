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
    technical: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    behavioral: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    situational: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Interview Question Generator</h1>
        <p className="mt-1 text-gray-500">Practice with AI-generated interview questions</p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Select Resume</label>
          <select value={selectedId || ''} onChange={(e) => setSelectedId(Number(e.target.value))} className="input-field">
            {resumes.map((r) => <option key={r.id} value={r.id}>{r.original_filename}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Job Description (optional)</label>
          <textarea value={jobText} onChange={(e) => setJobText(e.target.value)} rows={4} className="input-field resize-none" placeholder="Paste job description for targeted questions..." />
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary">
          {loading ? <LoadingSpinner size="sm" /> : <><FiMessageCircle /> Generate Questions</>}
        </button>
      </div>

      {questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="card">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-bold text-primary-600">Q{i + 1}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[q.category] || categoryColors.behavioral}`}>
                  {q.category}
                </span>
              </div>
              <p className="font-medium">{q.question}</p>
              {q.tips && <p className="mt-2 text-sm text-gray-500">💡 {q.tips}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
