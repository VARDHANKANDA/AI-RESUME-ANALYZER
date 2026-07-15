import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await registerUser(data.email, data.password, data.full_name);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: unknown) {
      let message = 'Registration failed';
      const responseData = (err as any)?.response?.data;
      if (responseData) {
        if (typeof responseData.detail === 'string') {
          message = responseData.detail;
        } else if (Array.isArray(responseData.detail)) {
          message = responseData.detail.map((d: any) => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(', ');
        }
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0b0f19] p-4 text-slate-900 dark:text-slate-100 selection:bg-primary-500/30 relative overflow-hidden transition-colors duration-300">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-[128px] -z-10 mix-blend-screen pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-[128px] -z-10 mix-blend-screen pointer-events-none"></div>

      <div className="w-full max-w-[440px] animate-fade-in z-10 relative">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-2xl font-bold text-white shadow-lg shadow-primary-500/20">
            AI
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Account</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Start analyzing your resume with AI</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-8 shadow-xl shadow-slate-100 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
            <div className="relative group">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
              <input
                {...register('full_name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:border-slate-700"
                placeholder="John Doe"
              />
            </div>
            {errors.full_name && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
            <div className="relative group">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:border-slate-700"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative group">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
              <input
                {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })}
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:border-slate-700"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
            <div className="relative group">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
              <input
                {...register('confirm_password', {
                  required: 'Confirm password required',
                  validate: (v) => v === watch('password') || 'Passwords do not match',
                })}
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:border-slate-700"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors"
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.confirm_password && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.confirm_password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary-500/20 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 active:scale-98 disabled:opacity-70 disabled:hover:scale-100 pt-3"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline dark:text-primary-400 dark:hover:text-primary-300 transition-colors">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
