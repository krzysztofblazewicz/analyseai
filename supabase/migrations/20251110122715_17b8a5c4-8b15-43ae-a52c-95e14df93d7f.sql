-- Create storage bucket for chart images
insert into storage.buckets (id, name, public)
values ('chart-images', 'chart-images', true);

-- Create table for chart analyses
create table public.chart_analyses (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  bias text not null,
  confidence numeric not null,
  reasons jsonb not null,
  best_move text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS (but make it public for now since there's no auth)
alter table public.chart_analyses enable row level security;

-- Allow anyone to read analyses
create policy "Anyone can view chart analyses"
  on public.chart_analyses
  for select
  to anon, authenticated
  using (true);

-- Allow anyone to insert analyses
create policy "Anyone can insert chart analyses"
  on public.chart_analyses
  for insert
  to anon, authenticated
  with check (true);

-- Storage policies for chart images
create policy "Anyone can view chart images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'chart-images');

create policy "Anyone can upload chart images"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'chart-images');