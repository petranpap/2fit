# 2fit (2Gym)

Gym/trainer/shop discovery and matchmaking app for Cyprus — search, categories, map, profiles, offers with QR redemption, reviews, and partner/admin panels.

## Repo structure

```
/backend   Laravel API (MariaDB, Sanctum auth)
/mobile    React Native / Expo app
/docs      API contract, ERD, sprint tracking
/assets    Concept images and logo
```

## Team

- **Petros** — backend (Laravel API, DB schema, auth, business logic, deployment) + complex frontend (search/map, partner dashboard, admin panel logic)
- **Sozos** — self-contained UI screens/components in React Native, built against contracts Petros has already published in `/docs/api-contract.md`

## Getting started

### Backend

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

Requires a local MariaDB instance — configure credentials in `backend/.env`.

### Mobile

```bash
cd mobile
npm install
npx expo start
```

## Git workflow

- Branch naming: `sprint{N}-{feature}-{name}`, e.g. `sprint2-search-petros`, `sprint2-profile-ui-sozos`
- PRs target `develop`, never commit directly to `develop` or `main`
- `main` is protected and only updated via PR at the end of each sprint
- See root `CLAUDE.md` for the full sprint plan and task breakdown
