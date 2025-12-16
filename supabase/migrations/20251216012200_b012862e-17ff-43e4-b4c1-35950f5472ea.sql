-- Enable realtime for connections and subprofile_connections tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subprofile_connections;