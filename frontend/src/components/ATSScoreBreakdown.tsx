import { getScoreBg, getScoreColor } from '../utils/helpers';
import type { ATSBreakdown } from '../types';

interface ATSScoreBreakdownProps {
  score: number;
  breakdown?: ATSBreakdown | Record<string, number>;
  showMatch?: boolean;
  matchPercentage?: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  skills_match: 'Skills Match',
  experience: 'Experience',
  education: 'Education',
  formatting: 'Formatting',
  keywords: 'Keywords',
  projects: 'Projects',
  certifications: 'Certifications',
  grammar: 'Grammar',
};

export default function ATSScoreBreakdown({
  score,
  breakdown,
  showMatch,
  matchPercentage,
}: ATSScoreBreakdownProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
        <div className="text-center">
          <div className={`relative mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br ${getScoreBg(score)} p-1`}>
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white dark:bg-gray-900">
              <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{Math.round(score)}</span>
              <span className="text-xs text-gray-500">ATS Score</span>
            </div>
          </div>
        </div>
        {showMatch && matchPercentage !== undefined && (
          <div className="text-center">
            <div className={`relative mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br ${getScoreBg(matchPercentage)} p-1`}>
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white dark:bg-gray-900">
                <span className={`text-3xl font-bold ${getScoreColor(matchPercentage)}`}>{Math.round(matchPercentage)}%</span>
                <span className="text-xs text-gray-500">Job Match</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {breakdown && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(breakdown).map(([key, value]) => (
            <div key={key}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {CATEGORY_LABELS[key] || key.replace(/_/g, ' ')}
                </span>
                <span className={`font-medium ${getScoreColor(value)}`}>{Math.round(value)}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill bg-gradient-to-r ${getScoreBg(value)}`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
