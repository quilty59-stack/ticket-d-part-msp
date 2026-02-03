-- Create sessions_formation table to group stagiaires and manoeuvrants
CREATE TABLE public.sessions_formation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR NOT NULL UNIQUE,
  nom VARCHAR NOT NULL,
  description TEXT,
  date_debut DATE,
  date_fin DATE,
  actif BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add session_id to stagiaires table
ALTER TABLE public.stagiaires 
ADD COLUMN session_id UUID REFERENCES public.sessions_formation(id) ON DELETE SET NULL;

-- Add session_id to manoeuvrants table
ALTER TABLE public.manoeuvrants 
ADD COLUMN session_id UUID REFERENCES public.sessions_formation(id) ON DELETE SET NULL;

-- Enable RLS on sessions_formation
ALTER TABLE public.sessions_formation ENABLE ROW LEVEL SECURITY;

-- RLS policies for sessions_formation
CREATE POLICY "Sessions are viewable by all authenticated" 
ON public.sessions_formation 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create sessions" 
ON public.sessions_formation 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update sessions" 
ON public.sessions_formation 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete sessions" 
ON public.sessions_formation 
FOR DELETE 
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_sessions_formation_updated_at
BEFORE UPDATE ON public.sessions_formation
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();