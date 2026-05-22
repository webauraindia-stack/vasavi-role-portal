# Vasavi Platform

Next.js **16.0.1** · React **19** · App Router · Node **≥20.9**

| Folder | Port | Purpose |
|--------|------|---------|
| **vasavi-main-site** | 3000 | Public booking website |
| **vasavi-superadmin** | 3001 | Unified management portal (Super Admin + Admin) |

## Requirements

- Node.js 20.9 or later
- npm 10+

## Run

```bash
# Public website
cd vasavi-main-site && npm install && npm run dev

# Management portal
cd vasavi-superadmin && npm install && npm run dev
```

## Migration

See [MIGRATION_REPORT.md](./MIGRATION_REPORT.md) for the Next.js 16 upgrade details.

## Archived folders

`apps/`, `packages/`, and `vasavi-admin/` are legacy monorepo experiments — not used by the active apps above.
