-- Create sites_temporaires table for temporary sites management
CREATE TABLE public.sites_temporaires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR NOT NULL,
  adresse TEXT,
  commune_id UUID REFERENCES public.communes(id),
  complement TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sites_temporaires ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Sites temporaires are viewable by all authenticated"
ON public.sites_temporaires
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create sites temporaires"
ON public.sites_temporaires
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update sites temporaires"
ON public.sites_temporaires
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete sites temporaires"
ON public.sites_temporaires
FOR DELETE
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_sites_temporaires_updated_at
BEFORE UPDATE ON public.sites_temporaires
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();