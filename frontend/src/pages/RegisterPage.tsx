import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { useState } from 'react';

interface RegisterForm {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await registerUser(data.email, data.password, data.full_name);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold text-white backdrop-blur">
            AI
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-primary-200">Start analyzing your resume with AI</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5 !bg-white/95 backdrop-blur dark:!bg-gray-900/95">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-3 text-gray-400" />
              <input
                {...register('full_name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                className="input-field pl-10"
                placeholder="John Doe"
              />
            </div>
            {errors.full_name && <p className="mt-1 text-sm text-red-500">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-gray-400" />
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                className="input-field pl-10"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })}
                type="password"
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                {...register('confirm_password', {
                  required: 'Confirm password',
                  validate: (v) => v === watch('password') || 'Passwords do not match',
                })}
                type="password"
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
            {errors.confirm_password && <p className="mt-1 text-sm text-red-500">{errors.confirm_password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
