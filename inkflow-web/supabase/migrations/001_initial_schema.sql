-- InkFlow Database Migration Script
-- Execute this in Supabase SQL Editor (http://localhost:8000)
-- Version: 1.0.0
-- Date: 2024-01-01

-- ==================== 用户配置表 ====================
-- 注意：认证由 Supabase Auth 处理，此表存储额外用户信息

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 小说与章节 ====================

CREATE TABLE IF NOT EXISTS public.novels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  cover_url TEXT,
  word_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'publishing', 'completed', 'archived')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.volumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id UUID NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id UUID NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
  volume_id UUID REFERENCES public.volumes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  summary TEXT,
  word_count INTEGER DEFAULT 0,
  sort_order INTEGER NOT NULL,
  status TEXT DEFAULT 'draft',
  outline_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 人物与关系 ====================

CREATE TABLE IF NOT EXISTS public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id UUID NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  description TEXT,
  personality TEXT,
  background TEXT,
  attributes JSONB DEFAULT '{}',
  first_appearance_chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  is_protagonist BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.character_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  state_type TEXT NOT NULL,
  state_key TEXT NOT NULL,
  state_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.character_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id UUID NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
  from_character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  to_character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  description TEXT,
  strength INTEGER DEFAULT 50 CHECK (strength >= 0 AND strength <= 100),
  established_chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_character_id, to_character_id)
);

-- ==================== 世界观构建 ====================

CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id UUID NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  description TEXT,
  environment_keywords TEXT[] DEFAULT '{}',
  map_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id UUID NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  attributes JSONB DEFAULT '{}',
  owner_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
  first_appearance_chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wiki_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id UUID NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 变更日志 ====================

CREATE TABLE IF NOT EXISTS public.change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id UUID NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB NOT NULL,
  description TEXT NOT NULL,
  is_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 索引 ====================

CREATE INDEX IF NOT EXISTS idx_novels_user_id ON public.novels(user_id);
CREATE INDEX IF NOT EXISTS idx_volumes_novel_id ON public.volumes(novel_id);
CREATE INDEX IF NOT EXISTS idx_chapters_novel_id ON public.chapters(novel_id);
CREATE INDEX IF NOT EXISTS idx_chapters_volume_id ON public.chapters(volume_id);
CREATE INDEX IF NOT EXISTS idx_characters_novel_id ON public.characters(novel_id);
CREATE INDEX IF NOT EXISTS idx_character_states_character_id ON public.character_states(character_id);
CREATE INDEX IF NOT EXISTS idx_character_states_chapter_id ON public.character_states(chapter_id);
CREATE INDEX IF NOT EXISTS idx_character_relationships_novel_id ON public.character_relationships(novel_id);
CREATE INDEX IF NOT EXISTS idx_locations_novel_id ON public.locations(novel_id);
CREATE INDEX IF NOT EXISTS idx_locations_parent_id ON public.locations(parent_id);
CREATE INDEX IF NOT EXISTS idx_items_novel_id ON public.items(novel_id);
CREATE INDEX IF NOT EXISTS idx_items_owner_id ON public.items(owner_id);
CREATE INDEX IF NOT EXISTS idx_wiki_entries_novel_id ON public.wiki_entries(novel_id);
CREATE INDEX IF NOT EXISTS idx_wiki_entries_category ON public.wiki_entries(novel_id, category);
CREATE INDEX IF NOT EXISTS idx_change_logs_novel_id ON public.change_logs(novel_id);
CREATE INDEX IF NOT EXISTS idx_change_logs_confirmed ON public.change_logs(novel_id, is_confirmed);

-- ==================== Row Level Security ====================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: 用户只能访问自己的配置
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Novels: 用户只能访问自己的小说
DROP POLICY IF EXISTS "Users can CRUD own novels" ON public.novels;
CREATE POLICY "Users can CRUD own novels" ON public.novels FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Volumes: 通过小说所有权验证
DROP POLICY IF EXISTS "Users can CRUD own volumes" ON public.volumes;
CREATE POLICY "Users can CRUD own volumes" ON public.volumes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.novels WHERE id = volumes.novel_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.novels WHERE id = volumes.novel_id AND user_id = auth.uid()));

-- Chapters: 通过小说所有权验证
DROP POLICY IF EXISTS "Users can CRUD own chapters" ON public.chapters;
CREATE POLICY "Users can CRUD own chapters" ON public.chapters FOR ALL
  USING (EXISTS (SELECT 1 FROM public.novels WHERE id = chapters.novel_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.novels WHERE id = chapters.novel_id AND user_id = auth.uid()));

-- Characters: 通过小说所有权验证
DROP POLICY IF EXISTS "Users can CRUD own characters" ON public.characters;
CREATE POLICY "Users can CRUD own characters" ON public.characters FOR ALL
  USING (EXISTS (SELECT 1 FROM public.novels WHERE id = characters.novel_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.novels WHERE id = characters.novel_id AND user_id = auth.uid()));

-- Character States: 通过人物所有权验证
DROP POLICY IF EXISTS "Users can CRUD own character_states" ON public.character_states;
CREATE POLICY "Users can CRUD own character_states" ON public.character_states FOR ALL
  USING (EXISTS (SELECT 1 FROM public.characters c JOIN public.novels n ON c.novel_id = n.id WHERE c.id = character_states.character_id AND n.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.characters c JOIN public.novels n ON c.novel_id = n.id WHERE c.id = character_states.character_id AND n.user_id = auth.uid()));

-- Character Relationships: 通过小说所有权验证
DROP POLICY IF EXISTS "Users can CRUD own character_relationships" ON public.character_relationships;
CREATE POLICY "Users can CRUD own character_relationships" ON public.character_relationships FOR ALL
  USING (EXISTS (SELECT 1 FROM public.novels WHERE id = character_relationships.novel_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.novels WHERE id = character_relationships.novel_id AND user_id = auth.uid()));

-- Locations: 通过小说所有权验证
DROP POLICY IF EXISTS "Users can CRUD own locations" ON public.locations;
CREATE POLICY "Users can CRUD own locations" ON public.locations FOR ALL
  USING (EXISTS (SELECT 1 FROM public.novels WHERE id = locations.novel_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.novels WHERE id = locations.novel_id AND user_id = auth.uid()));

-- Items: 通过小说所有权验证
DROP POLICY IF EXISTS "Users can CRUD own items" ON public.items;
CREATE POLICY "Users can CRUD own items" ON public.items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.novels WHERE id = items.novel_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.novels WHERE id = items.novel_id AND user_id = auth.uid()));

-- Wiki Entries: 通过小说所有权验证
DROP POLICY IF EXISTS "Users can CRUD own wiki_entries" ON public.wiki_entries;
CREATE POLICY "Users can CRUD own wiki_entries" ON public.wiki_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM public.novels WHERE id = wiki_entries.novel_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.novels WHERE id = wiki_entries.novel_id AND user_id = auth.uid()));

-- Change Logs: 通过小说所有权验证
DROP POLICY IF EXISTS "Users can CRUD own change_logs" ON public.change_logs;
CREATE POLICY "Users can CRUD own change_logs" ON public.change_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.novels WHERE id = change_logs.novel_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.novels WHERE id = change_logs.novel_id AND user_id = auth.uid()));

-- ==================== 触发器：自动更新 updated_at ====================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS novels_updated_at ON public.novels;
CREATE TRIGGER novels_updated_at BEFORE UPDATE ON public.novels FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS chapters_updated_at ON public.chapters;
CREATE TRIGGER chapters_updated_at BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS characters_updated_at ON public.characters;
CREATE TRIGGER characters_updated_at BEFORE UPDATE ON public.characters FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS character_relationships_updated_at ON public.character_relationships;
CREATE TRIGGER character_relationships_updated_at BEFORE UPDATE ON public.character_relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS wiki_entries_updated_at ON public.wiki_entries;
CREATE TRIGGER wiki_entries_updated_at BEFORE UPDATE ON public.wiki_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================== 触发器：新用户自动创建 profile ====================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==================== 完成 ====================
-- Migration completed successfully!
