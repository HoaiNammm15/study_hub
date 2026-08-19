'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { CreateFolderModal } from '@/components/CreateFolderModal';
import { SUBJECT_CATEGORIES, getSubjectMeta, formatDate } from '@/lib/utils';
import {
  Search,
  FolderPlus,
  Folder,
  FileText,
  Clock,
  Sparkles,
  BookOpen,
  User as UserIcon,
  ChevronRight,
  TrendingUp,
  Layers,
} from 'lucide-react';

interface FolderItem {
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
  documents?: { count: number }[];
}

export default function HomePage() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from('folders')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url, email),
          documents (count)
        `)
        .order('created_at', { ascending: false });

      if (selectedSubject !== 'all') {
        query = query.eq('subject', selectedSubject);
      }

      const { data, error } = await query;
      if (error) throw error;
      setFolders(data || []);
    } catch (err) {
      console.error('Error fetching folders:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSubject]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Client-side search filter
  const filteredFolders = folders.filter((folder) => {
    const matchesSearch =
      folder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (folder.description && folder.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      folder.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-10 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 rounded-3xl bg-gradient-to-b from-indigo-950/40 via-gray-900/40 to-transparent border border-indigo-500/10 p-6 sm:p-10 text-center sm:text-left">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto sm:mx-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Nền tảng chia sẻ học tập 100% Miễn phí
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Kho Tài Liệu Học Tập & <br className="hidden sm:inline" />
            <span className="text-gradient">Diễn Đàn Cộng Đồng Sinh Viên</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl font-normal leading-relaxed">
            Nơi tổng hợp đề thi, bài giảng, slide và thảo luận môn học. Lưu trữ an toàn, truy cập nhanh chóng mọi lúc mọi nơi.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-95 text-sm"
            >
              <FolderPlus className="w-5 h-5" />
              Tạo Thư Mục Mới
            </button>

            <Link
              href="/secret"
              className="flex items-center gap-2 px-5 py-3 glass-card hover:bg-gray-800/80 text-gray-200 font-medium rounded-2xl text-sm transition-all border border-gray-700/60"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Góc Stress Relief
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-800/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{folders.length}</p>
                <p className="text-xs text-gray-400">Thư mục tài liệu</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">100% Free</p>
                <p className="text-xs text-gray-400">Không giới hạn</p>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">Real-time</p>
                <p className="text-xs text-gray-400">Cập nhật liên tục</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH & SUBJECT FILTERS */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm môn học, tiêu đề thư mục, mã môn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/80 border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Action button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
          >
            <FolderPlus className="w-4 h-4" />
            Tạo thư mục
          </button>
        </div>

        {/* Subject Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {SUBJECT_CATEGORIES.map((cat) => {
            const isSelected = selectedSubject === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedSubject(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/20'
                    : 'bg-gray-900/60 text-gray-300 border-gray-800 hover:border-gray-700 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* FOLDER GRID SECTION */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-indigo-400" />
            Danh Sách Thư Mục Tài Liệu
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            Hiển thị {filteredFolders.length} thư mục
          </span>
        </div>

        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 glass-card rounded-2xl p-6 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-20 h-5 bg-gray-800 rounded-full" />
                  <div className="w-3/4 h-6 bg-gray-800 rounded-lg" />
                  <div className="w-full h-4 bg-gray-800/60 rounded" />
                </div>
                <div className="w-full h-8 bg-gray-800/40 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredFolders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 glass-panel rounded-3xl border border-gray-800/80 p-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Folder className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Chưa tìm thấy thư mục nào</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
                {searchTerm
                  ? `Không tìm thấy kết quả phù hợp với từ khóa "${searchTerm}".`
                  : 'Chưa có thư mục tài liệu nào trong môn học này. Hãy là người đầu tiên tạo thư mục!'}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
            >
              <FolderPlus className="w-4 h-4" />
              Tạo thư mục mới ngay
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFolders.map((folder) => {
              const subjectMeta = getSubjectMeta(folder.subject);
              const docCount = folder.documents?.[0]?.count || 0;
              const creatorName =
                folder.profiles?.full_name || folder.profiles?.email?.split('@')[0] || 'Ẩn danh';
              const creatorAvatar = folder.profiles?.avatar_url;

              return (
                <Link
                  key={folder.id}
                  href={`/folders/${folder.id}`}
                  className="group glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Top row: Subject Badge & Doc count */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full border ${subjectMeta.badge}`}
                      >
                        {subjectMeta.label}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        {docCount} file
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {folder.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-400 line-clamp-2 font-normal leading-relaxed">
                      {folder.description || 'Chưa có mô tả chi tiết cho thư mục này.'}
                    </p>
                  </div>

                  {/* Bottom Footer: User Info & Arrow */}
                  <div className="pt-4 mt-4 border-t border-gray-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {creatorAvatar ? (
                        <img
                          src={creatorAvatar}
                          alt={creatorName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                          <UserIcon className="w-3 h-3" />
                        </div>
                      )}
                      <span className="text-xs text-gray-300 truncate max-w-[120px]">
                        {creatorName}
                      </span>
                      <span className="text-[10px] text-gray-500">· {formatDate(folder.created_at)}</span>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-gray-800/60 group-hover:bg-indigo-600 group-hover:text-white text-gray-400 flex items-center justify-center transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* CREATE FOLDER MODAL */}
      <CreateFolderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchFolders}
      />
    </div>
  );
}
