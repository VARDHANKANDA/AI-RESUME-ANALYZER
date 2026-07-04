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
            <Link to="/history" className="text-sm text-primary-600 hover:underline">← Back to History</Link>
            <h1 className="mt-2 text-2xl font-bold capitalize">{selected.analysis_type} Analysis</h1>
            <p className="text-sm text-gray-500">{formatDate(selected.created_at)}</p>
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
          <div className="card">
            <h2 className="mb-2 font-semibold">Summary</h2>
            <p className="text-gray-600 dark:text-gray-300">{selected.summary}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analysis History</h1>
          <p className="mt-1 text-gray-500">View past resume analyses and comparisons</p>
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" />
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="input-field w-auto">
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
          <p className="py-8 text-center text-gray-500">No analysis history yet</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">ATS Score</th>
                    <th className="pb-3 font-medium">Match %</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((a) => (
                    <tr key={a.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 capitalize">{a.analysis_type}</td>
                      <td className="py-3 font-medium">{Math.round(a.ats_score)}%</td>
                      <td className="py-3">{a.match_percentage ? `${Math.round(a.match_percentage)}%` : '—'}</td>
                      <td className="py-3 text-gray-500">{formatDate(a.created_at)}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Link to={`/history/${a.id}`} className="text-primary-600 hover:underline">View</Link>
                          <button onClick={() => downloadReport(a.id)} className="text-gray-500 hover:text-primary-600">PDF</button>
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
