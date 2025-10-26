-- Add missing fields to profiles table for onboarding
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarded boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS intro_video_url text,
ADD COLUMN IF NOT EXISTS talents text[] DEFAULT '{}';

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for intro videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('intro-videos', 'intro-videos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatar storage
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for intro videos
CREATE POLICY "Intro videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'intro-videos');

CREATE POLICY "Users can upload their own intro video"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'intro-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own intro video"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'intro-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own intro video"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'intro-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);