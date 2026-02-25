# Tafuri Web Deployment Checklist
Last updated: 2026-02-20

## Build
1. Set `NEXT_PUBLIC_BACKEND_API_URL` to the production API base.
2. Ensure `NEXT_PUBLIC_ENABLE_DEMO_SEED` is not `true`.
3. Run install + build in a clean environment.
4. Verify static assets load (logo, icons, animations).

## Runtime
1. Confirm auth flow works with production cookies and CORS.
2. Confirm POS checkout can complete a sale end-to-end.
3. Confirm reports export works (CSV download).
4. Confirm error boundary behavior (no blank screens on 4xx/5xx).

## Observability
1. Enable client error tracking (Sentry or equivalent).
2. Track API error rates and auth failures.
