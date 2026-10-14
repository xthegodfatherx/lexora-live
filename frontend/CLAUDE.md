# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Lexora frontend — Sonatrach's legal & contract-management web app (French UI). Domains: contracts & risks (CLM), org structure, role assignments, legal document library, messaging & risk alerts, user administration. Create React App (react-scripts 5), React 19, React Router 7, Tailwind CSS 3.4, Axios, Framer Motion. Plain JavaScript — no TypeScript, no PropTypes.

Read before touching anything API-related:

- [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md) — connection contract: base URL, CORS, JWT/refresh, uploads, gotchas.
- [FRONTEND_FEATURES.md](FRONTEND_FEATURES.md) — per-role screen map with the exact endpoint contracts (request/response shapes, enums, envelopes, known-broken endpoints), extracted from the backend code. Source of truth for any new screen.
- [SEED_TEST_DATA.md](SEED_TEST_DATA.md) — test accounts on the production backend: `admin@sonatrach.dz`, `vp@sonatrach.dz`, `dd@sonatrach.dz`, `rd@sonatrach.dz` (all `Test1234!`). `rd` is the main CLM account.

## Commands

- `npm install` — Node 20+ (Netlify builds on 20; lockfile v3).
- `npm start` — dev server on http://localhost:3000. It talks to the **production** backend by default (`localhost:3000` is CORS-allowed there); override with a git-ignored `.env.local` (see [.env.example](.env.example)).
- `prestart` / `prebuild` run [scripts/copy-pdf-worker.js](scripts/copy-pdf-worker.js): copies the pdf.js worker into `public/` (git-ignored) for the library's AI features.
- `npm run build` — production build to `build/`. With `CI=true` CRA turns ESLint warnings into errors; the codebase has warnings, so Netlify builds with `CI=false` (see [netlify.toml](netlify.toml)).
- `npm test` — Jest watch mode. `src/App.test.js` is untouched CRA boilerplate and fails; there are no real tests.
- No lint script; ESLint (`react-app` config) reports inside the dev server / build output.

## Architecture

**Routing** — all routes live in [src/App.js](src/App.js) (`createBrowserRouter`). Public: `/` → `/accueil`, `/login`, `/mot-de-passe-oublie`, `/reset-password/:uid/:token`, `/unauthorized`, `*` → `NotFound`. One subtree per role (`/admin`, `/vice-president`, `/directeur-centrale`, `/assistant-directeur-centrale`, `/directeur-direction`, `/responsable-departement`, `/directeur-direction-activite`, `/directeur-division-activite`, `/responsable-direction-division`, `/responsable-departement-division`, `/agent`), each wrapped in a role layout with nested children. **Every path listed in a sidebar must have a child route** — unbuilt screens render `<PageEnConstruction titre="…" />`, and the `communs` array adds `profile` + `notifications` to every SidebarLayout role (the layout's "Paramètres" links are relative).

**Role system** — the backend returns a snake_case `role` at login: 11 exact strings including the intentional misspelling `vice_presedent`; it can be `null` (Login shows an error instead of navigating). `getRolePath` in [src/Components/Login/Login.jsx](src/Components/Login/Login.jsx) maps it to the kebab-case route. Login stores in localStorage: `access_token`, `refresh_token`, `role`, `nom_complet`, `user_id` (a string), `photo_profil`, the non-null org ids (`activite_id`, `direction_id`, `departement_id`, `direction_centrale_id`, `structure_id`, `direction_activite_id`, `division_activite_id`) and `org_unit_nom`. Components read those ids directly to scope calls (e.g. `direction_id` in `DepartementAffectations`). Take role/ids from the login body or `GET /auth/users/me/` — never by decoding the JWT (it only carries `user_id`/`exp`).

**Layouts** — [src/Layouts/shared/SidebarLayout.jsx](src/Layouts/shared/SidebarLayout.jsx) is the generic wrapper (`requiredRole` string|array + `menuSections`): it runs the client-side role guard (`localStorage.role` → `navigate('/unauthorized')`), renders sidebar + `<TopBar />` + `<Outlet />`, handles logout (`POST /auth/logout/` then `localStorage.clear()`), and re-exports the icon components. Every role layout is a thin wrapper around it except [AdminLayout.jsx](src/Layouts/AdminLayout.jsx) (hand-rolled, with dropdown menus). Guards are cosmetic — enforcement is the backend's job.

**API client** — [src/axios.js](src/axios.js). Default export `axiosInstance` (also a named export); it also exports `API_URL`, `UPLOAD_TIMEOUT` (300 s) and `toAbsoluteUrl(path)` for `/uploads/…` files. Always call with a path only (`axiosInstance.get('/clm/contrats/')`) — never a hardcoded host. The request interceptor attaches `Bearer <access_token>`. The response interceptor treats 401, or 403 whose `detail` mentions the token (`affectation`/`clm` style), as "session to renew": it refreshes once via `POST /auth/token/refresh/` (single-flight — concurrent failures share one refresh because refresh tokens rotate and are single-use), stores the new access **and** refresh, and retries; if the refresh fails it clears localStorage and redirects to `/login`. Auth routes (`/auth/login/`, refresh, logout, reset-password) are excluded, so a wrong password simply rejects. `axiosApi` is a legacy alias on the same base — unused.

**Components** — page components in `src/pages/`; feature components in `src/Components/{feature}/` (`admin/`, `directeurdirection/`, `chefdepartement/` = CLM contracts, `Bib/` = legal library, `Notification/` = risk alerts + chat); shared UI (Modal, TopBar, NotFound, Unauthorized, PageEnConstruction, one `<Entity>Form.jsx` per org entity) in `src/Components/Partials/Components/`. PascalCase `.jsx`. State is local hooks only (no Redux/Context). CRUD screens follow `showModal` + `modalMode: 'create' | 'edit'` + refetch on success. `TopBar` mounts `NotificationCenter` (risk alerts, polls every 30 s) and `ChatInterface` (messaging) and polls `/notifications/unread/count` every 10 s.

**AI assistant** — full map in [AI_ASSISTANT_FEATURES.md](AI_ASSISTANT_FEATURES.md) §0. The browser never talks to the LLM provider (Groq): it calls `/.netlify/functions/ai-chat` (+ `ai-transcribe`), served by [netlify/functions/](netlify/functions/) in production and by [src/setupProxy.js](src/setupProxy.js) under `npm start`; both wrap [netlify/lib/aiCore.js](netlify/lib/aiCore.js), which holds `AI_API_KEY`, validates the caller's JWT through `GET /auth/users/me/`, builds the system prompt from that *verified* role and owns the helper prompts (restart `npm start` after editing it). Tool calling runs **in the browser**: [src/ai/tools.js](src/ai/tools.js) executes each tool through `axiosInstance` with the user's JWT, so backend scoping bounds what the AI sees; results are trimmed and aggregates computed in JS (token quota); every write tool has `confirm: true` → `ActionConfirmCard`; tools with `terminal: true` open a screen and end the loop with a canned reply. Never add delete/role/assignment/password tools. UI in `src/Components/Assistant/`; other screens open the assistant with `openAssistant({ context, question })` ([src/ai/launcher.js](src/ai/launcher.js)), which `TopBar` listens to (also the floating ✨ button and `Ctrl+K`). `REACT_APP_AI_ENABLED=false` hides everything. To test the engine without a browser, bundle `src/ai/*` with esbuild and stub `fetch` for the proxy URL with `aiCore.handleChat`.

**Styling** — Tailwind with custom colors in [tailwind.config.js](tailwind.config.js) (`myorange` #FF8500 brand, `myblue`, `mygray`; Nunito font). Framer Motion for modals/animations. A few components still use scoped CSS in `Partials/Styles/` — prefer Tailwind.

## Backend contract (the parts that bite)

Full detail lives in the two guides; these are the rules you must not break:

| Rule | Detail |
|---|---|
| One base URL | `REACT_APP_API_URL` (build-time) → `API_URL`; production `https://lexora.duckdns.org`. No `/api` segment, no port. HTTPS only — `http://` gets redirected and POST bodies are dropped. |
| Prefix → service | Django: `/auth`, `/affectation`, `/clm` — **trailing slash mandatory** (`/auth/login/`; a slash-less write 404s/500s). Node: `/juridique`, `/bib`, `/notifications`, `/uploads` — no trailing slash. |
| Live path quirks | `/juridique/departemet_activite` (the typo is real), `/juridique/direction_activite` (underscore), `/juridique/structure` and `/juridique/division` (singular). Copy them exactly. |
| Envelopes differ | `auth`/`affectation`: `{status:'success'|'error', …}` (lists under `users`, `data.directeurs`/`data.responsables`, or a flat `data` — two families, FEATURES §5). `juridique`/`bib`: `{success, data}`. `clm`: `{success, results|contrat}` or bare `{error}`. `notifications`: raw objects/arrays, errors as `{error}`/`{message}`. Unwrap per service, never globally. |
| Pagination | `clm`: `limit`/`offset` (max 100). `bib`: `page`/`limit`. `notifications`: `page`/`limit`. `auth`/`affectation` lists return everything — filter client-side. |
| Files | Library: `POST /bib/documents` multipart field `pdf`, ≤ 20 MB; `pdfUrl` is relative → `toAbsoluteUrl()`; `/uploads/*` is public (iframe-safe, no token). Contract OCR: `POST /clm/contrats/upload/` field `fichier`, **timeout 300 s**. `GET /clm/contrats/<id>/pdf/` returns binary → `responseType: 'blob'` with the Bearer header. Edge request cap 50 MB. |
| CLM permissions | list/detail/PDF: any role, auto-scoped (admin → all; directeur_centrale / directeur_direction → own org id; everyone else → own `departement_id`, empty if unset). Create/update/submit/risks: **`responsable_departement` only**. Use `/clm/contrats/formulaire/` and `/upload/` — `/create/` and `/create-from-pdf/` always 500. Update is PUT-only and brouillon-only. `type_contrat` in lists is a display label — branch on `type_contrat_code`. |
| No websockets | Socket.IO is off in production — poll. `GET /notifications` and `/notifications/all` are stubs; real data = risk alerts, conversations/messages, `unread/count`. `GET /notifications/users` is broken → use `GET /auth/all_users/public/`. |
| CORS | Allow-list with credentials (no wildcard). The exact deployed origin (scheme + host, no trailing slash) must be added on the backend, or every browser call fails while curl works. `http://localhost:3000` is already allowed. |
| Password reset | `POST /auth/reset-password/` emails a link hardcoded to `localhost:3000` — only usable in local dev until the backend fixes it. |

Smoke test from a shell: `curl -s -X POST https://lexora.duckdns.org/auth/login/ -H 'Content-Type: application/json' -d '{"email":"rd@sonatrach.dz","password":"Test1234!"}'`, then `curl -s https://lexora.duckdns.org/clm/contrats/ -H "Authorization: Bearer <access>"`.

## Deployment (Netlify)

[netlify.toml](netlify.toml): `npm run build` → publish `build/`, Node 20, `CI=false`, SPA fallback `/* → /index.html 200` (required for `createBrowserRouter` deep links and refreshes), immutable cache on `/static/*`, `no-cache` on `index.html`. `.env` is **git-ignored** (it holds the secret `AI_API_KEY`; template: [.env.example](.env.example)) — on Netlify the backend URL comes from the production fallback in [src/axios.js](src/axios.js). To target another backend, set `REACT_APP_API_URL` in Netlify → Site configuration → Environment variables (shell env beats `.env` in CRA) and redeploy — the value is baked in at build time. After the first deploy, send the Netlify origin (`https://<site>.netlify.app` and any custom domain) to the backend team for the CORS allow-list; until it is added the deployed app gets CORS errors on every call.

## Gotchas

- **i18n is not installed.** `Partials/Components/i18n.js`, `NavBar.jsx` and `DecoEsi.jsx` import `i18next` / `react-i18next` / `i18next-browser-languagedetector`, which are absent from package.json. They are unimported dead code — importing any of them breaks the build.
- `src/Components/chefdepartement/AjouterContratModal.jsx` contains several commented-out earlier versions of the component; the live one is the last uncommented definition in the file. Edit only that one.
- `AjouterUtilisateurModal` posts Excel imports to `/users/import/` — not documented in FRONTEND_FEATURES.md; unverified against the backend.
- `NotificationCenter` / `NotificationsPage` call `/notifications/risk-alerts/` with a trailing slash (Express tolerates it); new Node-service calls should omit it.
- **`AI_API_KEY` (Groq) must never get a `REACT_APP_` prefix** — CRA would bake it into the public JS bundle. It is server-side only (proxy); the assistant roadmap, tool→endpoint map and security rules are in [AI_ASSISTANT_FEATURES.md](AI_ASSISTANT_FEATURES.md).
- `src/Assets/Icons/sonatrach_files/` is saved-browser-page junk (`.br.js.télécharger` files) — never import from it.
