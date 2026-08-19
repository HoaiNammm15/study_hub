'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  GraduationCap,
  Sparkles,
  LogOut,
  LogIn,
  FolderKanban,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';

import { AuthModal } from '@/components/AuthModal';

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gradient">
                STUDY HUB
              </span>
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-gray-400 -mt-1">
                Lưu trữ & Diễn đàn
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-900/50 p-1.5 rounded-full border border-gray-800">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive('/')
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              Tài Liệu Học Tập
            </Link>

            <Link
              href="/secret"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all relative ${
                isActive('/secret')
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              Stress Relief
              <span className="text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/30 px-1.5 py-0.5 rounded-full uppercase font-bold">
                Secret
              </span>
            </Link>
          </nav>

          {/* User Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-24 h-9 bg-gray-800/60 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 bg-gray-900/60 border border-gray-800 px-3 py-1.5 rounded-xl">
                  {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                    <img
                      src={user.user_metadata.avatar_url || user.user_metadata.picture}
                      alt={user.user_metadata.full_name || 'User avatar'}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                      {user.email?.[0].toUpperCase() || <UserIcon className="w-4 h-4" />}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-200 max-w-[120px] truncate">
                      {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-gray-400 max-w-[120px] truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={signOut}
                  title="Đăng xuất"
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-[1.02] active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập / Đăng ký
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-400 hover:text-white bg-gray-800/50 border border-gray-700/50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950/95 p-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
              isActive('/') ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-900'
            }`}
          >
            <FolderKanban className="w-5 h-5" />
            Tài Liệu Học Tập
          </Link>
          <Link
            href="/secret"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
              isActive('/secret') ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-900'
            }`}
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            Stress Relief Code
          </Link>

          <div className="pt-3 border-t border-gray-800">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-900 rounded-xl">
                  {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                    <img
                      src={user.user_metadata.avatar_url || user.user_metadata.picture}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
                      {user.email?.[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium text-sm"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium"
              >
                <LogIn className="w-4 h-4" /> Đăng nhập / Đăng ký
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
}
