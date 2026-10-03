-- Hack-Nation 2026 — Connex Field Phase 4: consented, idempotent sync target.
CREATE TABLE public.field_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  local_session_id uuid NOT NULL UNIQUE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subprofile_id uuid NULL,
  language text NOT NULL CHECK (language IN ('en','pt')),
  answers jsonb NOT NULL CHECK (jsonb_typeof(answers) = 'object'),
  offline_result jsonb NULL CHECK (offline_result IS NULL OR jsonb_typeof(offline_result) = 'object'),
  payload_version integer NOT NULL DEFAULT 1 CHECK (payload_version >= 1),
  content_version text NOT NULL CHECK (length(content_version) <= 40),
  local_model_version text NOT NULL CHECK (length(local_model_version) <= 60),
  consent_version text NOT NULL CHECK (length(consent_version) <= 40),
  sync_consented_at timestamptz NOT NULL,
  device_created_at timestamptz NOT NULL,
  source text NOT NULL DEFAULT 'field' CHECK (source = 'field'),
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received')),
  synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON COLUMN public.field_sessions.subprofile_id IS 'Reserved: linking requires explicit user confirmation in a later phase; never set automatically in Phase 4.';

CREATE INDEX field_sessions_profile_idx ON public.field_sessions(profile_id);

GRANT SELECT, INSERT, UPDATE ON public.field_sessions TO authenticated;
GRANT ALL ON public.field_sessions TO service_role;

ALTER TABLE public.field_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "field_sessions_select_own" ON public.field_sessions
  FOR SELECT TO authenticated USING (public.user_owns_profile(profile_id));
CREATE POLICY "field_sessions_insert_own" ON public.field_sessions
  FOR INSERT TO authenticated WITH CHECK (public.user_owns_profile(profile_id) AND subprofile_id IS NULL);
CREATE POLICY "field_sessions_update_own" ON public.field_sessions
  FOR UPDATE TO authenticated USING (public.user_owns_profile(profile_id))
  WITH CHECK (public.user_owns_profile(profile_id) AND subprofile_id IS NULL);

CREATE TRIGGER update_field_sessions_updated_at BEFORE UPDATE ON public.field_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();