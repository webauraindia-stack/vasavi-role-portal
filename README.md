# Vasavi Role Portal (`vasavi-portal`)

Unified **role-based management portal** — hotel operations, Super Admin platform modules, stay extensions, and manual walk-in bookings.

Runs on port **3001**. Pairs with the separate [`vasavi-main-site`](../vasavi-main-site) public booking app on port **3000**.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3001/login

## Demo accounts

| Email | Password | Role |
|-------|----------|------|
| `super@vasavi.org` | `superadmin123` | Super Admin (all hotels + platform) |
| `hotel@vasavi.org` | `admin123` | Hotel Operations (single property) |
| `donor@vasavi.org` | `admin123` | Donations admin |
| `cms@vasavi.org` | `admin123` | CMS admin |
| `finance@vasavi.org` | `admin123` | Finance admin |

## Environment

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_MAIN_SITE_URL=http://localhost:3000
```

The customer site proxies stay-extension API calls to this portal using `SUPERADMIN_URL=http://localhost:3001`.

## Repository

https://github.com/webauraindia-stack/vasavi-role-portal
