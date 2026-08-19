import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Study Hub - Kho Tài Liệu Học Tập & Diễn Đàn Cộng Đồng',
  description:
    'Nền tảng lưu trữ, chia sẻ đề thi, bài giảng, slide học tập kết hợp diễn đàn thảo luận và góc Stress Relief dành cho học sinh, sinh viên.',
  keywords: [
    'Study Hub',
    'Tài liệu học tập',
    'Đề thi sinh viên',
    'Diễn đàn thảo luận',
    'Slide bài giảng',
    'Supabase Next.js',
  ],
  authors: [{ name: 'Study Hub Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#090d16] text-gray-100 selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
