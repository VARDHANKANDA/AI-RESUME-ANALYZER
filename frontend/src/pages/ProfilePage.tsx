import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useState } from 'react';
import { formatDate } from '../utils/helpers';

interface ProfileForm {
  full_name: string;
  bio: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: { full_name: user?.full_name || '', bio: user?.bio || '' },
  });

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true);
    try {
      const { data: updated } = await authAPI.updateProfile(data);
      updateUser(updated);
      toast.success('Profile updated');
    } catch {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Profile</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Manage your account settings</p>
      </div>

      <div className="card">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-indigo-600 text-2xl font-bold text-white shadow-lg shadow-primary-500/20">
            {user?.full_name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{user?.full_name}</h2>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-455 mt-0.5">{user?.email}</p>
            {user?.is_admin && (
              <span className="mt-1.5 inline-block rounded-full bg-red-50 border border-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30">
                Admin
              </span>
            )}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-100/50 bg-slate-50 p-4 dark:border-slate-850 dark:bg-slate-950/30">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Member Since</p>
            <p className="font-bold text-slate-850 dark:text-slate-200 mt-1">{user?.created_at ? formatDate(user.created_at) : '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account ID</p>
            <p className="font-bold text-slate-850 dark:text-slate-200 mt-1">#{user?.id}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
            <input
              {...register('full_name', { required: 'Name is required' })}
              className="input-field bg-white dark:bg-slate-950"
            />
            {errors.full_name && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Bio</label>
            <textarea {...register('bio')} rows={4} className="input-field resize-none bg-white dark:bg-slate-950" placeholder="Tell us about yourself..." />
          </div>
          <button type="submit" disabled={loading} className="btn-primary py-3">
            {loading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
