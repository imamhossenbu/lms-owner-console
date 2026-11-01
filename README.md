# EduPro Owner Console

Platform-owner app for the EduPro multi-tenant LMS: institutions, subscriptions, invoices, plans & pricing, custom domains and console settings.
It is separate from the institution admin panel (`lms-admin-panel`), which every subscribed institution uses at `<slug>.edupro.com` or its own domain.

## Run

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_ADMIN_PANEL_URL (default http://localhost:3000)
npm run dev                  # http://localhost:3001
```

Mock sign-in: `imam.adsfixter@gmail.com` / `owner123`.

## Notes

- **Mock data:** everything is stored in this browser's localStorage (`edupro_saas_v1`, `edupro_console_settings_v1`). The admin panel runs on a different origin, so it keeps its own copy of the same seed. Institutions created through `/signup` in the panel only show up here once the backend exists.
- **Opening the admin panel:** "Open institution panel" opens `NEXT_PUBLIC_ADMIN_PANEL_URL`. "Open as owner" opens `<panel>/?impersonate=<institutionId>`.
- **Design rules:** follow `AGENTS.md`. Use only the `globals.css` tokens, and run `npm run check:tokens`.
- **Shared code:** `globals.css`, `src/components/ui/*` and the SaaS contract (`src/types/saas.ts`, `src/lib/saas*.ts`, `src/lib/planAccess.ts`, `src/validations/saasSchema.ts`) are copies of the files in `lms-admin-panel`. Change both apps when you change them.
