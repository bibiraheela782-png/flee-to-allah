-- Everyone can watch videos (read files from the videos bucket)
create policy "Anyone can read video files"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'videos');

-- Only admins can upload, change, or remove video files
create policy "Admins can upload video files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'videos' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can update video files"
  on storage.objects for update to authenticated
  using (bucket_id = 'videos' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete video files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'videos' and public.has_role(auth.uid(), 'admin'));