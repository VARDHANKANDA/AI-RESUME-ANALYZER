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
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-1 text-gray-500">Manage your account settings</p>
      </div>

      <div className="card">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-2xl font-bold text-white">
            {user?.full_name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.full_name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            {user?.is_admin && (
              <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                Admin
              </span>
            )}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div>
            <p className="text-xs text-gray-500">Member Since</p>
            <p className="font-medium">{user?.created_at ? formatDate(user.created_at) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Account ID</p>
            <p className="font-medium">#{user?.id}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Full Name</label>
            <input
              {...register('full_name', { required: 'Name is required' })}
              className="input-field"
            />
            {errors.full_name && <p className="mt-1 text-sm text-red-500">{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Bio</label>
            <textarea {...register('bio')} rows={4} className="input-field resize-none" placeholder="Tell us about yourself..." />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
