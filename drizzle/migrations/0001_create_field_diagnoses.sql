-- Hack-Nation 2026 — Connex Field Phase 5: Initial Passport (online diagnosis) records.
CREATE TABLE public.field_diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_session_id uuid NOT NULL REFERENCES public.field_sessions(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payload_version integer NOT NULL CHECK (payload_version >= 1),
  prompt_version text NOT NULL CHECK (char_length(prompt_version) BETWEEN 1 AND 60),
  model_id text NOT NULL CHECK (char_length(model_id) BETWEEN 1 AND 100),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','ready','error')),
  result jsonb NULL CHECK (result IS NULL OR jsonb_typeof(result) = 'object'),
  safe_error_code text NULL CHECK (safe_error_code IS NULL OR safe_error_code ~ '^[A-Z_]{1,40}$'),
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT field_diagnoses_version_key UNIQUE (field_session_id, payload_version, prompt_version),
  CONSTRAINT field_diagnoses_ready_has_result CHECK (status <> 'ready' OR result IS NOT NULL)
);

CREATE INDEX field_diagnoses_profile_idx ON public.field_diagnoses(profile_id);

-- Browser: read-only. Writes happen only in the field-diagnosis Edge Function after it
-- verifies the caller's JWT and session ownership.
GRANT SELECT ON public.field_diagnoses TO authenticated;
GRANT ALL ON public.field_diagnoses TO service_role;

ALTER TABLE public.field_diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "field_diagnoses_select_own" ON public.field_diagnoses
  FOR SELECT TO authenticated
  USING (public.user_owns_profile(profile_id));

-- Integrity: a diagnosis must belong to the same profile as its synchronized session.
CREATE OR REPLACE FUNCTION public.field_diagnoses_check_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.field_sessions s WHERE s.id = NEW.field_session_id AND s.profile_id = NEW.profile_id) THEN
    RAISE EXCEPTION 'field_diagnoses: profile does not own session';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER field_diagnoses_owner_check
  BEFORE INSERT OR UPDATE OF field_session_id, profile_id ON public.field_diagnoses
  FOR EACH ROW EXECUTE FUNCTION public.field_diagnoses_check_owner();

CREATE TRIGGER field_diagnoses_updated_at
  BEFORE UPDATE ON public.field_diagnoses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();