import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { Event } from '../types';
import { XMarkIcon } from './icons';

interface ShareModalProps {
  event: Event;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ event, onClose }) => {
  const { state, t } = useAppContext();
  const [copyStatus, setCopyStatus] = useState<'copy' | 'copied'>('copy');

  const formattedText = useMemo(() => {
    const category = state.categories.find(c => c.id === event.categoryId);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
    };

    const startDate = new Date(event.start).toLocaleString(state.settings.language, options);
    const endDate = new Date(event.end).toLocaleString(state.settings.language, options);
    
    const timeText = `${startDate} - ${endDate}`;

    const textParts = [
      `【${event.title}】`,
      ``,
      `📅 ${t('event.start')}: ${timeText}`,
      `📂 ${t('event.category')}: ${category?.name || 'N/A'}`,
    ];

    if (event.description) {
        textParts.push('--------------------');
        textParts.push(event.description);
    }

    return textParts.join('\n');
  }, [event, state.categories, state.settings.language, t]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText).then(() => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('copy'), 2000);
    }).catch(err => {
        console.error("Failed to copy text: ", err);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col animate-slideIn">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('share.title')}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Copy the text below and share it on Discord, X (Twitter), or any other platform.
          </p>
          <textarea
            readOnly
            value={formattedText}
            rows={10}
            className="w-full p-3 text-sm bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex-shrink-0 flex items-center justify-end p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleCopy}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-colors ${
              copyStatus === 'copied' 
              ? 'bg-green-600' 
              : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {t(`share.${copyStatus}`)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
