import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  subtitle?: string;
}

export default function StatsCard({ title, value, icon, trend, subtitle }: StatsCardProps) {
  return (
    <div className="card animate-fade-in group hover:border-primary-300 dark:hover:border-primary-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`mt-2 flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className="rounded-xl bg-primary-50 p-3 text-primary-600 transition group-hover:scale-110 dark:bg-primary-900/30 dark:text-primary-400">
          {icon}
        </div>
      </div>
    </div>
  );
}
