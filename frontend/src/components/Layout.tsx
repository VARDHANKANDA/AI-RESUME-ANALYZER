import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-300">
      <Sidebar />
      <main className="md:ml-64 min-h-screen p-4 pt-20 md:p-8 transition-all duration-300">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
