'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { formatBytes } from '@/lib/utils';
import { X, UploadCloud, Loader2, AlertCircle, FileCheck } from 'lucide-react';

interface UploadDocumentModalProps {
  folderId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadDocumentModal({ folderId, isOpen, onClose, onSuccess }: UploadDocumentModalProps) {
  const { user, signInWithGoogle } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setCustomName(selected.name);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Vui lòng đăng nhập để tải tài liệu lên.');
      return;
    }

    if (!file) {
      setError('Vui lòng chọn một tập tin để tải lên.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const supabase = createClient();

      // 1. Upload file to Supabase Storage bucket 'documents'
      const fileExt = file.name.split('.').pop();
      const fileNameClean = file.name.replace(/[^a-zA-Z0-9]/g, '_');
      const filePath = `${user.id}/${Date.now()}_${fileNameClean}.${fileExt}`;

      const { data: storageData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Lỗi Storage: ${uploadError.message}. Vui lòng tạo bucket 'documents' trên Supabase Storage.`);
      }

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(storageData.path);

      const filePublicUrl = publicUrlData.publicUrl;

      // 3. Insert metadata into 'documents' table
      const { error: dbError } = await supabase.from('documents').insert([
        {
          folder_id: folderId,
          user_id: user.id,
          file_name: customName.trim() || file.name,
          file_url: filePublicUrl,
          file_size: file.size,
          view_count: 0,
        },
      ]);

      if (dbError) throw dbError;

      // Reset state & notify
      setFile(null);
      setCustomName('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Upload document error:', err);
      setError(err.message || 'Không thể tải file lên. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 border border-gray-700/60 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Tải Tài Liệu Lên Thư Mục</h3>
              <p className="text-xs text-gray-400">Chấp nhận file PDF, Word, Ảnh, Slide (Tối đa 50MB)</p>
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
              Bạn cần đăng nhập tài khoản để tải tài liệu lên thư mục này.
            </p>
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20"
            >
              Đăng nhập với Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="mt-4 space-y-4">
            {/* File Dropzone */}
            <div className="relative border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-2xl p-6 text-center transition-all bg-gray-900/50 group cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                {file ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-white truncate max-w-[280px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-emerald-400 font-medium">
                      {formatBytes(file.size)} - Sẵn sàng tải lên
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gray-800 text-gray-400 group-hover:text-indigo-400 group-hover:bg-indigo-600/20 flex items-center justify-center transition-all">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-gray-200">
                      Kéo thả file vào đây hoặc <span className="text-indigo-400 font-bold">chọn file</span>
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOCX, PPTX, PNG, JPG (Max 50MB)</p>
                  </>
                )}
              </div>
            </div>

            {/* Custom file name input */}
            {file && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Tên hiển thị tài liệu
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-gray-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={uploading || !file}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {uploading ? 'Đang tải lên...' : 'Bắt Đầu Upload'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
