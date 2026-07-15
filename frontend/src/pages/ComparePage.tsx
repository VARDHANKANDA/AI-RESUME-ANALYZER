import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiGitMerge } from 'react-icons/fi';
import ATSScoreBreakdown from '../components/ATSScoreBreakdown';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillTags from '../components/SkillTags';
import { analysisAPI, resumeAPI } from '../services/api';
import type { Analysis, Resume } from '../types';

export default function ComparePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [jobTitle, setJobTitle] = useState('Software Engineer');
  const [jobText, setJobText] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    resumeAPI.list({ page_size: 50 }).then(({ data }) => {
      setResumes(data.items);
      if (data.items.length > 0) setSelectedResumeId(data.items[0].id);
    });
  }, []);

  const runCompare = async () => {
    if (!selectedResumeId) return toast.error('Select a resume');
    if (jobText.length < 10) return toast.error('Enter a job description (min 10 chars)');
    setLoading(true);
    setAnalysis(null);
    try {
      const { data } = await analysisAPI.compare({
        resume_id: selectedResumeId,
        job_text: jobText,
        job_title: jobTitle,
      });
      setAnalysis(data);
      toast.success('Comparison complete!');
    } catch {
      toast.error('Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Resume vs Job Matching</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Compare your resume against a job description</p>
      </div>

      <div className="card space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Select Resume</label>
            <select
              value={selectedResumeId || ''}
              onChange={(e) => setSelectedResumeId(Number(e.target.value))}
              className="input-field bg-white dark:bg-slate-950"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>{r.original_filename}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Job Title</label>
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="input-field bg-white dark:bg-slate-950" />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Job Description</label>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            rows={8}
            className="input-field resize-none bg-white dark:bg-slate-950"
            placeholder="Paste the full job description here..."
          />
        </div>
        <button onClick={runCompare} disabled={loading} className="btn-primary py-3">
          {loading ? <LoadingSpinner size="sm" /> : <><FiGitMerge /> Compare Resume</>}
        </button>
      </div>

      {loading && (
        <div className="card flex flex-col items-center py-16">
          <LoadingSpinner size="lg" text="Comparing resume with job description..." />
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-6">
          <div className="card">
            <ATSScoreBreakdown
              score={analysis.ats_score}
              breakdown={analysis.ats_breakdown}
              showMatch
              matchPercentage={analysis.match_percentage}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {analysis.matching_skills && analysis.matching_skills.length > 0 && (
              <div className="card border border-emerald-500/20 bg-emerald-50/10 dark:border-emerald-500/10 dark:bg-emerald-950/5">
                <h2 className="mb-4 text-lg font-bold text-emerald-600 dark:text-emerald-400">Matching Skills</h2>
                <SkillTags skills={analysis.matching_skills} variant="match" />
              </div>
            )}
            {analysis.missing_skills && analysis.missing_skills.length > 0 && (
              <div className="card border border-red-500/20 bg-red-50/10 dark:border-red-500/10 dark:bg-red-950/5">
                <h2 className="mb-4 text-lg font-bold text-red-600 dark:text-red-400">Missing Skills</h2>
                <SkillTags skills={analysis.missing_skills} variant="missing" />
              </div>
            )}
          </div>

          {analysis.skill_gap_analysis && (
            <div className="card">
              <h2 className="mb-5 text-lg font-bold text-slate-800 dark:text-slate-200">Skill Gap Analysis</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {Object.entries(analysis.skill_gap_analysis as Record<string, string[]>).map(([key, items]) => (
                  <div key={key} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10">
                    <h3 className="mb-2 text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">{key.replace(/_/g, ' ')}</h3>
                    <ul className="space-y-2">
                      {(items || []).map((item, i) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-350">• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.ai_suggestions && analysis.ai_suggestions.length > 0 && (
            <div className="card">
              <h2 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-200">Improvement Suggestions</h2>
              <ul className="space-y-3">
                {analysis.ai_suggestions.map((s, i) => (
                  <li key={i} className="rounded-xl border border-primary-100/50 bg-primary-50/30 p-4 text-sm text-slate-700 dark:text-slate-300 dark:bg-primary-950/10 dark:border-primary-900/20">
                    💡 {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
