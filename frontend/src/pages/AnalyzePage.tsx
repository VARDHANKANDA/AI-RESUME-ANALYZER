import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiDownload, FiZap } from 'react-icons/fi';
import ATSScoreBreakdown from '../components/ATSScoreBreakdown';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillTags from '../components/SkillTags';
import { analysisAPI, resumeAPI } from '../services/api';
import { downloadBlob } from '../utils/helpers';
import type { Analysis, Resume } from '../types';

export default function AnalyzePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    resumeAPI.list({ page_size: 50 })
      .then(({ data }) => {
        setResumes(data.items);
        if (data.items.length > 0) setSelectedId(data.items[0].id);
      })
      .finally(() => setFetching(false));
  }, []);

  const runAnalysis = async () => {
    if (!selectedId) return toast.error('Select a resume first');
    setLoading(true);
    setAnalysis(null);
    try {
      const { data } = await analysisAPI.analyze(selectedId);
      setAnalysis(data);
      toast.success('Analysis complete!');
    } catch {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!analysis) return;
    try {
      const { data } = await analysisAPI.downloadReport(analysis.id);
      downloadBlob(data, `analysis_${analysis.id}.pdf`);
      toast.success('Report downloaded');
    } catch {
      toast.error('Download failed');
    }
  };

  if (fetching) return <div className="flex h-96 items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Resume Analysis</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Get AI-powered ATS score and improvement suggestions</p>
      </div>

      <div className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Select Resume</label>
            <select
              value={selectedId || ''}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="input-field bg-white dark:bg-slate-950"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>{r.original_filename}</option>
              ))}
            </select>
          </div>
          <button onClick={runAnalysis} disabled={loading || !selectedId} className="btn-primary py-3">
            {loading ? <LoadingSpinner size="sm" /> : <><FiZap /> Analyze Resume</>}
          </button>
        </div>
      </div>

      {loading && (
        <div className="card flex flex-col items-center py-16">
          <LoadingSpinner size="lg" text="AI is analyzing your resume..." />
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-6">
          <div className="card">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">ATS Score Breakdown</h2>
              <button onClick={downloadReport} className="btn-secondary"><FiDownload /> Download PDF</button>
            </div>
            <ATSScoreBreakdown score={analysis.ats_score} breakdown={analysis.ats_breakdown} />
          </div>

          {analysis.summary && (
            <div className="card border-l-4 border-l-primary-500">
              <h2 className="mb-3 text-lg font-bold text-slate-800 dark:text-slate-200">Summary</h2>
              <p className="text-slate-650 leading-relaxed dark:text-slate-300 text-sm md:text-base">{analysis.summary}</p>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div className="card border border-emerald-500/20 bg-emerald-50/10 dark:border-emerald-500/10 dark:bg-emerald-950/5">
                <h2 className="mb-4 text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">✓</span>
                  Strengths
                </h2>
                <ul className="space-y-2.5">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-350">
                      <span className="text-emerald-500 font-bold">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.weaknesses && analysis.weaknesses.length > 0 && (
              <div className="card border border-orange-500/20 bg-orange-50/10 dark:border-orange-500/10 dark:bg-orange-950/5">
                <h2 className="mb-4 text-lg font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold">!</span>
                  Weaknesses
                </h2>
                <ul className="space-y-2.5">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-350">
                      <span className="text-orange-500 font-bold">•</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {analysis.missing_skills && analysis.missing_skills.length > 0 && (
            <div className="card">
              <h2 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-200">Missing Skills</h2>
              <SkillTags skills={analysis.missing_skills} variant="missing" />
            </div>
          )}

          {analysis.ai_suggestions && analysis.ai_suggestions.length > 0 && (
            <div className="card">
              <h2 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-200">AI Suggestions</h2>
              <ul className="space-y-3">
                {analysis.ai_suggestions.map((s, i) => (
                  <li key={i} className="rounded-xl border border-primary-100/50 bg-primary-50/30 p-4 text-sm text-slate-700 dark:text-slate-300 dark:bg-primary-950/10 dark:border-primary-900/20">
                    💡 {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.optimized_sections && (
            <div className="card">
              <h2 className="mb-5 text-lg font-bold text-slate-800 dark:text-slate-200">Optimized Sections</h2>
              <div className="space-y-5">
                {Object.entries(analysis.optimized_sections).map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10">
                    <h3 className="mb-2 text-sm font-bold capitalize text-primary-600 dark:text-primary-400">{key.replace(/_/g, ' ')}</h3>
                    <p className="rounded-lg bg-white p-3.5 text-sm dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 leading-relaxed font-mono whitespace-pre-wrap">
                      {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
