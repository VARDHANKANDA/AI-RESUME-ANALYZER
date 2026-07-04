import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import AnalyzePage from './pages/AnalyzePage';
import ComparePage from './pages/ComparePage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import CoverLetterPage from './pages/CoverLetterPage';
import InterviewPage from './pages/InterviewPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: '#1f2937', color: '#f9fafb', borderRadius: '8px' },
            }}
          />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/analyze" element={<AnalyzePage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/history/:id" element={<HistoryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/resume-builder" element={<ResumeBuilderPage />} />
                <Route path="/cover-letter" element={<CoverLetterPage />} />
                <Route path="/interview" element={<InterviewPage />} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute adminOnly />}>
              <Route element={<Layout />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
