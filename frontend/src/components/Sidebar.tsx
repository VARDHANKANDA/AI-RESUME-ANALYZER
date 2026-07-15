import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome, FiUpload, FiBarChart2, FiClock, FiUser, FiShield,
  FiSun, FiMoon, FiLogOut, FiFileText, FiMail, FiMessageCircle, FiEdit3,
  FiMenu, FiX
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const navItems = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/upload', icon: FiUpload, label: 'Upload Resume' },
  { to: '/analyze', icon: FiBarChart2, label: 'Analyze' },
  { to: '/compare', icon: FiFileText, label: 'Compare' },
  { to: '/history', icon: FiClock, label: 'History' },
  { to: '/resume-builder', icon: FiEdit3, label: 'Resume Builder' },
  { to: '/cover-letter', icon: FiMail, label: 'Cover Letter' },
  { to: '/interview', icon: FiMessageCircle, label: 'Interview Prep' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsOpen(false);

  // Common sidebar content
  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white font-bold shadow-md shadow-primary-500/20">
          AI
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Resume Analyzer</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">AI-Powered ATS Suite</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-400 border-l-4 border-primary-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
        {user?.is_admin && (
          <NavLink
            to="/admin"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-l-4 border-red-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
              }`
            }
          >
            <FiShield className="h-5 w-5" />
            Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-100/80 p-3 dark:bg-slate-800/80 border border-slate-200/40 dark:border-slate-800/40">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-indigo-600 text-sm font-bold text-white shadow">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">{user?.full_name}</p>
            <p className="truncate text-xs text-slate-500 font-medium mt-0.5">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleTheme} className="btn-secondary flex-1 px-2 py-2" aria-label="Toggle Theme">
            {theme === 'dark' ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
          </button>
          <button onClick={handleLogout} className="btn-secondary flex-1 text-red-600 hover:text-red-700 hover:border-red-200 dark:hover:border-red-900/40 px-2 py-2" aria-label="Log Out">
            <FiLogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-[#0f172a] md:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Open Menu"
          >
            <FiMenu size={20} />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 text-white font-bold text-sm">
            AI
          </div>
          <span className="text-md font-bold text-slate-900 dark:text-white">Resume Analyzer</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
        </div>
      </header>

      {/* Desktop Persistent Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0f172a] md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Off-canvas Drawer */}
      <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
        {/* Backdrop overlay */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeSidebar} />

        {/* Drawer container */}
        <aside className={`absolute left-0 top-0 bottom-0 flex h-full w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0f172a] transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute right-4 top-4">
            <button
              onClick={closeSidebar}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Close Menu"
            >
              <FiX size={20} />
            </button>
          </div>
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
