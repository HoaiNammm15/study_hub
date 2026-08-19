'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { CreateSecretCodeModal } from '@/components/CreateSecretCodeModal';
import { AuthModal } from '@/components/AuthModal';
import { formatDate } from '@/lib/utils';
import {
  Sparkles,
  Copy,
  Check,
  Plus,
  Search,
  Lock,
  Smile,
  LogIn,
} from 'lucide-react';

interface SecretCodeItem {
  id: string;
  user_id: string;
  code_text: string;
  note: string | null;
  tags: string[];
  created_at: string;
}

const SAMPLE_SECRET_CODES = [
  {
    id: 'sample-1',
    user_id: 'system',
    code_text: 'git commit -m "Fix bug thành công trong tưởng tượng"',
    note: 'Dành cho các coder vừa làm xong feature lúc 3 giờ sáng',
    tags: ['funny', 'git', 'coder'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    user_id: 'system',
    code_text: 'SELECT * FROM life WHERE stress = 0;',
    note: 'Query mong muốn duy nhất của sinh viên mùa thi',
    tags: ['sql', 'database', 'quote'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    user_id: 'system',
    code_text: 'while (alive) { code(); eat(); sleep(); repeat(); }',
    note: 'Vòng lặp bất tận của một lập trình viên chân chính',
    tags: ['life', 'loop', 'code'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    user_id: 'system',
    code_text: 'npm install happiness --save-exact',
    note: 'Gói thư viện được tải nhiều nhất nhưng không có trên npm',
    tags: ['npm', 'js', 'funny'],
    created_at: new Date().toISOString(),
  },
];

export default function SecretPage() {
  const { user, loading: authLoading } = useAuth();
  const [codes, setCodes] = useState<SecretCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchCodes = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('stress_relief_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching secret codes:', error);
        setCodes(SAMPLE_SECRET_CODES);
      } else {
        setCodes(data && data.length > 0 ? data : SAMPLE_SECRET_CODES);
      }
    } catch (err) {
      console.error(err);
      setCodes(SAMPLE_SECRET_CODES);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleCopy = (id: string, text: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredCodes = codes.filter(
    (item) =>
      item.code_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-400">Đang xác thực quyền truy cập...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-12 glass-panel rounded-3xl p-8 sm:p-10 text-center space-y-6 border border-purple-500/20 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Khu Vực Riêng Tư (Secret Zone)</h2>
          <p className="text-sm text-gray-300 mt-2 leading-relaxed">
            Góc Stress Relief Codes chứa các câu lệnh giải trí, meme code và thủ thuật độc quyền chỉ dành riêng cho tài khoản đã đăng nhập.
          </p>
        </div>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-purple-600/30"
        >
          <LogIn className="w-4 h-4" /> Đăng Nhập / Đăng Ký Để Mở Khóa
        </button>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/40 via-pink-950/30 to-gray-900/40 border border-purple-500/20 p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              Góc Giải Trí & Stress Relief
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Secret Code & Meme Coder
            </h1>
            <p className="text-sm text-gray-300 max-w-xl">
              Tổng hợp những dòng code hài hước, status chill và mã lệnh độc lạ. Sao chép 1 chạm để chia sẻ với bạn bè!
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-purple-600/30 shrink-0"
          >
            <Plus className="w-4 h-4" /> Đóng góp Secret Code
          </button>
        </div>
      </section>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm theo nội dung code, ghi chú hoặc thẻ tag (funny, sql, git...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-900/80 border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        />
      </div>

      {/* CARD GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 glass-card rounded-2xl p-6 animate-pulse" />
          ))}
        </div>
      ) : filteredCodes.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-gray-800 p-8 space-y-3">
          <Smile className="w-10 h-10 mx-auto text-purple-400" />
          <h3 className="text-base font-bold text-white">Chưa tìm thấy mã code nào</h3>
          <p className="text-xs text-gray-400">Hãy là người đóng góp dòng code hài hước đầu tiên!</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
          >
            <Plus className="w-4 h-4" /> Đóng góp ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCodes.map((item) => {
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="group glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4 border border-gray-800/80 relative overflow-hidden"
              >
                {/* Code text block */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500">{formatDate(item.created_at)}</span>
                  </div>

                  <div className="bg-gray-950/90 rounded-xl p-4 border border-gray-800/80 relative group-hover:border-purple-500/30 transition-colors">
                    <code className="text-xs sm:text-sm font-mono text-purple-300 whitespace-pre-wrap break-all leading-relaxed">
                      {item.code_text}
                    </code>
                  </div>

                  {item.note && (
                    <p className="text-xs text-gray-400 italic">
                      💡 {item.note}
                    </p>
                  )}
                </div>

                {/* 1-Touch Copy Button */}
                <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-medium">
                    {isCopied ? 'Đã sao chép vào bộ nhớ tạm!' : 'Click nút bên cạnh để copy 1 chạm'}
                  </span>

                  <button
                    onClick={() => handleCopy(item.id, item.code_text)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isCopied
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? 'Đã Copy!' : 'Copy 1 chạm'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      <CreateSecretCodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCodes}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
