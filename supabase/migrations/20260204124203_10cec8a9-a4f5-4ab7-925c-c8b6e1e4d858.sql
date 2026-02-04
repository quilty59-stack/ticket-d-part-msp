-- Add session_id to tickets table to track which session created the ticket
ALTER TABLE public.tickets
ADD COLUMN session_id uuid REFERENCES public.sessions_formation(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_tickets_session_id ON public.tickets(session_id);