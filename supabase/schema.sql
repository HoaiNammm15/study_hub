-- ========================================================
-- STUDY HUB - DATABASE SCHEMA & RLS POLICIES FOR SUPABASE
-- ========================================================

-- 1. Bảng Profiles (Lưu trữ thông tin người dùng từ Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user', -- Phân quyền 'user' | 'admin' | 'moderator'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger tự động tạo profile khi có user mới đăng ký / đăng nhập qua Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Bảng Folders (Thư mục tài liệu / Môn học)
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL, -- Tên môn học hoặc mã môn (vd: CNTT, Toán, Lý, Hóa, Tiếng Anh)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Bảng Documents (Tài liệu tải lên)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Bảng Comments (Thảo luận / Bình luận)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- Hỗ trợ Reply thread
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Bảng Stress Relief Codes (Lưu trữ mã code/text giải trí)
CREATE TABLE IF NOT EXISTS public.stress_relief_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    code_text TEXT NOT NULL,          -- Mã code dạng text thuần
    note TEXT,                       -- Ghi chú ngắn
    tags TEXT[],                     -- Thẻ phân loại (vd: ['funny', 'code', 'quote'])
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Bảng Folder Likes / Bookmarks (Tính năng mở rộng Readiness Architecture)
CREATE TABLE IF NOT EXISTS public.folder_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(folder_id, user_id)
);

-- ========================================================
-- BẬT ROW LEVEL SECURITY (RLS)
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stress_relief_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folder_likes ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- RLS POLICIES (PHÂN QUYỀN TRUY CẬP)
-- ========================================================

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Folders Policies
DROP POLICY IF EXISTS "Public folders viewable by everyone" ON public.folders;
CREATE POLICY "Public folders viewable by everyone" ON public.folders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users insert folders" ON public.folders;
CREATE POLICY "Auth users insert folders" ON public.folders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own folders" ON public.folders;
CREATE POLICY "Users can update own folders" ON public.folders FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own folders" ON public.folders;
CREATE POLICY "Users can delete own folders" ON public.folders FOR DELETE USING (auth.uid() = user_id);

-- Documents Policies
DROP POLICY IF EXISTS "Public documents viewable by everyone" ON public.documents;
CREATE POLICY "Public documents viewable by everyone" ON public.documents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users insert documents" ON public.documents;
CREATE POLICY "Auth users insert documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- Comments Policies
DROP POLICY IF EXISTS "Public comments viewable by everyone" ON public.comments;
CREATE POLICY "Public comments viewable by everyone" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users insert comments" ON public.comments;
CREATE POLICY "Auth users insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Stress Relief Codes Policies (Riêng tư: Đăng nhập mới xem được)
DROP POLICY IF EXISTS "Auth users view stress codes" ON public.stress_relief_codes;
CREATE POLICY "Auth users view stress codes" ON public.stress_relief_codes FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth users insert stress codes" ON public.stress_relief_codes;
CREATE POLICY "Auth users insert stress codes" ON public.stress_relief_codes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Folder Likes Policies
DROP POLICY IF EXISTS "Public folder likes viewable by everyone" ON public.folder_likes;
CREATE POLICY "Public folder likes viewable by everyone" ON public.folder_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users insert likes" ON public.folder_likes;
CREATE POLICY "Auth users insert likes" ON public.folder_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Auth users delete likes" ON public.folder_likes;
CREATE POLICY "Auth users delete likes" ON public.folder_likes FOR DELETE USING (auth.uid() = user_id);

-- ========================================================
-- STORAGE BUCKET CONFIGURATION & POLICIES ('documents')
-- ========================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public documents bucket viewable by everyone" ON storage.objects;
CREATE POLICY "Public documents bucket viewable by everyone"
ON storage.objects FOR SELECT USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Authenticated users can upload to documents bucket" ON storage.objects;
CREATE POLICY "Authenticated users can upload to documents bucket"
ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users can delete their own objects in documents bucket" ON storage.objects;
CREATE POLICY "Users can delete their own objects in documents bucket"
ON storage.objects FOR DELETE USING (
    bucket_id = 'documents' AND auth.uid() = owner
);
