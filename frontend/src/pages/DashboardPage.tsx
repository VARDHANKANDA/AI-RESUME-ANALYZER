import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFileText, FiBarChart2, FiAward, FiActivity,
} from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import toast from 'react-hot-toast';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { dashboardAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import type { DashboardStats } from '../types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-gray-500">Track your resume performance and improvements</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Resumes" value={stats.total_resumes} icon={<FiFileText className="h-6 w-6" />} />
        <StatsCard title="Total Analyses" value={stats.total_analyses} icon={<FiActivity className="h-6 w-6" />} />
        <StatsCard title="Average ATS Score" value={`${stats.average_ats_score}%`} icon={<FiBarChart2 className="h-6 w-6" />} />
        <StatsCard title="Best ATS Score" value={`${stats.best_ats_score}%`} icon={<FiAward className="h-6 w-6" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">ATS Score Trend</h2>
          {stats.ats_score_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.ats_score_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-gray-500">No analysis data yet. Upload and analyze a resume!</p>
          )}
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Skill Distribution</h2>
          {stats.skill_distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.skill_distribution.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="skill" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-gray-500">Upload resumes to see skill analytics</p>
          )}
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Score Breakdown Radar</h2>
          {stats.skill_radar.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={stats.skill_radar}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-gray-500">Run an analysis to see score breakdown</p>
          )}
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Recent Analyses</h2>
          {stats.recent_analyses.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_analyses.map((a) => (
                <Link
                  key={a.id}
                  to={`/history/${a.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition hover:border-primary-300 dark:border-gray-800 dark:hover:border-primary-700"
                >
                  <div>
                    <p className="font-medium capitalize">{a.analysis_type} Analysis</p>
                    <p className="text-xs text-gray-500">{formatDate(a.created_at)}</p>
                  </div>
                  <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                    {Math.round(a.ats_score)}%
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-gray-500">No recent analyses</p>
          )}
        </div>
      </div>
    </div>
  );
}
