'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { X, Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface CreateSecretCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateSecretCodeModal({ isOpen, onClose, onSuccess }: CreateSecretCodeModalProps) {
  const { user } = useAuth();
  const [codeText, setCodeText] = useState('');
  const [note, setNote] = useState('');
  const [expertName, setExpertName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('japan, hd, top1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Vui lòng đăng nhập để thực hiện.');
      return;
    }

    if (!codeText.trim()) {
      setError('Mã code không được để trống.');
      return;
    }

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { error: insertError } = await supabase.from('stress_relief_codes').insert([
        {
          user_id: user.id,
          code_text: codeText.trim().toUpperCase(),
          note: note.trim() || (expertName.trim() ? `Đề xuất bởi: ${expertName.trim()}` : null),
          tags: tagsArray.length > 0 ? tagsArray : ['hot'],
        },
      ]);

      if (insertError) throw insertError;

      setCodeText('');
      setNote('');
      setExpertName('');
      setImageUrl('');
      setTagsInput('japan, hd, top1');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error adding secret code:', err);
      setError(err.message || 'Lỗi khi thêm mã code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 border border-pink-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-600/20 text-pink-400 rounded-xl border border-pink-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Thêm Secret Code Mới</h3>
              <p className="text-xs text-gray-400">Lưu trữ mã code giải trí cá nhân & chia sẻ cộng đồng</p>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Mã Secret Code *
            </label>
            <input
              type="text"
              required
              placeholder="VD: SSIS-888, MIDE-666, STARS-999..."
              value={codeText}
              onChange={(e) => setCodeText(e.target.value)}
              className="w-full bg-gray-950/90 border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-pink-400 focus:outline-none focus:border-pink-500 placeholder-gray-600 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Tên Chuyên Gia / Diễn Viên Đề Xuất (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="VD: Chuyên gia Yua Mikami, Eimi Fukada..."
              value={expertName}
              onChange={(e) => setExpertName(e.target.value)}
              className="w-full bg-gray-900/90 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-pink-500 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Ghi chú ngắn / Lý do đề xuất
            </label>
            <input
              type="text"
              placeholder="VD: Siêu phẩm kịch bản đỉnh cao, đùa vui giải trí nhẹ nhàng..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-gray-900/90 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-pink-500 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Thẻ phân loại (Phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              placeholder="japan, hd, hot, trending"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-gray-900/90 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-pink-500 placeholder-gray-500"
            />
          </div>

          <div className="pt-3 border-t border-gray-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !codeText.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-pink-600/20 transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Đang lưu...' : 'Lưu Mã Secret Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
