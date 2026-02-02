-- Add site_id column to tickets table (reference to external catalmsp.sites_conventionnes)
-- No FK constraint since it's in a different database
ALTER TABLE public.tickets 
ADD COLUMN site_id uuid NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.tickets.site_id IS 'Reference to sites_conventionnes.id in catalmsp external database';