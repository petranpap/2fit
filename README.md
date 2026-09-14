# 2fit (2Gym)

Gym / trainer / shop discovery app for Cyprus. Customers search nearby listings by category and distance, view profiles, claim offers as QR-backed discount codes, book classes, and leave reviews. Businesses manage their own listing, offers, and bookings from a Filament partner panel. Platform admins approve new listings, moderate reviews, and oversee commerce data from a separate Filament admin panel.

## Contents

- [What's built](#whats-built)
- [Tech stack](#tech-stack)
- [Repo structure](#repo-structure)
- [Prerequisites](#prerequisites)
- [Local setup — backend](#local-setup--backend)
- [Local setup — mobile app](#local-setup--mobile-app)
- [Seeded accounts](#seeded-accounts)
- [Admin panel](#admin-panel)
- [Partner panel](#partner-panel)
- [API overview](#api-overview)
- [Design system](#design-system)
- [Troubleshooting](#troubleshooting)
- [Team & git workflow](#team--git-workflow)

---

## What's built

Built sprint-by-sprint per `CLAUDE.md`'s plan (Petros: backend + complex frontend, Sozos: self-contained mobile UI):

| Sprint | Feature | Status |
|---|---|---|
| 1 | Login / Register (Sanctum token auth) | ✅ |
| 2 | Home, Search (location + category filters), Categories | ✅ |
| 3 | Gym / Trainer / Shop profile screens, image upload | ✅ |
| 4 | Offers, QR-code discount codes, claim/redeem flow | ✅ |
| 5 | Partner panel (Filament) — manage listing, offers, redemptions | ✅ |
| 6+ | Facilities, classes ("popular" curated by partner), bookings + partner CRM | ✅ |
| 6 | Admin panel (Filament) — listing approval queue, review moderation, commerce oversight (offers, bookings, discount codes, statistics, subscription plans) | ✅ |
| 7 | Manual QA pass | ⏳ not started |

There is **no interactive map view yet** — "location-based" currently means Haversine distance sorting/filtering server-side from the device's lat/lng, not a `MapView` component. Online payments, membership management (a partner actually subscribing to a plan), and push notifications are out of MVP scope per `CLAUDE.md`.

## Tech stack

- **Backend:** Laravel 13, PHP 8.3+, MariaDB/MySQL, Laravel Sanctum (API token auth)
- **Admin/Partner panels:** Filament v3 (two separate panels — see below)
- **QR codes:** `bacon/bacon-qr-code` (pure-PHP SVG generation — deliberately not `simplesoftwareio/simple-qrcode`, which hard-requires the `gd` extension even for SVG output)
- **Mobile:** React Native (Expo SDK 57, Expo Go compatible, not bare workflow), React Navigation
- **i18n:** lightweight custom implementation (Greek default, English fallback) — no `react-i18next`

## Repo structure

```
/backend
  app/Http/Controllers/Api/   REST API controllers (auth, search, gyms/trainers/shops, offers, discount codes, bookings)
  app/Filament/Partner/       Partner panel resources (one business owner manages their own listing)
  app/Filament/Admin/         Admin panel resources (platform-wide oversight)
  app/Services/                Business logic (OfferService, BookingService, SearchService, MediaUploadService, QrCodeService)
  database/migrations/         Schema
  database/seeders/            Demo data + reference data (categories, facilities, subscription plans, admin user)
/mobile
  screens/                     One file per screen (Home, Search, PlaceDetail, Offers, BookingRequest, ...)
  components/                  Shared UI components
  api/                         Thin wrappers around fetch, one file per API domain
  navigation/                  React Navigation stack/tab setup
  i18n/                        el.json / en.json translations + LocaleContext
  theme/tokens.js               Design tokens — mirrors docs/design.md, do not hardcode new values
/docs
  api-contract.md              Endpoint reference (living doc, updated per sprint)
  design.md                    Design tokens (colors, type, spacing) — source of truth for theme/tokens.js
/assets                        Concept images, logo
```

## Prerequisites

- PHP **8.3+** with the `pdo_mysql`, `mbstring`, `openssl` extensions (standard on most PHP installs — no `gd`/`imagick` needed, see QR note above)
- Composer 2.x
- MariaDB or MySQL (running locally, reachable on `127.0.0.1:3306`)
- Node.js 20+ and npm
- An Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)), **or** Xcode/Android Studio if you want a simulator instead

## Local setup — backend

```bash
cd backend
cp .env.example .env
composer install
```

Create a local database matching `.env`'s defaults (`2fit`, user `root`, no password) — adjust `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` in `.env` instead if your local MariaDB/MySQL setup differs:

```sql
CREATE DATABASE `2fit`;
```

Then:

```bash
php artisan key:generate
php artisan migrate --seed
php artisan storage:link   # required — uploaded logos/covers/photos are served from here
php artisan serve
```

The API is now running at `http://localhost:8000`. `php artisan migrate --seed` gives you a fully populated demo database — gyms/trainers/shops (some deliberately left unverified so you have something to approve in the Admin panel), categories, facilities, subscription plans, offers, fitness classes, and a few reviews (including one spammy one to moderate).

To wipe and reseed at any point (e.g. after testing writes through the panels):

```bash
php artisan migrate:fresh --seed
```

> This invalidates every Sanctum token, so any logged-in mobile session gets bounced to the Login screen automatically on its next request — that's expected, not a bug.

## Local setup — mobile app

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code Expo prints with the Expo Go app (Android: in-app scanner; iOS: Camera app), or press `w` in the terminal to open the web preview instead.

**Connecting to the backend:** `mobile/api/client.js` auto-detects the right API host — in dev it reads the LAN IP Expo's own dev server is bound to (`Constants.expoConfig.hostUri`) rather than hardcoding `localhost`, because `localhost` on a physical phone (or the Android emulator) means the phone itself, not your dev machine. This means:

- Your phone and your dev machine must be on the **same Wi-Fi network**.
- The backend must be reachable on port `8000` from that network (the default `php artisan serve` binding is usually fine on the same LAN; if it isn't, run `php artisan serve --host=0.0.0.0`).
- If you're only using the web preview (`w`), this doesn't matter — it falls back to `localhost:8000` directly.

## Seeded accounts

All seeded users share the password **`password`**.

| Role | Email | Where to log in |
|---|---|---|
| Customer | `test@example.com` | Mobile app |
| Admin | `admin@example.com` | `http://localhost:8000/admin` |
| Gym owner | `powerhouse-gym-limassol-owner@example.com` | `http://localhost:8000/partner` |
| Trainer | `andreas-pauloy-owner@example.com` | `http://localhost:8000/partner` |
| Shop owner | `sportsworld-cyprus-owner@example.com` | `http://localhost:8000/partner` |

(Every seeded gym/trainer/shop gets its own owner account, following the pattern `{slug}-owner@example.com` — see `database/seeders/DemoListingSeeder.php` for the full list, including the three deliberately-unverified listings.)

## Admin panel

`http://localhost:8000/admin` — Filament panel, `role = admin` only (enforced in `User::canAccessPanel()`, panel-aware — a partner account can't get in here and vice versa).

- **Listings** (Gyms / Trainers / Shops) — every listing platform-wide, pending ones sorted first. New registrations default to unverified and are **actually hidden** from public search/detail until approved here (not just a cosmetic badge) — flip the Verified toggle to publish one.
- **Reviews** — view + delete only, never edit (it's the customer's own words). Includes a "low-rated" quick filter.
- **Commerce** — Offers, Bookings, Discount Codes, all platform-wide with a "which listing" column, for oversight/support (e.g. manually confirming a disputed booking).
- **Analytics** — Statistics: raw daily counters (profile views, offer views, redemptions, favorites). Seeded with a week of demo data; nothing in the app writes to this table yet, it's scaffolded ahead of an actual analytics pipeline.
- **Settings** — Subscription Plans: full CRUD over plan definitions (Starter/Growth/Pro seeded). Assigning a partner to a plan isn't built — that's membership management, out of MVP scope.

## Partner panel

`http://localhost:8000/partner` — Filament panel for `gym_owner` / `trainer` / `shop` roles (admins can log in too, for support). Each partner sees only their own listing:

- Create/edit their gym, trainer, or shop profile (logo, cover, description, categories, facilities, opening hours)
- Manage fitness classes and mark which are "Popular" (surfaces on the public profile)
- Create/edit offers
- View and redeem customer discount codes (QR-based, scan or type the code)
- View and confirm/cancel bookings against their listing (the CRM view)
- Dashboard stats widget: active offers, codes claimed/redeemed, pending bookings, review average

## API overview

Base URL (local dev): `http://localhost:8000/api`. Auth: Sanctum bearer tokens (`Authorization: Bearer {token}`) on protected routes. Full conventions and request/response shapes: [`docs/api-contract.md`](docs/api-contract.md) — treat that as the source of truth to update whenever routes change; the table below is a quick map of what exists today.

| Area | Routes |
|---|---|
| Auth | `POST /auth/register`, `/login`, `/logout`, `/refresh`, `/forgot-password`, `/reset-password`, `GET /user` |
| Categories | `GET /categories`, `GET /categories/{category}`, admin-only `POST`/`PUT`/`DELETE` |
| Search | `GET /search` (type, category, lat/lng + radius or bounding box, text query) |
| Listings | `GET /gyms/{gym}`, `GET /trainers/{trainer}`, `GET /shops/{shop}`, plus authenticated logo/cover/photo upload endpoints |
| Offers | `GET /offers`, `GET /offers/{offer}`, authenticated `POST`/`PUT`/`DELETE`, `POST /offers/{offer}/claim` |
| Discount codes | `GET /discount-codes/mine`, `GET /discount-codes/{code}`, `POST /discount-codes/{code}/redeem` |
| Bookings | `GET /bookings/mine`, `POST /bookings` (either `fitness_class_id`, or `scheduled_at` for a generic booking) |

## Design system

`docs/design.md` is the source of truth for colors, typography, spacing, and radius — mirrored exactly in `mobile/theme/tokens.js` and the Filament panel color config. **Don't invent new design values** in either place; add to `docs/design.md` first, then reflect the change in code.

## Troubleshooting

- **"Route [login] not defined" hitting `/admin` or `/partner`** — something else is already bound to port 8000 (another project's `php artisan serve`, most likely). Check with `lsof -i :8000`, stop whatever it is, restart this backend's `php artisan serve`.
- **Mobile app can't reach the API / requests hang** — see the LAN IP note above; confirm phone and dev machine are on the same network, or just use the `w` web preview instead.
- **Logged out unexpectedly** — a `migrate:fresh` (yours or a teammate's, against a shared local DB) invalidates all tokens. The app's 401 handler auto-drops you to Login; just log back in.
- **Uploaded images 404** — you skipped `php artisan storage:link`.
- **`composer install` complaining about `ext-gd`** — you're not using this repo's QR setup; make sure `composer.json` still lists `bacon/bacon-qr-code`, not `simplesoftwareio/simple-qrcode`.

## Team & git workflow

- **Petros** — backend (Laravel API, DB schema, auth, business logic, deployment) + complex frontend (search, partner dashboard, admin panel)
- **Sozos** — self-contained React Native UI, built against contracts Petros has already published in `docs/api-contract.md`

Rules:

- Branch naming: `sprint{N}-{feature}-{name}`, e.g. `sprint2-search-petros`, `sprint2-profile-ui-sozos`
- `git pull origin develop` before starting a new branch
- PRs target `develop`, never commit directly to `develop` or `main`
- Petros reviews every PR before merge
- `main` is protected, only updated via PR at the end of each sprint (tagged)

See root `CLAUDE.md` for the full sprint plan and task breakdown.
