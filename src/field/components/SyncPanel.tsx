// Hack-Nation 2026 — Connex Field Phase 4: manual synchronization panel (user-initiated only).
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, CloudUpload, Loader2, LogIn, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { SessionRec } from "@/field/db";
import type { LocalResult } from "@/field/pathways";
import type { FieldLang } from "@/field/i18n";
import { markRetry, syncBlock, syncNow } from "@/field/sync";

const S = {
  en: {
    title: "Synchronization", pending: "1 assessment pending. It stays safely on this device until you are online.",
    signIn: "Sign in to synchronize", signInHelp: "Your answers stay on this device while you sign in.",
    sync: "Synchronize now", syncing: "Sending securely…", noConsent: "You did not authorize sending. Nothing leaves this device.",
    notReady: "Save the assessment first to enable synchronization.", invalid: "Some required answers are missing.",
    ok: "Synchronized successfully", at: "Synchronized at", receipt: "Server receipt ID",
    private: "This assessment is now stored in your private Connex account. It is not shown on your public profile, feed, connections or messages. Raw answers were removed from this device.",
    err: "Synchronization failed. Nothing was lost — your answers and offline result are still on this device.",
    retry: "Try again", profile: "Your account has no Connex profile yet. Complete your registration, then try again.",
    conflict: "This assessment cannot be synchronized to this account.", rejected: "The server rejected the data. Please review your answers.",
    subTitle: "Your existing landowner areas", subNote: "Not linked. Linking this assessment to an area will require your explicit confirmation in a later phase.",
    pTitle: "Complete your profile to synchronize", pDesc: "Your account was created, but your private Connex profile still needs to be completed. Your assessment remains safely stored on this device.",
    pName: "Name or display name", pType: "Profile type", pTypeVal: "Rural landowner", pBtn: "Complete profile", pBusy: "Creating profile…", pDone: "Profile completed", pFail: "Could not complete. Your data remains saved on this device.", pNeeded: "Profile required",
  },
  pt: {
    title: "Sincronização", pending: "1 avaliação pendente. Ela fica segura neste aparelho até você estar online.",
    signIn: "Entre para sincronizar", signInHelp: "Suas respostas ficam neste aparelho enquanto você entra.",
    sync: "Sincronizar agora", syncing: "Enviando com segurança…", noConsent: "Você não autorizou o envio. Nada sai deste aparelho.",
    notReady: "Salve a avaliação primeiro para habilitar a sincronização.", invalid: "Faltam respostas obrigatórias.",
    ok: "Sincronizado com sucesso", at: "Sincronizado em", receipt: "ID do recibo do servidor",
    private: "Esta avaliação agora está guardada na sua conta Connex privada. Ela não aparece no perfil público, feed, conexões ou mensagens. As respostas brutas foram removidas deste aparelho.",
    err: "A sincronização falhou. Nada foi perdido — suas respostas e o resultado offline continuam neste aparelho.",
    retry: "Tentar novamente", profile: "Sua conta ainda não tem perfil Connex. Complete o cadastro e tente novamente.",
    conflict: "Esta avaliação não pode ser sincronizada nesta conta.", rejected: "O servidor recusou os dados. Revise suas respostas.",
    subTitle: "Suas áreas de proprietário existentes", subNote: "Não vinculado. Vincular esta avaliação a uma área exigirá sua confirmação explícita em uma fase futura.",
    pTitle: "Complete seu perfil para sincronizar", pDesc: "Sua conta foi criada, mas ainda falta concluir seu perfil privado na Connex. Seus dados da avaliação continuam salvos neste aparelho.",
    pName: "Nome ou nome de exibição", pType: "Tipo de perfil", pTypeVal: "Proprietário rural", pBtn: "Concluir perfil", pBusy: "Criando perfil…", pDone: "Perfil concluído", pFail: "Não foi possível concluir. Seus dados continuam salvos neste aparelho.", pNeeded: "Perfil necessário",
  },
};

export function SyncPanel({ lang, online, session, answers, result, onSession }: {
  lang: FieldLang; online: boolean; session: SessionRec | null; answers: Record<string, unknown>; result: LocalResult | null;
  onSession: (s: SessionRec) => void;
}) {
  const s = S[lang];
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [needProfile, setNeedProfile] = useState(false);
  const [pName, setPName] = useState("");
  const [pBusy, setPBusy] = useState(false);
  const [pErr, setPErr] = useState(false);
  const [pDone, setPDone] = useState(false);

  useEffect(() => {
    if (!user || !online) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("id").eq("user_id", user.id).maybeSingle();
      if (!p) { setNeedProfile(true); return; }
      setNeedProfile(false);
      const { data } = await supabase.from("proprietario_subperfis").select("nome_area").eq("profile_id", p.id).limit(5);
      setAreas((data ?? []).map((r) => r.nome_area));
    })();
  }, [user, online]);

  if (session?.status === "synced") {
    return (
      <div role="status" className="rounded-md border border-primary/40 bg-primary/10 p-4 text-sm">
        <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4 text-primary" />{s.ok}</p>
        <p className="mt-2">{s.at}: {session.synced_at ? new Date(session.synced_at).toLocaleString(lang === "pt" ? "pt-BR" : "en-GB") : "—"}</p>
        <p className="mt-1">{s.receipt}: <span className="font-mono text-xs">{session.remote_id}</span></p>
        <p className="mt-2 text-muted-foreground">{s.private}</p>
      </div>
    );
  }

  const block = syncBlock({ online, session, answers, signedIn: !!user });
  const run = async () => {
    if (!session || busy) return;
    setBusy(true); setErr(null);
    const base = session.status === "error" ? (await markRetry(session.local_session_id)) ?? session : session;
    const r = await syncNow(base, answers, result);
    if (r.session) onSession(r.session);
    if (r.ok === false && r.code === "PROFILE_REQUIRED") { setNeedProfile(true); setErr(null); }
    else if (r.ok === false && r.code !== "IN_PROGRESS") setErr(r.code);
    setBusy(false);
  };
  const completeProfile = async () => {
    if (pBusy || pName.trim().length < 2) return;
    setPBusy(true); setPErr(false);
    // user_id is derived server-side from the verified session; nothing identifying is sent.
    const { error } = await supabase.rpc("ensure_my_profile", { _name: pName.trim(), _agent_type: "proprietario" });
    setPBusy(false);
    if (error) { setPErr(true); return; }
    setNeedProfile(false); setPDone(true);
    await run(); // single automatic retry
  };
  const errText = err === "PROFILE_REQUIRED" ? s.profile : err === "CONFLICT" ? s.conflict
    : err && ["INVALID_PAYLOAD", "PROHIBITED_FIELD", "CONSENT_REQUIRED", "PAYLOAD_TOO_LARGE"].includes(err) ? s.rejected : s.err;

  return (
    <div className="space-y-3 rounded-md border border-border bg-card p-4 text-sm">
      <h2 className="font-semibold">{s.title}</h2>
      {block === "not_ready" && <p className="text-muted-foreground">{s.notReady}</p>}
      {block === "no_consent" && <p className="text-muted-foreground">{s.noConsent}</p>}
      {block === "invalid" && <p className="text-muted-foreground">{s.invalid}</p>}
      {block === "offline" && <p role="status" className="flex items-center gap-2"><WifiOff className="h-4 w-4" />{s.pending}</p>}
      {block === "signed_out" && (
        <div className="space-y-2">
          <p className="text-muted-foreground">{s.signInHelp}</p>
          <Button asChild><Link to="/login?redirect=/field"><LogIn className="mr-1 h-4 w-4" />{s.signIn}</Link></Button>
        </div>
      )}
      {needProfile && user && online && (
        <form className="space-y-2 rounded-md border border-primary/40 bg-primary/5 p-3" onSubmit={(e) => { e.preventDefault(); completeProfile(); }}>
          <p className="text-xs font-medium uppercase text-primary">{s.pNeeded}</p>
          <p className="font-semibold">{s.pTitle}</p>
          <p className="text-muted-foreground">{s.pDesc}</p>
          <label className="block text-xs font-medium" htmlFor="field-pname">{s.pName}</label>
          <input id="field-pname" value={pName} maxLength={100} onChange={(e) => setPName(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2" required minLength={2} />
          <p className="text-xs">{s.pType}: <span className="font-medium">{s.pTypeVal}</span></p>
          {pErr && <p role="alert" className="text-destructive">{s.pFail}</p>}
          <Button type="submit" disabled={pBusy || pName.trim().length < 2}>{pBusy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}{pBusy ? s.pBusy : s.pBtn}</Button>
        </form>
      )}
      {pDone && !needProfile && <p role="status" className="text-primary">{s.pDone}</p>}
      {!needProfile && (session?.status === "error" || err) && <p role="alert" className="text-destructive">{errText}</p>}
      {block === null && !needProfile && (
        <Button onClick={run} disabled={busy} data-testid="field-sync-btn">
          {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CloudUpload className="mr-1 h-4 w-4" />}
          {busy ? s.syncing : session?.status === "error" ? s.retry : s.sync}
        </Button>
      )}
      {user && areas.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="font-medium">{s.subTitle}</p>
          <ul className="mt-1 list-disc pl-5 text-muted-foreground">{areas.map((a) => <li key={a}>{a}</li>)}</ul>
          <p className="mt-1 text-xs text-muted-foreground">{s.subNote}</p>
        </div>
      )}
    </div>
  );
}
