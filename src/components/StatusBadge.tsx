import React from 'react';
import { DisplayStatus } from '../types';

interface StatusBadgeProps {
  status: DisplayStatus | string;
  className?: string;
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  awaiting_build: {
    label: 'Chờ bàn giao build',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  processing_build: {
    label: 'Đang kiểm tra build',
    bg: 'bg-sky-50 border-sky-200',
    text: 'text-sky-800',
    dot: 'bg-sky-500 animate-pulse',
  },
  build_failed: {
    label: 'Build cần xử lý',
    bg: 'bg-rose-50 border-rose-200',
    text: 'text-rose-800',
    dot: 'bg-rose-500',
  },
  pending_technical: {
    label: 'Chờ QA kỹ thuật',
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    dot: 'bg-blue-600',
  },
  pending_content: {
    label: 'Chờ duyệt nội dung',
    bg: 'bg-purple-50 border-purple-200',
    text: 'text-purple-800',
    dot: 'bg-purple-600',
  },
  approved: {
    label: 'Đã duyệt, chờ phát hành',
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-800',
    dot: 'bg-emerald-600',
  },
  publishing: {
    label: 'Đang phát hành',
    bg: 'bg-sky-50 border-sky-200',
    text: 'text-sky-800',
    dot: 'bg-sky-500 animate-ping',
  },
  publish_failed: {
    label: 'Phát hành gặp lỗi',
    bg: 'bg-rose-50 border-rose-200',
    text: 'text-rose-800',
    dot: 'bg-rose-500',
  },
  published: {
    label: 'Đã lên kho học tập',
    bg: 'bg-emerald-50 border-emerald-300',
    text: 'text-emerald-800 font-semibold',
    dot: 'bg-emerald-600',
  },
  rejected: {
    label: 'Từ chối hồ sơ',
    bg: 'bg-rose-50 border-rose-200',
    text: 'text-rose-800',
    dot: 'bg-rose-500',
  },
  suspended: {
    label: 'Tạm ngừng phục vụ',
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = STATUS_MAP[status];

  if (!config) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-full border border-yellow-300 bg-yellow-50 text-yellow-800 ${className}`}
        title="Trạng thái ngoài contract quy định"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
        Chưa hỗ trợ ({status})
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${config.bg} ${config.text} shadow-sm ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
