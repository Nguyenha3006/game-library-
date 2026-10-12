import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ApiProblemError } from '../types';

interface ErrorAlertProps {
  error: Error | any;
  onRetry?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onRetry, className = '' }) => {
  if (!error) return null;

  const problem: ApiProblemError | undefined = error.problem;

  const title = problem?.title || error.message || 'Đã xảy ra lỗi không xác định';
  const code = problem?.code || 'UNKNOWN_ERROR';
  const requestId = problem?.request_id;
  const status = problem?.status;
  const errors = problem?.errors;

  return (
    <div
      className={`rounded-xl border border-rose-500/30 bg-rose-950/20 p-5 text-rose-200 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-rose-100">{title}</h4>
            {status && (
              <span className="px-1.5 py-0.5 text-xs rounded bg-rose-500/20 text-rose-300 font-mono">
                HTTP {status}
              </span>
            )}
            <span className="px-1.5 py-0.5 text-xs rounded bg-slate-800 text-slate-300 font-mono">
              {code}
            </span>
          </div>

          {errors && errors.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm bg-rose-950/40 rounded-lg p-3 border border-rose-500/20">
              {errors.map((e, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-rose-300">
                  <span className="text-rose-400 font-medium font-mono">[{e.field}]:</span>
                  <span>{e.message}</span>
                </li>
              ))}
            </ul>
          )}

          {requestId && (
            <div className="mt-2 text-xs text-rose-300/70 font-mono">
              Request ID: {requestId}
            </div>
          )}
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
};
