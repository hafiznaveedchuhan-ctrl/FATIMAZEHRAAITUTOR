# ADR-001: JWT Authentication Strategy

**Date**: 2026-03-25
**Status**: Accepted
**Deciders**: FatimaZehra-AI-Tutor team

## Context

The platform requires secure authentication for a freemium SaaS with three tiers (free, premium, pro). Users authenticate via email/password or Google OAuth. Tier information must be available on every request for access control.

## Decision

Use **NextAuth.js** on the frontend with **JWT tokens** stored in **httpOnly cookies**, paired with a custom FastAPI JWT backend.

- NextAuth.js handles the OAuth/session lifecycle on the frontend
- FastAPI issues and verifies its own HS256 JWTs (7-day expiry)
- Tier is embedded in the JWT payload for fast access gating
- Live tier is fetched from `/auth/me` on each page load to handle post-payment upgrades (stale JWT mitigation)
- `session.update()` + `trigger === 'update'` in the JWT callback refreshes the token after Stripe payment

## Alternatives Considered

| Option | Pros | Cons |
|---|---|---|
| Session-based (server-side) | No stale token problem | Requires shared session store, stateful |
| Opaque tokens + Redis | Easy revocation | Extra infra, added latency |
| **JWT + live fetch (chosen)** | Stateless, scalable, simple | Requires stale-token mitigation pattern |

## Consequences

- **Positive**: Stateless API, horizontally scalable, no session DB needed
- **Positive**: Google OAuth handled cleanly by NextAuth.js
- **Negative**: Token revocation requires expiry wait (mitigated by 7-day TTL + live fetch pattern)
- **Negative**: Tier staleness after payment requires explicit refresh call

## References

- `frontend/app/api/auth/[...nextauth]/route.ts` — JWT callback with `trigger === 'update'`
- `backend/auth.py` — JWT create/verify utilities
- `backend/routes/auth.py` — `/auth/me`, `/auth/change-password`
