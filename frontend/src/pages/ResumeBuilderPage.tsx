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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resume Builder</h1>
          <p className="mt-1 text-gray-500">Build ATS-friendly resume sections with strong action verbs</p>
        </div>
        <button onClick={copyAll} className="btn-secondary"><FiCopy /> Copy All</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-1">
          {SECTIONS.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                activeSection === section
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              {section}
            </button>
          ))}
        </div>

        <div className="card lg:col-span-3">
          <h2 className="mb-4 text-lg font-semibold">{activeSection}</h2>
          <textarea
            value={sections[activeSection]}
            onChange={(e) => updateSection(activeSection, e.target.value)}
            rows={12}
            className="input-field resize-none font-mono text-sm"
            placeholder={`Write your ${activeSection.toLowerCase()} here. Use action verbs like: Led, Developed, Implemented, Optimized, Achieved...`}
          />
          <div className="mt-4 rounded-lg bg-primary-50 p-4 text-sm dark:bg-primary-900/20">
            <p className="font-medium text-primary-700 dark:text-primary-400">Tips for {activeSection}:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600 dark:text-gray-300">
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
