-- Phase 4 & 5 Part 2: Identity Verification, Monetization Tables

-- Identity Verification Table
CREATE TABLE IF NOT EXISTS public.identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('passport', 'national_id', 'drivers_license')),
  document_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  verified_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Monetization: Commissions tracking
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL,
  tourist_id UUID NOT NULL,
  booking_amount NUMERIC(10, 2) NOT NULL,
  commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
  commission_amount NUMERIC(10, 2) NOT NULL,
  platform_earnings NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid_out')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Monetization: Payouts to guides
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  payment_details JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activity logs for admin audit trail
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for identity_verifications
CREATE POLICY "Users can view their own verification" ON public.identity_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can submit their own verification" ON public.identity_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verifications" ON public.identity_verifications
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update verifications" ON public.identity_verifications
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for commissions
CREATE POLICY "Guides can view their own commissions" ON public.commissions
  FOR SELECT USING (auth.uid() = guide_id);

CREATE POLICY "Tourists can view their commissions" ON public.commissions
  FOR SELECT USING (auth.uid() = tourist_id);

CREATE POLICY "Admins can manage all commissions" ON public.commissions
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for payouts
CREATE POLICY "Guides can view their own payouts" ON public.payouts
  FOR SELECT USING (auth.uid() = guide_id);

CREATE POLICY "Admins can manage all payouts" ON public.payouts
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for activity_logs
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- Trigger to automatically create commissions when booking is confirmed
CREATE OR REPLACE FUNCTION public.create_commission_on_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  commission_rate NUMERIC := 15.00;
  commission_amt NUMERIC;
  platform_amt NUMERIC;
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    commission_amt := NEW.total_price * (commission_rate / 100);
    platform_amt := commission_amt;
    
    INSERT INTO public.commissions (
      booking_id,
      guide_id,
      tourist_id,
      booking_amount,
      commission_rate,
      commission_amount,
      platform_earnings
    ) VALUES (
      NEW.id,
      NEW.guide_id,
      NEW.tourist_id,
      NEW.total_price,
      commission_rate,
      commission_amt,
      platform_amt
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER booking_commission_trigger
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.create_commission_on_booking();

-- Trigger for updated_at on new tables
CREATE TRIGGER update_identity_verifications_updated_at
  BEFORE UPDATE ON public.identity_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at
  BEFORE UPDATE ON public.commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON public.payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();