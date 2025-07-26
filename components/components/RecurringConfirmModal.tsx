import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { Event } from '../types';

interface RecurringConfirmModalProps {
    event: Event;
    action: 'update' | 'delete';
    onClose: () => void;
}

const RecurringConfirmModal: React.FC<RecurringConfirmModalProps> = ({ event, action, onClose }) => {
    const { updateRecurringEvent, deleteRecurringEvent } = useAppContext();
    const { t } = useTranslation();

    const handleConfirm = (mode: 'single' | 'all') => {
        if (action === 'update') {
            updateRecurringEvent(event, mode);
        } else if (action === 'delete') {
            deleteRecurringEvent(event, mode);
        }
        onClose();
    };

    const message = action === 'update' 
        ? t('recurring.confirm.update.message') 
        : t('recurring.confirm.delete.message');

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm animate-slideIn">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('recurring.confirm.title')}</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 flex flex-col sm:flex-row-reverse gap-3">
                    <button
                        onClick={() => handleConfirm('all')}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        {t('recurring.confirm.all')}
                    </button>
                    <button
                        onClick={() => handleConfirm('single')}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-500"
                    >
                        {t('recurring.confirm.single')}
                    </button>
                     <button
                        onClick={onClose}
                        className="w-full sm:w-auto mt-2 sm:mt-0 sm:mr-auto px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md"
                    >
                        {t('recurring.confirm.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecurringConfirmModal;