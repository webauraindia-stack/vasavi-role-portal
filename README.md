# Vasavi Super Admin (`vasavi-superadmin`)

Platform **Super Admin** — hotel operations plus full **Donor Management System**.

Renamed from `vasavi-hotel-manager`. Port **3001**.

## Run

```bash
cd vasavi-superadmin
npm install
npm run dev
```

| URL | Purpose |
|-----|---------|
| http://localhost:3001/login | Hotel manager PIN (`1234` / `vasavi`) |
| http://localhost:3001/dashboard | Multi-hotel operations |
| http://localhost:3001/admin/login | Super Admin PIN (`admin123` / `vasavi`) |
| http://localhost:3001/admin/donors | Donor CRUD, coupons, analytics |

## Related apps

| Folder | Port |
|--------|------|
| `vasavi-main-site` | 3000 |
| **`vasavi-superadmin`** | **3001** |
| `vasavi-admin` | 3002 |
