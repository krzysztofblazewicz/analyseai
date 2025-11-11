-- Add user_id column to chart_analyses table
ALTER TABLE public.chart_analyses 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to be user-specific
DROP POLICY IF EXISTS "Anyone can view chart analyses" ON public.chart_analyses;
DROP POLICY IF EXISTS "Anyone can insert chart analyses" ON public.chart_analyses;

CREATE POLICY "Users can view their own analyses"
ON public.chart_analyses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses"
ON public.chart_analyses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
ON public.chart_analyses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);