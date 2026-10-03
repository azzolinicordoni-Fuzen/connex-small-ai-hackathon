# Connex Field — Offline (airplane-mode) test

Offline mode only works on the **published** app. It is intentionally disabled in the Lovable editor preview, in iframes, and in development.

1. On an ordinary mobile phone, with internet, open the published URL ending in `/field`.
2. Wait about 10–20 seconds on the page so the app installs and finishes caching. (Optional: use "Add to Home Screen".)
3. Close the tab (or the installed app) completely.
4. Enable **airplane mode** (Wi‑Fi and mobile data off).
5. Reopen `/field` (same URL in the browser, or the home-screen icon).
6. Confirm that these appear:
   - the Connex Field shell and title;
   - the EN/PT language selector (switching works);
   - the "Preliminary assessment" disclaimer;
   - the status indicator showing **Offline**.
7. Disable airplane mode and confirm the indicator changes to **Online**.

Troubleshooting: add `?sw=off` to the URL to unregister the offline worker and reload fresh.
