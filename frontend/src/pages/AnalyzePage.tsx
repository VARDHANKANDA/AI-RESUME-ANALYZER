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
        <h1 className="text-3xl font-bold">Resume Analysis</h1>
        <p className="mt-1 text-gray-500">Get AI-powered ATS score and improvement suggestions</p>
      </div>

      <div className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium">Select Resume</label>
            <select
              value={selectedId || ''}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="input-field"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>{r.original_filename}</option>
              ))}
            </select>
          </div>
          <button onClick={runAnalysis} disabled={loading || !selectedId} className="btn-primary">
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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">ATS Score Breakdown</h2>
              <button onClick={downloadReport} className="btn-secondary"><FiDownload /> Download PDF</button>
            </div>
            <ATSScoreBreakdown score={analysis.ats_score} breakdown={analysis.ats_breakdown} />
          </div>

          {analysis.summary && (
            <div className="card">
              <h2 className="mb-3 text-lg font-semibold">Summary</h2>
              <p className="text-gray-600 dark:text-gray-300">{analysis.summary}</p>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div className="card">
                <h2 className="mb-3 text-lg font-semibold text-green-600">Strengths</h2>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-green-500">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.weaknesses && analysis.weaknesses.length > 0 && (
              <div className="card">
                <h2 className="mb-3 text-lg font-semibold text-orange-600">Weaknesses</h2>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-orange-500">!</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {analysis.missing_skills && analysis.missing_skills.length > 0 && (
            <div className="card">
              <h2 className="mb-3 text-lg font-semibold">Missing Skills</h2>
              <SkillTags skills={analysis.missing_skills} variant="missing" />
            </div>
          )}

          {analysis.ai_suggestions && analysis.ai_suggestions.length > 0 && (
            <div className="card">
              <h2 className="mb-3 text-lg font-semibold">AI Suggestions</h2>
              <ul className="space-y-3">
                {analysis.ai_suggestions.map((s, i) => (
                  <li key={i} className="rounded-lg bg-primary-50 p-3 text-sm dark:bg-primary-900/20">{s}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.optimized_sections && (
            <div className="card">
              <h2 className="mb-4 text-lg font-semibold">Optimized Sections</h2>
              <div className="space-y-4">
                {Object.entries(analysis.optimized_sections).map(([key, value]) => (
                  <div key={key}>
                    <h3 className="mb-1 text-sm font-medium capitalize text-primary-600">{key.replace(/_/g, ' ')}</h3>
                    <p className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800">
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
