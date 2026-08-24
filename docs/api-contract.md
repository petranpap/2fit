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

---

## Sprint 1 — Login/Register

_(to be filled in by Petros once the Sanctum auth endpoints are built)_

---
