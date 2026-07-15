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
import { useTheme } from '../hooks/useTheme';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

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

  const isDark = theme === 'dark';
  const chartColors = {
    grid: isDark ? '#1e293b' : '#e2e8f0',
    text: isDark ? '#94a3b8' : '#64748b',
    primary: '#7c3aed', // violet-600
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipBorder: isDark ? '#334155' : '#e2e8f0',
    tooltipText: isDark ? '#f8fafc' : '#0f172a',
    radarGrid: isDark ? '#334155' : '#cbd5e1',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Track your resume performance and improvements</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Resumes" value={stats.total_resumes} icon={<FiFileText className="h-6 w-6" />} />
        <StatsCard title="Total Analyses" value={stats.total_analyses} icon={<FiActivity className="h-6 w-6" />} />
        <StatsCard title="Average ATS Score" value={`${stats.average_ats_score}%`} icon={<FiBarChart2 className="h-6 w-6" />} />
        <StatsCard title="Best ATS Score" value={`${stats.best_ats_score}%`} icon={<FiAward className="h-6 w-6" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-200">ATS Score Trend</h2>
          {stats.ats_score_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.ats_score_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: chartColors.text }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: chartColors.text }} />
                <Tooltip contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 8, color: chartColors.tooltipText }} />
                <Line type="monotone" dataKey="score" stroke={chartColors.primary} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: chartColors.tooltipBg }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-slate-500">No analysis data yet. Upload and analyze a resume!</p>
          )}
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-200">Skill Distribution</h2>
          {stats.skill_distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.skill_distribution.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis type="number" tick={{ fontSize: 12, fill: chartColors.text }} />
                <YAxis dataKey="skill" type="category" width={100} tick={{ fontSize: 11, fill: chartColors.text }} />
                <Tooltip contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 8, color: chartColors.tooltipText }} />
                <Bar dataKey="count" fill={chartColors.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-slate-500">Upload resumes to see skill analytics</p>
          )}
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-200">Score Breakdown Radar</h2>
          {stats.skill_radar.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={stats.skill_radar}>
                <PolarGrid stroke={chartColors.radarGrid} />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: chartColors.text }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: chartColors.text }} />
                <Radar name="Score" dataKey="score" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-slate-500">Run an analysis to see score breakdown</p>
          )}
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-200">Recent Analyses</h2>
          {stats.recent_analyses.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_analyses.map((a) => (
                <Link
                  key={a.id}
                  to={`/history/${a.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition-all duration-200 hover:border-primary-300 dark:border-slate-800 dark:hover:border-primary-700 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900/30 dark:hover:bg-slate-900/70"
                >
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{a.analysis_type} Analysis</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(a.created_at)}</p>
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-bold text-primary-700 dark:bg-primary-950/40 dark:text-primary-400 border border-primary-100 dark:border-primary-900/20">
                    {Math.round(a.ats_score)}%
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-slate-500">No recent analyses</p>
          )}
        </div>
      </div>
    </div>
  );
}
