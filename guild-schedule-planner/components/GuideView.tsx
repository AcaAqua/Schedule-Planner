import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const GuideSection: React.FC<{ titleKey: string; contentKey: string; }> = ({ titleKey, contentKey }) => {
    const { t } = useTranslation();
    return (
        <div className="mb-8 last:mb-0">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">{t(titleKey as any)}</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{t(contentKey as any)}</p>
        </div>
    );
};

const GuideView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6 md:p-8 animate-fadeIn">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
        {t('guide.title')}
      </h1>
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 md:p-8">
        <GuideSection titleKey="guide.section1.title" contentKey="guide.section1.content" />
        <GuideSection titleKey="guide.section2.title" contentKey="guide.section2.content" />
        <GuideSection titleKey="guide.section6.title" contentKey="guide.section6.content" />
        <GuideSection titleKey="guide.section5.title" contentKey="guide.section5.content" />
        <GuideSection titleKey="guide.section3.title" contentKey="guide.section3.content" />
        <GuideSection titleKey="guide.section4.title" contentKey="guide.section4.content" />
        <GuideSection titleKey="guide.section7.title" contentKey="guide.section7.content" />
        <GuideSection titleKey="guide.section8.title" contentKey="guide.section8.content" />
        <GuideSection titleKey="guide.section9.title" contentKey="guide.section9.content" />
      </div>
    </div>
  );
};

export default GuideView;