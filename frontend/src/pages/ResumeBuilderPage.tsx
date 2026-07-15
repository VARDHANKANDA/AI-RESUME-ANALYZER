import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiCopy } from 'react-icons/fi';

const SECTIONS = ['Professional Summary', 'Skills', 'Experience', 'Projects', 'Achievements'];

export default function ResumeBuilderPage() {
  const [sections, setSections] = useState<Record<string, string>>({
    'Professional Summary': '',
    Skills: '',
    Experience: '',
    Projects: '',
    Achievements: '',
  });
  const [activeSection, setActiveSection] = useState('Professional Summary');

  const updateSection = (key: string, value: string) => {
    setSections((prev) => ({ ...prev, [key]: value }));
  };

  const copyAll = () => {
    const text = Object.entries(sections)
      .map(([key, val]) => val ? `## ${key}\n${val}` : '')
      .filter(Boolean)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Resume Builder</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Build ATS-friendly resume sections with strong action verbs</p>
        </div>
        <button onClick={copyAll} className="btn-secondary self-start sm:self-auto"><FiCopy /> Copy All</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="flex overflow-x-auto gap-2 pb-3 lg:pb-0 lg:flex-col lg:space-y-1 lg:overflow-x-visible scrollbar-none">
          {SECTIONS.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`whitespace-nowrap rounded-xl px-4 py-3 text-center lg:text-left text-sm font-bold transition-all duration-250 cursor-pointer ${
                activeSection === section
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25 dark:shadow-none'
                  : 'bg-white text-slate-650 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/85 dark:hover:text-white border border-slate-200/60 dark:border-slate-800'
              }`}
            >
              {section}
            </button>
          ))}
        </div>

        <div className="card lg:col-span-3">
          <h2 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-200">{activeSection}</h2>
          <textarea
            value={sections[activeSection]}
            onChange={(e) => updateSection(activeSection, e.target.value)}
            rows={12}
            className="input-field resize-none font-mono text-sm bg-white dark:bg-slate-950"
            placeholder={`Write your ${activeSection.toLowerCase()} here. Use action verbs like: Led, Developed, Implemented, Optimized, Achieved...`}
          />
          <div className="mt-5 rounded-xl border border-primary-100/50 bg-primary-50/30 p-5 text-sm dark:border-primary-900/20 dark:bg-primary-950/10">
            <p className="font-bold text-primary-700 dark:text-primary-400">Tips for {activeSection}:</p>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-slate-600 dark:text-slate-350">
              <li>Use strong action verbs at the start of each bullet</li>
              <li>Include measurable results (%, $, time saved)</li>
              <li>Match keywords from your target job description</li>
              <li>Keep formatting simple for ATS compatibility</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
