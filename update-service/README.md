# Public competition data endpoint

Production endpoint: `https://nomore-info-gaps-data.17789861171.workers.dev`.

The desktop client reads `GET /v1/package.json` once on startup when a daily check is due, and again at local midnight while the app remains open. The service publishes only competition data collected from registered public official HTTPS sources; it contains no user data.

Cloudflare Cron runs at 01:00 and 13:00 UTC (09:00 and 21:00 China Standard Time). Each run checks one half of the registered official source URLs, so every monitorable HTML source is checked once per day. The crawler stops on access-denial and rate-limit responses, retries only transient timeout/5xx failures once, caps page size and request time, and retains the previous successful hash and package on failure. Direct PDF sources remain available to desktop users but are reported as unmonitorable instead of being treated as parsed HTML. Exact 2026 registration dates are changed only when the competition name and an explicit registration date expression appear together on the official page.

KV keys:

- `package/current`: currently published package.
- `package/previous`: rollback package before the latest successful change.
- `source/<sha256>`: source-page content state and last check result.
- `crawl/last-run`: public health summary without credentials or user data.

Public routes:

- `GET /health`
- `GET /v1/status.json`
- `GET /v1/crawl-report.json`
- `GET /v1/package.json`
- `GET /v1/latest.json` (after a signed desktop release is assembled)
- `GET /downloads/<signed-nsis-installer>` (after a signed desktop release is assembled)

Before deployment, run `npm run data:export` and `npm test`. Deploy from this directory with Wrangler after authenticating the Cloudflare account. A failed client request never replaces the last valid local package.
