# General PHP / Laravel rules (project-wide)

Standing, load-bearing guidance. Follow in every generated Laravel feature.

## Coding rules applied to ALL generated code
- **Server-side validation always.** Validate/authorize on the server (FormRequest + rules), never rely on `required`/`max` HTML attributes alone.
- **Use Eloquent / Query Builder only.** Never write raw SQL (`DB::select`, `whereRaw`) unless unavoidable; prefer Eloquent models, `with()`, relationships.
- **Escape all database output.** Never use `{!! !!}` unless genuinely required (e.g. authenticated rich text); default to `{{ }}` which auto-escapes.
- **Define `$fillable` on every Model.** List every mass-assignable column explicitly. (User model uses the `#[Fillable([...])]` attribute — equivalent; keep that style there.)
- Use named routes + `route()`; paginate large result sets; eager load to avoid N+1.
- Mobile-first Tailwind; `loading="lazy"` + meaningful `alt` on images.

## Files to read before editing
- `index.md` in this directory for path-to-rule mapping.
- Load every rule file whose glob covers the path(s) in scope before writing code.
