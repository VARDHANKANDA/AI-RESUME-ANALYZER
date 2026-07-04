import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome, FiUpload, FiBarChart2, FiClock, FiUser, FiShield,
  FiSun, FiMoon, FiLogOut, FiFileText, FiMail, FiMessageCircle, FiEdit3,
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5 dark:border-gray-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white font-bold">
          AI
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Resume Analyzer</h1>
          <p className="text-xs text-gray-500">AI-Powered ATS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
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
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`
            }
          >
            <FiShield className="h-5 w-5" />
            Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium">{user?.full_name}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleTheme} className="btn-secondary flex-1">
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>
          <button onClick={handleLogout} className="btn-secondary flex-1 text-red-600">
            <FiLogOut />
          </button>
        </div>
      </div>
    </aside>
  );
}
