-- Browser roles may only read their own diagnoses; writes happen only in the field-diagnosis Edge Function.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.field_diagnoses FROM anon, authenticated;
REVOKE SELECT ON public.field_diagnoses FROM anon;
GRANT SELECT ON public.field_diagnoses TO authenticated;