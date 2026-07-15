import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiDownload, FiFilter } from 'react-icons/fi';
import ATSScoreBreakdown from '../components/ATSScoreBreakdown';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { analysisAPI } from '../services/api';
import { downloadBlob, formatDate } from '../utils/helpers';
import type { Analysis } from '../types';

export default function HistoryPage() {
  const { id } = useParams();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selected, setSelected] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');
  const pageSize = 10;

  useEffect(() => {
    analysisAPI.history({ page, page_size: pageSize, analysis_type: filter || undefined })
      .then(({ data }) => {
        setAnalyses(data.items);
        setTotal(data.total);
      })
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, [page, filter]);

  useEffect(() => {
    if (id) {
      analysisAPI.get(Number(id))
        .then(({ data }) => setSelected(data))
        .catch(() => toast.error('Analysis not found'));
    }
  }, [id]);

  const downloadReport = async (analysisId: number) => {
    try {
      const { data } = await analysisAPI.downloadReport(analysisId);
      downloadBlob(data, `analysis_${analysisId}.pdf`);
      toast.success('Report downloaded');
    } catch {
      toast.error('Download failed');
    }
  };

  if (selected) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/history" className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">← Back to History</Link>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white capitalize">{selected.analysis_type} Analysis</h1>
            <p className="text-sm text-slate-400 mt-1">{formatDate(selected.created_at)}</p>
          </div>
          <button onClick={() => downloadReport(selected.id)} className="btn-secondary">
            <FiDownload /> Download PDF
          </button>
        </div>
        <div className="card">
          <ATSScoreBreakdown
            score={selected.ats_score}
            breakdown={selected.ats_breakdown}
            showMatch={selected.analysis_type === 'compare'}
            matchPercentage={selected.match_percentage}
          />
        </div>
        {selected.summary && (
          <div className="card border-l-4 border-l-primary-500">
            <h2 className="mb-2 font-bold text-slate-800 dark:text-slate-200">Summary</h2>
            <p className="text-slate-650 leading-relaxed dark:text-slate-350 text-sm md:text-base">{selected.summary}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Analysis History</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">View past resume analyses and comparisons</p>
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-slate-400" />
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="input-field w-auto bg-white dark:bg-slate-950">
            <option value="">All Types</option>
            <option value="analyze">Analyze</option>
            <option value="compare">Compare</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : analyses.length === 0 ? (
          <p className="py-12 text-center text-slate-500 dark:text-slate-400 font-medium">No analysis history yet</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Type</th>
                    <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">ATS Score</th>
                    <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Match %</th>
                    <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                    <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {analyses.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="py-4 capitalize font-semibold text-slate-800 dark:text-slate-200">{a.analysis_type}</td>
                      <td className="py-4 font-bold text-slate-800 dark:text-slate-200">{Math.round(a.ats_score)}%</td>
                      <td className="py-4 text-slate-700 dark:text-slate-300 font-medium">{a.match_percentage ? `${Math.round(a.match_percentage)}%` : '—'}</td>
                      <td className="py-4 text-slate-500 dark:text-slate-450">{formatDate(a.created_at)}</td>
                      <td className="py-4">
                        <div className="flex gap-3">
                          <Link to={`/history/${a.id}`} className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">View</Link>
                          <button onClick={() => downloadReport(a.id)} className="text-slate-550 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 font-semibold transition-colors cursor-pointer">PDF</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
