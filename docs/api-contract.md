# API Contract

Living document. Petros adds/updates endpoints here as each sprint's backend work lands — Sozos consumes only what's documented here, never in-progress work.

Base URL (local dev): `http://localhost:8000/api`

Auth: Laravel Sanctum. Send `Authorization: Bearer {token}` on all authenticated routes.

---

## Conventions

- All responses are JSON.
- Success: `{ "data": ... }`
- Error: `{ "message": "...", "errors": { "field": ["..."] } }` (422 on validation errors)
- Timestamps in ISO 8601 UTC.
- Paginated list endpoints return Laravel's default paginator shape (`data`, `links`, `meta`).
- Polymorphic listing types are always referred to as `gym` / `trainer` / `shop` in request bodies (never the PHP class name).

---

## Sprint 1 — Login/Register

### `POST /auth/register`

```json
{
  "name": "string, required",
  "email": "string, required, unique",
  "phone": "string, optional",
  "role": "user | gym_owner | trainer | shop, required",
  "password": "required, confirmed, meets Laravel's default password rules",
  "password_confirmation": "required, must match password"
}
```

Returns `{ "data": { "user": {...}, "token": "..." } }`. `role` here only sets what kind of account it is — it does **not** create a Gym/Trainer/Shop record; a `gym_owner`/`trainer`/`shop` user creates their actual listing later from the Partner panel.

### `POST /auth/login`

```json
{ "email": "required", "password": "required", "device_name": "required, string" }
```

`device_name` is a Sanctum token label (e.g. `"iphone-expo-go"`) — it doesn't have to be unique, but a logout only revokes the token issued to that login, not every device.

Returns `{ "data": { "user": {...}, "token": "..." } }`.

### `POST /auth/logout` — auth required

Revokes the current token.

### `POST /auth/refresh` — auth required

Issues a new token and revokes the old one.

### `POST /auth/forgot-password`

```json
{ "email": "required" }
```

### `POST /auth/reset-password`

```json
{ "email": "required", "token": "required", "password": "required, confirmed" }
```

### `GET /user` — auth required

Returns the authenticated user.

---

## Sprint 2 — Home, Search, Categories

### `GET /categories`

Returns all categories, each with a `listings_count`.

### `GET /categories/{category}`

By id or slug.

### `POST /categories`, `PUT /categories/{category}`, `DELETE /categories/{category}` — auth + `admin` role required

```json
{ "name": "required", "slug": "optional, auto-slugified from name if omitted", "icon": "optional" }
```

### `GET /search`

Query params, all optional unless noted:

| Param | Notes |
|---|---|
| `q` | text match against name + description/bio |
| `type` | `gym`\|`trainer`\|`shop`\|`all` (default `all` — merges top results across all three, capped at 20, not truly paginated) |
| `category` | category id or slug |
| `lat`, `lng` | required together; enables Haversine `distance_km` sort |
| `radius_km` | only applies with `lat`/`lng` |
| `sw_lat`, `sw_lng`, `ne_lat`, `ne_lng` | bounding-box filter, all four required together (alternative to radius) |
| `per_page`, `page` | ignored when `type=all` |

Only listings that are **both `is_active` and `is_verified`** (approved in the Admin panel) are returned — a brand-new, not-yet-approved listing won't show up here even though it exists in the DB.

---

## Sprint 3 — Profiles

### `GET /gyms/{gym}`, `GET /trainers/{trainer}`, `GET /shops/{shop}`

By id. 404s if `is_active` or `is_verified` is false. Returns categories, facilities (gym/shop only), active fitness classes (popular-first), reviews count/avg rating, and full contact/location fields.

### `POST /gyms/{gym}/logo`, `POST /gyms/{gym}/cover`, `POST /trainers/{trainer}/photo`, `POST /shops/{shop}/logo`, `POST /shops/{shop}/cover` — auth required, owner only

Multipart form upload:

```
image: file, required, jpg|jpeg|png|webp, max 5MB
```

---

## Sprint 4 — Offers & QR Codes

### `GET /offers`

Query params: `type` (`gym`\|`trainer`\|`shop`), `page`.

### `GET /offers/{offer}`

### `POST /offers` — auth required (owner of the target listing)

```json
{
  "offerable_type": "gym | trainer | shop, required",
  "offerable_id": "integer, required",
  "title": "required",
  "description": "optional",
  "discount_type": "percentage | fixed_amount, required",
  "discount_value": "numeric, required, min 0.01 (max 100 if percentage)",
  "starts_at": "optional date",
  "expires_at": "optional date, must be >= starts_at"
}
```

### `PUT /offers/{offer}` — auth required, owner only

Same fields as create, all `sometimes` (partial update supported), plus `is_active: boolean`.

### `DELETE /offers/{offer}` — auth required, owner only

### `POST /offers/{offer}/claim` — auth required

Idempotent — claiming the same active offer twice returns the same `DiscountCode` rather than creating a duplicate. Returns `{ "data": { "code": "...", "status": "active", "qr_svg": "<svg>...</svg>", ... } }`.

### `GET /discount-codes/mine` — auth required

All discount codes claimed by the current user.

### `GET /discount-codes/{code}` — auth required

Looked up by the code string, not a numeric id.

### `POST /discount-codes/{code}/redeem` — auth required (business side — scanned/typed in by the partner in person)

Marks a code redeemed. Fails with a validation error if already redeemed or expired.

---

## Sprint 6 — Facilities, Classes & Bookings

_(Not in the original MVP plan — added mid-project. Facilities/classes are read-only via the listing detail endpoints above; the only write surface is booking.)_

### `GET /bookings/mine` — auth required

The current user's bookings, with `bookable` and `fitness_class` eager-loaded.

### `POST /bookings` — auth required

```json
{
  "bookable_type": "gym | trainer | shop, required",
  "bookable_id": "integer, required",
  "fitness_class_id": "integer, optional — must belong to an existing fitness_classes row",
  "scheduled_at": "date, required UNLESS fitness_class_id is given (a class booking uses the class's own schedule)",
  "notes": "string, optional, max 1000"
}
```

Always created with `status: "pending"` — the partner confirms/cancels it from their panel.

---

## Not REST endpoints — Filament panels

The Admin (`/admin`) and Partner (`/partner`) panels are server-rendered Livewire apps, not part of this JSON API — they use Laravel's own session auth, not Sanctum tokens. See the root `README.md` for what each panel covers.
