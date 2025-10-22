-- Phase 2: Driver dispatch tables
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  license_number TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  total_trips INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.ride_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  pickup_location_name TEXT NOT NULL,
  pickup_lat DOUBLE PRECISION NOT NULL,
  pickup_lng DOUBLE PRECISION NOT NULL,
  dropoff_location_name TEXT NOT NULL,
  dropoff_lat DOUBLE PRECISION NOT NULL,
  dropoff_lng DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'pending',
  estimated_fare NUMERIC(10, 2),
  actual_fare NUMERIC(10, 2),
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Phase 3: Video and matching tables
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES public.tours(id) ON DELETE SET NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.user_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  embedding_data TEXT NOT NULL,
  interests_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  similarity_score NUMERIC(5, 4),
  match_reason TEXT,
  status TEXT DEFAULT 'suggested',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, matched_user_id)
);

-- Enable RLS
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for drivers
CREATE POLICY "Drivers can view their own profile"
  ON public.drivers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update their own profile"
  ON public.drivers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view available drivers"
  ON public.drivers FOR SELECT
  USING (is_available = true);

CREATE POLICY "Drivers can insert their own profile"
  ON public.drivers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ride_requests
CREATE POLICY "Users can view their own ride requests"
  ON public.ride_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = ride_requests.booking_id
      AND bookings.tourist_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can view assigned ride requests"
  ON public.ride_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.drivers
      WHERE drivers.id = ride_requests.driver_id
      AND drivers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ride requests for their bookings"
  ON public.ride_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = ride_requests.booking_id
      AND bookings.tourist_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can update their assigned rides"
  ON public.ride_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.drivers
      WHERE drivers.id = ride_requests.driver_id
      AND drivers.user_id = auth.uid()
    )
  );

-- RLS Policies for videos
CREATE POLICY "Videos are viewable by everyone"
  ON public.videos FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own videos"
  ON public.videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON public.videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON public.videos FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_embeddings
CREATE POLICY "Users can view their own embeddings"
  ON public.user_embeddings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own embeddings"
  ON public.user_embeddings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own embeddings"
  ON public.user_embeddings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for matches
CREATE POLICY "Users can view their own matches"
  ON public.matches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view matches where they are matched"
  ON public.matches FOR SELECT
  USING (auth.uid() = matched_user_id);

-- Triggers for updated_at
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ride_requests_updated_at
  BEFORE UPDATE ON public.ride_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_embeddings_updated_at
  BEFORE UPDATE ON public.user_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();