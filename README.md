# 🎓 STUDY HUB - Webapp Lưu Trữ Tài Liệu Học Tập & Diễn Đàn Cộng Đồng

Study Hub là ứng dụng web mã nguồn mở xây dựng trên nền tảng **Next.js 14+ (App Router)** và **Supabase**, hỗ trợ sinh viên lưu trữ, tìm kiếm, chia sẻ tài liệu học tập (đề thi, slide, bài giảng), thảo luận diễn đàn và góc giải trí **Stress Relief**.

---

## 🛠️ Tech Stack & Hạ Tầng (100% Free Tier)

- **Frontend & App Framework**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React Icons.
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security - RLS).
- **Authentication**: Supabase Auth (Google OAuth 2.0).
- **File Storage**: Supabase Storage (Bucket public `documents`).
- **Deployment**: Vercel Serverless.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Trực Tiếp

### 1. Khởi Tạo Dự Án & Cài Đặt Package
```bash
git clone <repository-url>
cd undersea
npm install
```

### 2. Cấu Hình Cơ Sở Dữ Liệu Supabase (SQL Editor)
1. Mở bảng điều khiển **Supabase Dashboard** -> chọn dự án của bạn -> vào mục **SQL Editor**.
2. Copy toàn bộ nội dung trong tập tin [`supabase/schema.sql`](./supabase/schema.sql) và dán vào SQL Editor.
3. Nhấn **Run** để khởi tạo các bảng (`folders`, `documents`, `comments`, `stress_relief_codes`, `profiles`, `folder_likes`), các hàm Trigger tự động lưu User profile và thiết lập chính sách bảo mật **Row Level Security (RLS)**.

### 3. Cấu Hình Supabase Storage Bucket
1. Vào **Supabase Dashboard** > **Storage**.
2. Nhấp chọn **New bucket**, đặt tên bucket là `documents`.
3. Bật tùy chọn **Public bucket** (Cho phép mọi người xem & tải tập tin).
4. (Nếu đã chạy script DDL `schema.sql`, các RLS policy cho Storage đã tự động được thiết lập).

### 4. Cấu Hình Đăng Nhập Google OAuth 2.0
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Tạo dự án mới > Vào **APIs & Services** > **OAuth consent screen** (điền thông tin ứng dụng).
3. Vào **Credentials** > **Create Credentials** > **OAuth client ID** (Chọn Web application).
4. Thêm URL sau vào **Authorized redirect URIs**:
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```
5. Lấy **Client ID** và **Client Secret** vừa tạo, quay lại **Supabase Dashboard** > **Authentication** > **Providers** > chọn **Google**, dán Client ID & Secret vào và bật **Enable Google Provider**.

### 5. Cấu Hình Biến Môi Trường (`.env.local`)
Tạo tập tin `.env.local` ở thư mục gốc dự án:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# (Tùy chọn) Cho tính năng Gemini AI Tóm Tắt PDF
GEMINI_API_KEY=your-gemini-api-key
```

### 6. Chạy Dự Án Ở Chế Độ Development
```bash
npm run dev
```
Truy cập địa chỉ `http://localhost:3000` trên trình duyệt.

---

## 🌐 Hướng Dẫn Deploy Lên Vercel (Miễn Phí 100%)

1. Đẩy dự án lên **GitHub** hoặc **GitLab**.
2. Đăng nhập vào [Vercel Dashboard](https://vercel.com/) > chọn **Add New Project**.
3. Import Repository của bạn.
4. Trong phần **Environment Variables**, thêm 2 biến:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Nhấn **Deploy**. Vercel sẽ tự động build và cấp tên miền SSL miễn phí.
6. Quay lại **Supabase Dashboard** > **Authentication** > **URL Configuration**, thêm tên miền Vercel của bạn vào **Site URL** và **Redirect URLs** (ví dụ: `https://your-app.vercel.app/auth/callback`).

---

## 📂 Cấu Trúc Mã Nguồn

```
undersea/
├── app/
│   ├── layout.tsx              # Root Layout & Auth Provider
│   ├── page.tsx                # Trang chủ: Search, Subject Filter & Folder Grid
│   ├── folders/[id]/page.tsx   # Trang chi tiết Folder: Files, Upload, Preview, Comments
│   ├── secret/page.tsx         # Trang Stress Relief Codes (Yêu cầu login)
│   ├── auth/callback/route.ts  # Auth Callback Handler cho OAuth
│   └── api/ai-summary/route.ts # Route mở rộng cho Gemini AI Summary
├── components/
│   ├── Navbar.tsx              # Responsive Navigation & User Dropdown
│   ├── CreateFolderModal.tsx   # Modal tạo mới Thư mục
│   ├── UploadDocumentModal.tsx # Modal Upload file lên Supabase Storage
│   ├── FileViewerModal.tsx     # Modal xem trực tiếp PDF & Ảnh
│   ├── CommentSection.tsx      # Khung bình luận diễn đàn
│   └── CreateSecretCodeModal.tsx# Modal đóng góp mã giải trí
├── lib/
│   ├── supabase/               # Browser & Server Supabase Clients
│   └── utils.ts                # Helper functions
└── supabase/
    └── schema.sql              # DDL SQL Script cho Supabase SQL Editor
```
