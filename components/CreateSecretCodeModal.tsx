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
  const [expertName, setExpertName] = useState('Mr. Minh');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tagsInput, setTagsInput] = useState('japan, top1, chill');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preset transparent PNG characters / avatars
  const PRESET_AVATARS = [
    { name: 'Mr. Minh (Chuyên Gia Đêm Khing)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
    { name: 'Chuyên Gia Yua', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80' },
    { name: 'Giáo Sơ Eimi', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80' },
  ];

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

    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      let finalImageUrl = imageUrl.trim();

      // If user uploaded an image file from their machine, upload to Supabase storage
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileNameClean = imageFile.name.replace(/[^a-zA-Z0-9]/g, '_');
        const filePath = `experts/${user.id}/${Date.now()}_${fileNameClean}.${fileExt}`;

        const { data: storageData, error: uploadErr } = await supabase.storage
          .from('documents')
          .upload(filePath, imageFile, { upsert: true });

        if (!uploadErr && storageData) {
          const { data: publicUrlData } = supabase.storage
            .from('documents')
            .getPublicUrl(storageData.path);
          finalImageUrl = publicUrlData.publicUrl;
        }
      }

      const tagsArray = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      // Pack metadata into JSON string stored in note column
      const notePayload = JSON.stringify({
        text: note.trim() || 'Mã phim được tuyển chọn cực kỳ chất lượng!',
        expert_name: expertName.trim() || 'Mr. Minh',
        expert_image: finalImageUrl || PRESET_AVATARS[0].url,
      });

      const { error: insertError } = await supabase.from('stress_relief_codes').insert([
        {
          user_id: user.id,
          code_text: codeText.trim().toUpperCase(),
          note: notePayload,
          tags: tagsArray.length > 0 ? tagsArray : ['hot'],
        },
      ]);

      if (insertError) throw insertError;

      setCodeText('');
      setNote('');
      setExpertName('Mr. Minh');
      setImageUrl('');
      setTagsInput('japan, top1, chill');
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
              Tên Chuyên Gia / Nhân Vật Đề Xuất *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Mr. Minh, Chuyên gia Yua, Giáo sư Eimi..."
              value={expertName}
              onChange={(e) => setExpertName(e.target.value)}
              className="w-full bg-gray-900/90 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-pink-500 placeholder-gray-500"
            />
          </div>

          {/* Upload Image Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Ảnh Chuyên Gia / Nhân Vật * (Tải Từ Thiết Bị)
            </label>

            <div className="relative border-2 border-dashed border-pink-500/40 hover:border-pink-500 bg-gray-950/60 rounded-2xl p-4 text-center transition-all group cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {imageFile ? (
                <div className="flex items-center justify-center gap-3">
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-pink-500"
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-white truncate max-w-[200px]">
                      {imageFile.name}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-semibold">
                      ✓ Đã chọn từ thiết bị (Click để đổi ảnh khác)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="p-2.5 bg-pink-600/20 text-pink-400 rounded-xl group-hover:bg-pink-600 group-hover:text-white transition-all">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-gray-200">
                    Bấm để chọn <span className="text-pink-400">Ảnh từ máy tính / Điện thoại</span>
                  </p>
                  <p className="text-[10px] text-gray-500">Hỗ trợ ảnh PNG tách phông, JPG, WebP</p>
                </div>
              )}
            </div>

            {/* Optional URL Fallback */}
            <div className="pt-1">
              <input
                type="url"
                placeholder="Hoặc dán URL ảnh online (https://.../anh.png)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-pink-500 placeholder-gray-600"
              />
            </div>
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
