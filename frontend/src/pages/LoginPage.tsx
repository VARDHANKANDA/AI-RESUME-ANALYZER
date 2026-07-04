import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { useState } from 'react';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090B] p-4 text-[#FAFAFA] selection:bg-[#8B5CF6]/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-[128px] -z-10 mix-blend-screen pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#06B6D4]/10 rounded-full blur-[128px] -z-10 mix-blend-screen pointer-events-none"></div>

      <div className="w-full max-w-[420px] animate-fade-in z-10 relative">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] text-2xl font-bold text-white shadow-[0_0_24px_rgba(139,92,246,0.3)]">
            AI
          </div>
          <h1 className="text-3xl font-bold text-[#FAFAFA] tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-sm text-[#A1A1AA]">Sign in to continue to AI Resume Analyzer</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-[20px] bg-[#18181B] border border-[#3F3F46] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#FAFAFA]">Email</label>
              <div className="relative group">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] group-focus-within:text-[#8B5CF6] transition-colors" size={18} />
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  className="w-full rounded-xl border border-[#3F3F46] bg-[#27272A] pl-11 pr-4 py-3 text-sm text-[#FAFAFA] placeholder:text-[#A1A1AA] transition-all focus:border-[#8B5CF6] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] hover:border-[#A1A1AA]"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-[#EF4444]">{errors.email.message}</p>}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-[#FAFAFA]">Password</label>
                <Link to="#" className="text-xs font-medium text-[#8B5CF6] hover:text-[#7C3AED] transition-colors">Forgot Password?</Link>
              </div>
              <div className="relative group">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] group-focus-within:text-[#8B5CF6] transition-colors" size={18} />
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-xl border border-[#3F3F46] bg-[#27272A] pl-11 pr-11 py-3 text-sm text-[#FAFAFA] placeholder:text-[#A1A1AA] transition-all focus:border-[#8B5CF6] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] hover:border-[#A1A1AA]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#FAFAFA] focus:outline-none transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-[#EF4444]">{errors.password.message}</p>}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-[#3F3F46] bg-[#27272A] text-[#8B5CF6] focus:ring-[#8B5CF6] focus:ring-offset-[#18181B]"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-[#A1A1AA]">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2 focus:ring-offset-[#18181B] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-[#A1A1AA]">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[#8B5CF6] hover:text-[#7C3AED] transition-colors">Sign up</Link>
          </p>

          <div className="mt-8 rounded-xl bg-[#27272A]/50 border border-[#3F3F46]/50 p-4 text-xs text-[#A1A1AA]">
            <p className="mb-1 font-semibold text-[#FAFAFA] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              Demo Admin Credentials
            </p>
            <p className="font-mono mt-1 select-all">admin@resumeanalyzer.com</p>
            <p className="font-mono select-all">Admin@123456</p>
          </div>
        </form>
      </div>
    </div>
  );
}
