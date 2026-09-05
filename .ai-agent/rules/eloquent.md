# Eloquent / migrations rules

Applies to `app/Models/**` and `database/migrations/**`.

- Every model declares `$fillable` (or `#[Fillable(...)]` attribute) covering all mass-assignable columns.
- Relationships over manual joins: `hasMany`/`belongsTo`/`hasOne` and use `with()`/`withCount()`.
- Only Eloquent / Query Builder — no raw SQL in models or migrations.
- Migrations: explicit `$table->foreignId(...)->constrained()->cascadeOnDelete()` for FKs; add proper indexes on frequently filtered columns.
- Use `updateOrCreate` in seeders so they are idempotent.
