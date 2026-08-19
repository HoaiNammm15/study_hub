import React from 'react';
import { GraduationCap, Heart, Code, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-800/80 bg-gray-950/80 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-200">STUDY HUB</p>
              <p className="text-xs text-gray-400">
                Nền tảng lưu trữ & chia sẻ tài liệu học tập miễn phí cộng đồng
              </p>
            </div>
          </div>

          {/* Center badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Code className="w-3 h-3" /> Next.js 14 App Router
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" /> Supabase RLS & Auth
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              100% Free Tier
            </span>
          </div>

          {/* Right copyright */}
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Thiết kế với <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> bởi Cộng đồng Học tập
          </p>
        </div>
      </div>
    </footer>
  );
}
