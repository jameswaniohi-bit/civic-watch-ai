# CivicWatch AI

CivicWatch is a responsive civic issue reporting workspace for Nairobi. This
first slice is a runnable React/Vite prototype that prioritises the complete
citizen-to-reviewer experience:

- Citizen overview with impact metrics and recent reports
- New report workflow with AI-review disclosure, category, location, and evidence affordances
- Report list, status timeline, and detail view
- Community map presentation with status/category markers
- In-app notifications
- Admin role switch with a review queue and status actions
- Local persistence via `localStorage` so demo submissions survive a refresh

The UI deliberately labels AI output as a suggestion and does not treat it as
verification. The visual map is an offline demo surface; production map tiles,
geocoding, uploads, authentication, and PostgreSQL persistence should be wired
through the API boundary described below.

## Run locally

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

## Next production integration boundary

The current client can be connected to an Express API by setting
`VITE_API_BASE_URL` from [.env.example](./.env.example). The intended service
split is:

```text
React/Vite client
       |
       v
Express REST API ---- Prisma ---- Managed PostgreSQL
       |                |
       |                +-- report, status history, assignment, notification tables
       +---- Gemma AI provider (server-side key)
       +---- Object storage (server-side upload signing)
```

The AI review boundary is `POST /ai/review`; the server should call Gemma using
its private provider key. Never put that key in `VITE_*` variables. The client
falls back to the local demo experience while the API is unavailable.

Production work should add server-side session authentication, role guards for
citizen/admin/field-officer actions, Zod request validation, rate limiting,
signed image uploads, audit events, and paginated report endpoints. The
prototype intentionally does not claim those external services are live.

## Demonstration path

1. Use the role switch in the top bar to compare Citizen and Admin views.
2. Select **Report an issue**, submit a title and description, and refresh to
   verify local persistence.
3. Open the new report from **My reports** to inspect its status timeline and
   AI suggestion disclosure.
4. Switch to **Admin**, open **Review queue**, select a report, and update its
   status.
5. Return to the citizen view and open **Notifications** to see the in-app
   communication surface.
