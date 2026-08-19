'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { SUBJECT_CATEGORIES } from '@/lib/utils';
import { X, FolderPlus, Loader2, AlertCircle } from 'lucide-react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateFolderModal({ isOpen, onClose, onSuccess }: CreateFolderModalProps) {
  const { user, signInWithGoogle } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('CNTT');
  const [customSubject, setCustomSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Vui lòng đăng nhập để tạo thư mục mới.');
      return;
    }

    if (!title.trim()) {
      setError('Tiêu đề thư mục không được để trống.');
      return;
    }

    const finalSubject = subject === 'KHAC' && customSubject.trim() ? customSubject.trim() : subject;

    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const { error: insertError } = await supabase.from('folders').insert([
        {
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          subject: finalSubject,
        },
      ]);

      if (insertError) throw insertError;

      // Reset form & notify parent
      setTitle('');
      setDescription('');
      setSubject('CNTT');
      setCustomSubject('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating folder:', err);
      setError(err.message || 'Đã có lỗi xảy ra khi tạo thư mục.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 border border-gray-700/60 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Tạo Thư Mục Tài Liệu Mới</h3>
              <p className="text-xs text-gray-400">Tạo không gian lưu trữ đề thi, bài giảng cho môn học</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!user ? (
          <div className="py-8 text-center space-y-4">
            <p className="text-sm text-gray-300">
              Bạn cần đăng nhập tài khoản Google để tạo và quản lý thư mục tài liệu.
            </p>
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-600/20"
            >
              Đăng nhập với Google
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Môn học / Chuyên mục *
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-gray-900/90 border border-gray-700/80 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {SUBJECT_CATEGORIES.filter((s) => s.id !== 'all').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>

              {subject === 'KHAC' && (
                <input
                  type="text"
                  placeholder="Nhập tên môn học riêng của bạn..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="mt-2 w-full bg-gray-900/90 border border-gray-700/80 rounded-xl px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>

            {/* Folder Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Tên thư mục tài liệu *
              </label>
              <input
                type="text"
                required
                placeholder="VD: Đề thi giữa kỳ Giải tích 1 - K70, Slide Kiến trúc máy tính..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-900/90 border border-gray-700/80 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 placeholder-gray-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Mô tả ngắn (Tùy chọn)
              </label>
              <textarea
                rows={3}
                placeholder="Mô tả nội dung tài liệu, giáo viên giảng dạy, năm học..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-900/90 border border-gray-700/80 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 placeholder-gray-500 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="pt-3 border-t border-gray-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Đang tạo...' : 'Tạo Thư Mục'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
