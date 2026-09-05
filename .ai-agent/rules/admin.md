---
paths:
  - 'app/Http/Controllers/Admin/**'
  - app/Http/Controllers/Admin/RegistrantController.php
---

# Admin

## Attendance export
Monthly and yearly attendance exports are available on the records page. The per-class/date export feature has been removed.

## Registrant management (quota monitor)
Admin/RegistrantController exposes monitoring pages `admin.registrants.events` & `admin.registrants.activities` plus AJAX quota setters (POST `.../quota`, sends `value` string; `'null'`/'' resets to unlimited). Methods return JsonResponse via `response()->json($this->quotaResponse(...))` — do NOT return the array directly (type error). Views render +/- buttons that fetch and update quota + remaining in place.

## Quota reset + realtime Details pages
Quota reset: AJAX POST sends `value` as string. `'null'` (or `''`) resets quota to unlimited/null; anything else is cast to int clamped to >=0. The reset button in the registrant tables sends `'null'`. Details pages: `showEvent`/`showActivity` render full detail page normally, but when `$request->ajax()` (X-Requested-With) return just the re-usable `admin.registrants._rows` partial so the detail page can poll-replace its `<tbody>` for realtime updates. Do NOT rely on `''` through the test client (json_decode turns it into null → clamped to 0); always send `'null'`.
