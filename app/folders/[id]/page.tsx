'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { UploadDocumentModal } from '@/components/UploadDocumentModal';
import { FileViewerModal } from '@/components/FileViewerModal';
import { CommentSection } from '@/components/CommentSection';
import { getSubjectMeta, formatDate, formatBytes } from '@/lib/utils';
import {
  ArrowLeft,
  FileText,
  UploadCloud,
  Eye,
  Download,
  Clock,
  User as UserIcon,
  Sparkles,
  Loader2,
  FileCode,
  FolderOpen,
  Share2,
  Check,
} from 'lucide-react';

interface FolderDetail {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  subject: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
}

interface DocumentItem {
  id: string;
  folder_id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  view_count: number;
  created_at: string;
}

export default function FolderDetailPage() {
  const params = useParams();
  const folderId = params.id as string;
  const { user } = useAuth();

  const [folder, setFolder] = useState<FolderDetail | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeFileToView, setActiveFileToView] = useState<DocumentItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // AI Summary state
  const [aiSummarizing, setAiSummarizing] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState<string | null>(null);

  const fetchFolderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Fetch folder metadata
      const { data: folderData, error: folderError } = await supabase
        .from('folders')
        .select('*')
        .eq('id', folderId)
        .single();

      if (folderError) throw folderError;
      setFolder(folderData);

      // Fetch documents inside folder
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;
      setDocuments(docsData || []);
    } catch (err) {
      console.error('Error fetching folder details:', err);
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    fetchFolderDetails();
  }, [fetchFolderDetails]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleTriggerAISummary = async () => {
    if (documents.length === 0) return;
    try {
      setAiSummarizing(true);
      setAiSummaryResult(null);

      // Call API Route
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderTitle: folder?.title,
          documentUrl: documents[0].file_url,
          documentName: documents[0].file_name,
        }),
      });

      const data = await res.json();
      setAiSummaryResult(data.summary || 'Không thể tạo tóm tắt tài liệu.');
    } catch (err) {
      console.error('AI Summary error:', err);
      setAiSummaryResult('Lỗi khi gọi dịch vụ Gemini AI.');
    } finally {
      setAiSummarizing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="w-32 h-6 bg-gray-800 rounded-lg" />
        <div className="h-40 glass-panel rounded-3xl p-8 space-y-4" />
        <div className="h-64 glass-panel rounded-3xl p-8" />
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-4 glass-panel rounded-3xl p-10">
        <FolderOpen className="w-12 h-12 mx-auto text-indigo-400" />
        <h2 className="text-xl font-bold text-white">Thư mục không tồn tại</h2>
        <p className="text-sm text-gray-400">Thư mục này có thể đã bị xóa hoặc liên kết không hợp lệ.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Trang Chủ
        </Link>
      </div>
    );
  }

  const subjectMeta = getSubjectMeta(folder.subject);
  const creatorName =
    folder.profiles?.full_name || folder.profiles?.email?.split('@')[0] || 'Ẩn danh';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại Danh Sách Thư Mục
      </Link>

      {/* FOLDER HEADER BANNER */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-indigo-500/20 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${subjectMeta.badge}`}>
            {subjectMeta.label}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 rounded-xl text-xs font-semibold transition-all border border-gray-700/60"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedLink ? 'Đã copy link' : 'Chia sẻ'}
            </button>

            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              <UploadCloud className="w-4 h-4" />
              Tải File Lên
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
          {folder.title}
        </h1>

        {folder.description && (
          <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
            {folder.description}
          </p>
        )}

        <div className="pt-4 border-t border-gray-800/80 flex flex-wrap items-center justify-between text-xs text-gray-400 gap-4">
          <div className="flex items-center gap-2">
            {folder.profiles?.avatar_url ? (
              <img
                src={folder.profiles.avatar_url}
                alt={creatorName}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
            )}
            <span>Đóng góp bởi <b className="text-gray-200">{creatorName}</b></span>
            <span>· {formatDate(folder.created_at)}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4 text-indigo-400" />
              {documents.length} tập tin
            </span>
          </div>
        </div>
      </div>

      {/* AI SUMMARY BANNER (READINESS FEATURE) */}
      {documents.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-purple-500/20 bg-purple-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Gemini AI Tóm Tắt Tài Liệu (Bản thử nghiệm)</h3>
            </div>
            <button
              onClick={handleTriggerAISummary}
              disabled={aiSummarizing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            >
              {aiSummarizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {aiSummarizing ? 'Đang đọc PDF...' : 'Tóm Tắt Ngay'}
            </button>
          </div>

          {aiSummaryResult && (
            <div className="p-4 bg-gray-950/80 rounded-xl text-xs text-gray-200 leading-relaxed border border-purple-500/30 animate-in fade-in">
              <p className="font-bold text-purple-400 mb-1">Kết quả tóm tắt bởi AI:</p>
              {aiSummaryResult}
            </div>
          )}
        </div>
      )}

      {/* DOCUMENTS LIST SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Danh Sách Tập Tin
          </h2>
          <span className="text-xs text-gray-400">{documents.length} File</span>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-3xl border border-gray-800 p-6 space-y-3">
            <UploadCloud className="w-10 h-10 mx-auto text-indigo-400" />
            <h3 className="text-base font-bold text-white">Chưa có file nào trong thư mục này</h3>
            <p className="text-xs text-gray-400">Hãy chia sẻ file bài giảng, đề thi hoặc ghi chú của bạn.</p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              <UploadCloud className="w-4 h-4" /> Tải file đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-800/80"
              >
                <div className="flex items-center gap-3.5 truncate">
                  <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/20 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-sm font-bold text-white truncate hover:text-indigo-400 transition-colors">
                      {doc.file_name}
                    </h4>
                    <p className="text-[11px] text-gray-400 flex items-center gap-3 mt-0.5">
                      <span>{formatBytes(doc.file_size)}</span>
                      <span>· {formatDate(doc.created_at)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveFileToView(doc)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-indigo-500/30"
                  >
                    <Eye className="w-3.5 h-3.5" /> Xem trực tiếp
                  </button>

                  <a
                    href={doc.file_url}
                    download={doc.file_name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-semibold transition-all border border-gray-700/60"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải về
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* COMMENTS SECTION */}
      <CommentSection folderId={folderId} />

      {/* UPLOAD MODAL */}
      <UploadDocumentModal
        folderId={folderId}
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={fetchFolderDetails}
      />

      {/* FILE VIEWER MODAL */}
      <FileViewerModal
        file={activeFileToView}
        onClose={() => setActiveFileToView(null)}
      />
    </div>
  );
}
