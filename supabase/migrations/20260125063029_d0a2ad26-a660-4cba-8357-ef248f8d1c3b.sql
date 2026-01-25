-- Ajouter une colonne poste pour les manoeuvrants
CREATE TABLE public.manoeuvrants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grade_id UUID REFERENCES public.grades(id),
  nom VARCHAR NOT NULL,
  prenom VARCHAR NOT NULL,
  poste VARCHAR NOT NULL CHECK (poste IN ('CA', 'COND', 'CE', 'EQ')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.manoeuvrants ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Manoeuvrants are viewable by all authenticated" 
ON public.manoeuvrants FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage manoeuvrants" 
ON public.manoeuvrants FOR ALL 
USING (true);