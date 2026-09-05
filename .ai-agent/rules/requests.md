---
paths:
  - 'app/Http/Requests/**'
---

# Requests

## Registration email now required
All public registration form fields are now required. In StoreEventRegistrationRequest & StoreActivityRegistrationRequest `email` is `required|email|max:255` (NOT nullable anymore). Keep the duplicate + confirmation logic using `$validated['email'] ?? null` (still safe).
