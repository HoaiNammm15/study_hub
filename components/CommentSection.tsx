'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { formatDate } from '@/lib/utils';
import { MessageSquare, Send, Reply, Loader2, User as UserIcon, AlertCircle } from 'lucide-react';

interface CommentItem {
  id: string;
  folder_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
}

interface CommentSectionProps {
  folderId: string;
}

export function CommentSection({ folderId }: CommentSectionProps) {
  const { user, signInWithGoogle } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<CommentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url, email)
        `)
        .eq('folder_id', folderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Vui lòng đăng nhập để tham gia bình luận.');
      return;
    }

    if (!content.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      const supabase = createClient();

      const { error: insertError } = await supabase.from('comments').insert([
        {
          folder_id: folderId,
          user_id: user.id,
          parent_comment_id: replyingTo ? replyingTo.id : null,
          content: content.trim(),
        },
      ]);

      if (insertError) throw insertError;

      setContent('');
      setReplyingTo(null);
      fetchComments();
    } catch (err: any) {
      console.error('Error adding comment:', err);
      setError(err.message || 'Không thể gửi bình luận. Thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  // Organize top-level comments vs replies
  const rootComments = comments.filter((c) => !c.parent_comment_id);
  const getReplies = (parentId: string) => comments.filter((c) => c.parent_comment_id === parentId);

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-gray-800/80">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          Diễn Đàn Thảo Luận ({comments.length})
        </h3>
        <span className="text-xs text-gray-400">Hỏi đáp & Trao đổi tài liệu</span>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Post comment input */}
      {!user ? (
        <div className="p-6 bg-gray-900/60 rounded-2xl border border-gray-800 text-center space-y-3">
          <p className="text-sm text-gray-300">Đăng nhập tài khoản Google để tham gia trao đổi ý kiến.</p>
          <button
            onClick={signInWithGoogle}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
          >
            Đăng nhập với Google
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {replyingTo && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
              <span>
                Đang trả lời <b>{replyingTo.profiles?.full_name || 'Bình luận'}</b>
              </span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-gray-400 hover:text-white font-bold"
              >
                Hủy
              </button>
            </div>
          )}

          <div className="relative">
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết bình luận hoặc câu hỏi về tài liệu này..."
              className="w-full bg-gray-900/80 border border-gray-800 rounded-2xl p-4 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? 'Đang gửi...' : 'Gửi Bình Luận'}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4 py-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-900/50 rounded-2xl animate-pulse p-4" />
          ))}
        </div>
      ) : rootComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          Chưa có bình luận nào. Hãy gửi bình luận đầu tiên!
        </div>
      ) : (
        <div className="space-y-4">
          {rootComments.map((comment) => {
            const replies = getReplies(comment.id);
            const authorName =
              comment.profiles?.full_name || comment.profiles?.email?.split('@')[0] || 'Ẩn danh';
            const authorAvatar = comment.profiles?.avatar_url;

            return (
              <div key={comment.id} className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-4 space-y-3">
                {/* Main comment */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {authorAvatar ? (
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-white">{authorName}</p>
                      <p className="text-[10px] text-gray-400">{formatDate(comment.created_at)}</p>
                    </div>
                  </div>

                  {user && (
                    <button
                      onClick={() => setReplyingTo(comment)}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded-lg hover:bg-indigo-500/10 transition-all"
                    >
                      <Reply className="w-3.5 h-3.5" /> Trả lời
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-200 pl-11 font-normal leading-relaxed">
                  {comment.content}
                </p>

                {/* Nested Replies */}
                {replies.length > 0 && (
                  <div className="ml-8 pt-3 space-y-3 border-l-2 border-indigo-500/20 pl-4">
                    {replies.map((reply) => {
                      const replyAuthorName =
                        reply.profiles?.full_name || reply.profiles?.email?.split('@')[0] || 'Ẩn danh';
                      const replyAuthorAvatar = reply.profiles?.avatar_url;

                      return (
                        <div key={reply.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            {replyAuthorAvatar ? (
                              <img
                                src={replyAuthorAvatar}
                                alt={replyAuthorName}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold text-purple-300">
                                <UserIcon className="w-3 h-3" />
                              </div>
                            )}
                            <span className="text-xs font-bold text-gray-200">{replyAuthorName}</span>
                            <span className="text-[10px] text-gray-400">· {formatDate(reply.created_at)}</span>
                          </div>
                          <p className="text-xs text-gray-300 pl-8">{reply.content}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
