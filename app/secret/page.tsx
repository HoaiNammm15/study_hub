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
  Film,
  Flame,
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
    code_text: 'SSIS-888',
    note: 'Bản HD siêu nét hot tuần này cho anh em giải tỏa stress',
    tags: ['japan', 'hd', 'hot'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    user_id: 'system',
    code_text: 'MIDE-666',
    note: 'Nội dung cực hay, không thể bỏ qua',
    tags: ['japan', 'chill'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    user_id: 'system',
    code_text: 'STARS-999',
    note: 'Siêu phẩm cực phẩm giải trí đêm khuya',
    tags: ['full-hd', 'hot', 'stars'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    user_id: 'system',
    code_text: 'IPX-555',
    note: 'Top trending được bình chọn nhiều nhất',
    tags: ['trending', 'japan'],
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
        setCodes([]);
      } else {
        setCodes(data || []);
      }
    } catch (err) {
      console.error(err);
      setCodes([]);
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
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-400">Đang xác thực quyền truy cập...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-12 glass-panel rounded-3xl p-8 sm:p-10 text-center space-y-6 border border-pink-500/20 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Khu Vực Riêng Tư (Secret Code Vault)</h2>
          <p className="text-sm text-gray-300 mt-2 leading-relaxed">
            Góc lưu trữ Secret Code giải trí riêng tư dành cho tài khoản đã đăng nhập. Tìm kiếm mã nhanh chóng & copy 1 chạm.
          </p>
        </div>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-pink-600/30"
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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/40 via-pink-950/30 to-gray-900/40 border border-pink-500/20 p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold uppercase">
              <Flame className="w-3.5 h-3.5 text-pink-400 animate-bounce" />
              Góc Giải Trí - Secret Code Vault
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Lưu Trữ Mã Secret Code & Giải Trí
            </h1>
            <p className="text-sm text-gray-300 max-w-xl">
              Kho lưu trữ mã code cá nhân & chia sẻ cộng đồng. Tra cứu mã theo tên, ghi chú và sao chép 1 chạm siêu tiện lợi!
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-pink-600/30 shrink-0"
          >
            <Plus className="w-4 h-4" /> Thêm Mã Code Mới
          </button>
        </div>
      </section>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm mã code (SSIS, MIDE, STARS...), ghi chú hoặc thẻ tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-900/80 border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
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
          <Film className="w-10 h-10 mx-auto text-pink-400" />
          <h3 className="text-base font-bold text-white">Chưa tìm thấy mã code nào</h3>
          <p className="text-xs text-gray-400">Hãy thêm mã code đầu tiên của bạn vào kho lưu trữ!</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl text-xs font-bold"
          >
            <Plus className="w-4 h-4" /> Thêm mã code ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCodes.map((item, index) => {
            const isCopied = copiedId === item.id;
            // Chuyên gia đề xuất mẫu ngẫu nhiên nổi tiếng nếu chưa ghi rõ
            const avatarList = [
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
            ];
            const expertAvatar = avatarList[index % avatarList.length];

            return (
              <div
                key={item.id}
                className="group glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4 border border-gray-800/80 relative overflow-hidden hover:border-pink-500/40 transition-all hover:shadow-xl hover:shadow-pink-500/10"
              >
                {/* Background Character Mascot / Expert Glow */}
                <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 group-hover:opacity-25 transition-opacity pointer-events-none">
                  <img
                    src={expertAvatar}
                    alt="Expert mascot"
                    className="w-full h-full object-cover rounded-full filter drop-shadow-[0_0_12px_rgba(236,72,153,0.8)]"
                  />
                </div>

                {/* Code text block */}
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500">{formatDate(item.created_at)}</span>
                  </div>

                  {/* Main Code Highlight */}
                  <div className="bg-gray-950/90 rounded-xl p-4 border border-gray-800/80 flex items-center justify-between group-hover:border-pink-500/40 transition-colors shadow-inner">
                    <span className="text-base font-mono font-extrabold text-pink-400 tracking-wider">
                      {item.code_text}
                    </span>
                    <button
                      onClick={() => handleCopy(item.id, item.code_text)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isCopied
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-pink-600/20 hover:bg-pink-600 text-pink-300 hover:text-white border border-pink-500/30'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {isCopied ? 'Đã Copy' : 'Copy Code'}
                    </button>
                  </div>

                  {/* Expert Recommendation Note */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <img
                      src={expertAvatar}
                      alt="Chuyên gia"
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-pink-500/40 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-[11px] font-bold text-pink-300 flex items-center gap-1">
                        ⭐ Chuyên Gia Đề Xuất
                      </p>
                      <p className="text-xs text-gray-300 italic leading-relaxed">
                        {item.note || 'Mã phim cực kỳ chất lượng, giải tỏa stress hiệu quả.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400 font-medium relative z-10">
                  <span>{isCopied ? 'Đã lưu vào Clipboard!' : '1-Touch Copy ready'}</span>
                  <span className="text-pink-400/80 font-mono">Verified Code</span>
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
