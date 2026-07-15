import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiTrash2, FiUsers, FiFileText, FiActivity } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import StatsCard from '../components/StatsCard';
import { adminAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import type { AdminUser } from '../types';

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getAnalytics(),
      ]);
      setUsers(usersRes.data);
      setAnalytics(analyticsRes.data);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      fetchData();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Delete failed';
      toast.error(message);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><LoadingSpinner size="lg" /></div>;

  const aiUsage = analytics?.ai_usage as Record<string, number> | undefined;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Admin Panel</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Manage users and view platform analytics</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={analytics?.total_users as number || 0} icon={<FiUsers className="h-6 w-6" />} />
        <StatsCard title="Total Resumes" value={analytics?.total_resumes as number || 0} icon={<FiFileText className="h-6 w-6" />} />
        <StatsCard title="Total Analyses" value={analytics?.total_analyses as number || 0} icon={<FiActivity className="h-6 w-6" />} />
        <StatsCard title="AI Tokens Used" value={aiUsage?.total_tokens_used || 0} icon={<FiActivity className="h-6 w-6" />} />
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-200">Users ({users.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">User</th>
                <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Role</th>
                <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Resumes</th>
                <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Analyses</th>
                <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Joined</th>
                <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                  <td className="py-4">
                    <p className="font-bold text-slate-850 dark:text-slate-200">{user.full_name}</p>
                    <p className="text-xs text-slate-450 mt-0.5">{user.email}</p>
                  </td>
                  <td className="py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${user.is_admin ? 'bg-red-50 text-red-700 border border-red-150 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/20' : 'bg-slate-100 text-slate-750 border border-slate-200 dark:bg-slate-850 dark:text-slate-300 dark:border-slate-700/60'}`}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="py-4 text-slate-755 dark:text-slate-300 font-medium">{user.resume_count}</td>
                  <td className="py-4 text-slate-755 dark:text-slate-300 font-medium">{user.analysis_count}</td>
                  <td className="py-4 text-slate-500 dark:text-slate-455">{formatDate(user.created_at)}</td>
                  <td className="py-4">
                    {!user.is_admin && (
                      <button onClick={() => deleteUser(user.id)} className="rounded-xl p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer" aria-label="Delete User">
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
