DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, agent_type)
  VALUES (NEW.id, COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'name',''), NEW.email),
          COALESCE((NEW.raw_user_meta_data ->> 'agent_type')::agent_type, 'outro'))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.ensure_my_profile(_name text, _agent_type agent_type DEFAULT 'proprietario')
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE uid uuid := auth.uid(); pid uuid; n text := btrim(coalesce(_name,''));
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF length(n) < 2 OR length(n) > 100 THEN RAISE EXCEPTION 'INVALID_NAME'; END IF;
  INSERT INTO public.profiles (user_id, name, agent_type) VALUES (uid, n, _agent_type)
  ON CONFLICT (user_id) DO NOTHING;
  SELECT id INTO pid FROM public.profiles WHERE user_id = uid;
  RETURN pid;
END $$;
REVOKE ALL ON FUNCTION public.ensure_my_profile(text, agent_type) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_my_profile(text, agent_type) TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;