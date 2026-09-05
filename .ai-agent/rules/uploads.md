# Image upload rules

Applies to `app/Http/Controllers/Admin/**` and admin image handling in `app/Http/Requests/**`.

- **Type**: allow only `jpg`, `jpeg`, `png` (`mimes:jpg,jpeg,png`, `image`). No `webp`, no SVGs.
- **Size**: max **2MB** (`max:2048`).
- **Ratio**: require `dimensions:ratio=4/5` (posters are rendered 4:5 in the UI).
- **Server-side type check** in `ImageUpload::store`: whitelisted extension AND MIME (`image/jpeg`/`image/png`) AND extension must match `guessExtension()`. Throw `InvalidArgumentException` otherwise; controllers catch it and redirect back with an `image` error (never a 500).
- **Auto-rename**: never keep user-supplied filename. Use a generated unique name (e.g. `store()` with random hashed name or explicit `Str::random()` name).
- **Non-executable storage**: save under `storage/app/public/images/` via the `public` disk + `storage:link`. This is outside the webroot `public/` (only reachable via the public-storage symlink serving static content), so uploaded scripts cannot be executed directly.
- Always use `Storage::disk('public')`; remove the old file on update/delete.
