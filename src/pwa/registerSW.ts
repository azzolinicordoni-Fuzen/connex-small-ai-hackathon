// Hack-Nation 2026 — Connex Field. Single, guarded service-worker registrar.
const SW_URL = "/sw.js";

function isRefusedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const h = window.location.hostname;
  if (h.startsWith("id-preview--") || h.startsWith("preview--")) return true;
  const blocked = ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"];
  if (blocked.some((d) => h === d || h.endsWith(`.${d}`))) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterAppSW() {
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    regs
      .filter((r) => [r.active, r.waiting, r.installing].some((w) => w?.scriptURL.endsWith(SW_URL)))
      .map((r) => r.unregister()),
  );
}

export function registerConnexFieldSW() {
  if (!("serviceWorker" in navigator)) return;
  if (isRefusedContext()) {
    void unregisterAppSW().catch(() => {});
    return;
  }
  window.addEventListener("load", () => {
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    // A new deployment took control: reload once so the fresh shell is shown.
    // Offline data lives in IndexedDB and is untouched by this.
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!hadController || reloaded) return;
      reloaded = true;
      window.location.reload();
    });
    navigator.serviceWorker
      .register(SW_URL, { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        const check = () => {
          if (navigator.onLine) void reg.update().catch(() => {});
        };
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") check();
        });
        window.addEventListener("online", check);
      })
      .catch(() => {});
  });
}
