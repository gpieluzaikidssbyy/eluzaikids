# Authorization / admin access

Applies to `app/Http/Middleware/**`, `routes/web.php`.

- Admin-only areas must be enforced **server-side via middleware**, never by merely hiding UI buttons.
- Use an `EnsureUserIsAdmin` middleware that requires an authenticated user with `is_admin === true` (`abort(403)` otherwise).
- Register a route-alias (`admin`) for the middleware; apply to the whole `/admin` group, always together with the `auth` middleware.
- Do not trust client-side visibility for authorization decisions.
