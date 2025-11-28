import React from 'react';

interface StaticPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const StaticPageLayout: React.FC<StaticPageLayoutProps> = ({ title, children }) => {
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm p-8 md:p-12 animate-fade-in">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">{title}</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none prose-a:text-emerald-600 prose-a:font-semibold hover:prose-a:text-emerald-700 dark:prose-a:text-emerald-400 dark:hover:prose-a:text-emerald-300 prose-headings:font-bold prose-headings:text-slate-800 dark:prose-headings:text-slate-200 prose-strong:text-slate-800 dark:prose-strong:text-slate-200 prose-strong:font-semibold prose-p:leading-relaxed prose-headings:mb-3">
        {children}
      </div>
    </div>
  );
};

export default StaticPageLayout;
