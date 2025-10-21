-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('tourist', 'guide');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  bio TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_name TEXT,
  languages TEXT[] DEFAULT '{}',
  hobbies TEXT[] DEFAULT '{}',
  music_tastes TEXT[] DEFAULT '{}',
  big_five_openness INTEGER CHECK (big_five_openness >= 1 AND big_five_openness <= 5),
  big_five_conscientiousness INTEGER CHECK (big_five_conscientiousness >= 1 AND big_five_conscientiousness <= 5),
  big_five_extraversion INTEGER CHECK (big_five_extraversion >= 1 AND big_five_extraversion <= 5),
  big_five_agreeableness INTEGER CHECK (big_five_agreeableness >= 1 AND big_five_agreeableness <= 5),
  big_five_neuroticism INTEGER CHECK (big_five_neuroticism >= 1 AND big_five_neuroticism <= 5),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create tours table
CREATE TABLE public.tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  location_name TEXT NOT NULL,
  duration_hours INTEGER NOT NULL,
  max_participants INTEGER NOT NULL,
  price_per_person DECIMAL(10,2) NOT NULL,
  languages TEXT[] DEFAULT '{}',
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'moderate', 'challenging')),
  included_items TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tours
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE NOT NULL,
  tourist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  guide_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  num_participants INTEGER NOT NULL CHECK (num_participants > 0),
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for tours
CREATE POLICY "Tours are viewable by everyone"
  ON public.tours FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Guides can insert their own tours"
  ON public.tours FOR INSERT
  WITH CHECK (auth.uid() = guide_id AND public.has_role(auth.uid(), 'guide'));

CREATE POLICY "Guides can update their own tours"
  ON public.tours FOR UPDATE
  USING (auth.uid() = guide_id AND public.has_role(auth.uid(), 'guide'));

CREATE POLICY "Guides can delete their own tours"
  ON public.tours FOR DELETE
  USING (auth.uid() = guide_id AND public.has_role(auth.uid(), 'guide'));

-- RLS Policies for bookings
CREATE POLICY "Tourists can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = tourist_id);

CREATE POLICY "Guides can view bookings for their tours"
  ON public.bookings FOR SELECT
  USING (auth.uid() = guide_id);

CREATE POLICY "Tourists can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = tourist_id AND public.has_role(auth.uid(), 'tourist'));

CREATE POLICY "Tourists can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = tourist_id AND status = 'pending');

CREATE POLICY "Guides can update bookings for their tours"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = guide_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tours_updated_at
  BEFORE UPDATE ON public.tours
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function and trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();