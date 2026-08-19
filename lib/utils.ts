import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number | null | undefined, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export const SUBJECT_CATEGORIES = [
  { id: 'all', label: 'Tất cả môn học', color: 'from-blue-600 to-indigo-600', badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { id: 'CNTT', label: 'Công nghệ thông tin', color: 'from-cyan-500 to-blue-600', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { id: 'TOAN', label: 'Toán học & Giải tích', color: 'from-purple-500 to-indigo-600', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'LY', label: 'Vật lý đại cương', color: 'from-amber-500 to-orange-600', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'HOA', label: 'Hóa học & Sinh học', color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { id: 'NGOAI_NGU', label: 'Ngoại ngữ (IELTS/TOEIC)', color: 'from-pink-500 to-rose-600', badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  { id: 'KINH_TE', label: 'Kinh tế & Quản trị', color: 'from-emerald-600 to-green-700', badge: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { id: 'KHAC', label: 'Khác / Tổng hợp', color: 'from-slate-500 to-zinc-600', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
];

export function getSubjectMeta(subjectKey: string) {
  const normalizedKey = subjectKey?.toUpperCase().trim() || 'KHAC';
  const found = SUBJECT_CATEGORIES.find(
    (s) => s.id === normalizedKey || s.label.toLowerCase().includes(subjectKey.toLowerCase())
  );
  return found || {
    id: 'KHAC',
    label: subjectKey || 'Môn học khác',
    color: 'from-indigo-500 to-purple-600',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  };
}
