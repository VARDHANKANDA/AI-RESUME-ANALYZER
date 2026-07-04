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
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="mt-1 text-gray-500">Manage users and view platform analytics</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={analytics?.total_users as number || 0} icon={<FiUsers className="h-6 w-6" />} />
        <StatsCard title="Total Resumes" value={analytics?.total_resumes as number || 0} icon={<FiFileText className="h-6 w-6" />} />
        <StatsCard title="Total Analyses" value={analytics?.total_analyses as number || 0} icon={<FiActivity className="h-6 w-6" />} />
        <StatsCard title="AI Tokens Used" value={aiUsage?.total_tokens_used || 0} icon={<FiActivity className="h-6 w-6" />} />
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Users ({users.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Resumes</th>
                <th className="pb-3 font-medium">Analyses</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3">
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${user.is_admin ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800'}`}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="py-3">{user.resume_count}</td>
                  <td className="py-3">{user.analysis_count}</td>
                  <td className="py-3 text-gray-500">{formatDate(user.created_at)}</td>
                  <td className="py-3">
                    {!user.is_admin && (
                      <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:text-red-700">
                        <FiTrash2 />
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
