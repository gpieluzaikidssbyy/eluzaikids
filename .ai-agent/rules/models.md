---
paths:
  - 'app/Models/**'
---

# Models

## Activity now has a quota column
`activities` now has a nullable `quota` (unsignedInteger, after `location`) — added by migration add_quota_to_activities_table. This supersedes the old "Activity has NO quota" rule. `Activity::remainingQuota()` mirrors Event's. Validate with `nullable|integer|min:0` in StoreActivityRequest.
