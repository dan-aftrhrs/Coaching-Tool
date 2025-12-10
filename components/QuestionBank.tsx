import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface QuestionBankProps {
  title: string;
  questions: string[];
}

export const QuestionBank: React.FC<QuestionBankProps> = ({ title, questions }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors"
      >
        <span className="flex items-center text-sm font-medium text-blue-800 dark:text-blue-300">
          <HelpCircle className="w-4 h-4 mr-2" />
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-4 py-3 bg-white dark:bg-slate-900">
          <ul className="space-y-2">
            {questions.map((q, idx) => (
              <li key={idx} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-b border-slate-50 dark:border-slate-800 last:border-0 pb-1 last:pb-0">
                • {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};