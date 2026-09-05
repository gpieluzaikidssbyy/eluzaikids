---
paths:
  - 'app/Http/Controllers/**'
---

# Controllers

## Seed generation key with Cache::add before Cache::increment
With CACHE_STORE=database, Cache::increment() is a silent no-op when the key doesn't exist yet (it does an UPDATE that affects 0 rows). ALWAYS seed with Cache::add('key', 0, now()->addYears(100)) before Cache::increment('key'). This is used for the events/activities generation counters in Admin\EventController and Admin\ActivityController invalidateCache(). See .ai/rules/caching.md.
