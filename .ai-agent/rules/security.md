# Security rules: requests, controllers, routes

Applies to `app/Http/Requests/**`, `app/Http/Controllers/**`, `routes/**`.

## Event/Activity registration
- `name`: `required|string|max:255`
- `phone`: Indonesian format — `required|regex:/^(\+62|62|0)8[1-9][0-9]{7,11}$/`
- `email`: `required|email|max:255` (all registration fields are required; see requests.md)
- Google reCAPTCHA v2 token required server-side (custom `recaptcha` rule → `https://www.google.com/recaptcha/api/siteverify`).
- **Rate limiting**: max 3 submits / minute / IP. Use a named throttle limiter (`limiter('register')`) on the register routes.
- **Duplicate prevention**: before insert, reject if the same `phone` OR `email` already exists for the same `event_id`/`activity_id`. Normalize phone to canonical `62`+ format before checking. Keep the check inside `RegistrationController::duplicateExists()`. If `email` is null (optional field), only check `phone`.
- **Quota**: `Event` and `Activity` each have a nullable `quota` column (Activity's added via `add_quota_to_activities_table`). Before insert, `abort(403)` when `registrations()->count() >= quota` (see `RegistrationController::ensureQuotaAvailable()`).

## Auth login
- `LoginRequest`: `username` and `password` must be `required|string|max:255` (limit length to match the DB column; oversized input is rejected before hashing/rate-limiting).
- Rate limiting already applies (5 attempts then lockout on the `register` limiter key).

## General
- Reject with `abort(403)` when a precondition (registration closed/quota full/duplicate) fails.
- Use FormRequests (authorize + rules + messages) everywhere; no inline validation in controllers for these.

## XSS / script injection (all forms)
- **Output**: ALL Blade output MUST use `{{ }}` (auto-escaped). Never use `{!! !!}` on user/admin-controlled data.
- **Input (defense in depth)**: every FormRequest with a free-text field uses `App\Http\Requests\Concerns\SanitizesInput` and calls `$this->sanitize([...])` in `prepareForValidation()` to `strip_tags` those fields before validation/persistence. Never save raw HTML/`<script>`/`on*` attributes to the DB. Do NOT sanitize passwords.
- **URLs**: any URL field (`map_embed_url`, `drive_link`, `instagram_url`, `youtube_url`) must use the `url` rule — it rejects dangerous schemes like `javascript:`. Verify with `Validator::make(['u' => 'javascript:...'], ['u' => ['url']])` if unsure.
- **CSRF**: every `<form method="POST">` must include `@csrf`; routes are under the `web` middleware group (CSRF enforced by default).
- This layered approach (input sanitization + output escaping + URL scheme whitelist + CSRF) is the standing contract for all forms/routes.
