import React, { useEffect, useState } from 'react';
import { Toast as ToastType } from '../types';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from './icons';
import { useAppContext } from '../context/AppContext';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const ICONS = {
  success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
  error: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
  info: <InformationCircleIcon className="w-6 h-6 text-blue-500" />,
};

const TOAST_COLORS = {
  success: 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-700',
  error: 'bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-700',
  info: 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700',
};

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };
  
  return (
    <div
      className={`
        w-full max-w-sm rounded-lg shadow-lg pointer-events-auto
        flex items-start p-4 border
        transition-all duration-300 ease-in-out
        ${TOAST_COLORS[toast.type]}
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      <div className="flex-shrink-0">{ICONS[toast.type]}</div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{toast.message}</p>
      </div>
      <div className="ml-4 flex-shrink-0 flex">
        <button
          onClick={handleClose}
          className="inline-flex rounded-md p-1 text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="sr-only">Close</span>
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
