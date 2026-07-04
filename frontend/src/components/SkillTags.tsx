import { FiCheck, FiX } from 'react-icons/fi';

interface SkillTagsProps {
  skills: string[];
  variant?: 'match' | 'missing' | 'neutral';
  max?: number;
}

export default function SkillTags({ skills, variant = 'neutral', max = 20 }: SkillTagsProps) {
  const styles = {
    match: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    missing: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    neutral: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
  };

  const Icon = variant === 'match' ? FiCheck : variant === 'missing' ? FiX : null;

  return (
    <div className="flex flex-wrap gap-2">
      {skills.slice(0, max).map((skill) => (
        <span
          key={skill}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${styles[variant]}`}
        >
          {Icon && <Icon className="h-3 w-3" />}
          {skill}
        </span>
      ))}
    </div>
  );
}
