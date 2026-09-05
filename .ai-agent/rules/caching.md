# Caching

Pola cache untuk endpoint publik user. Bertujuan mengurangi beban DB tanpa membuat data basi.

## Key store & kompatibilitas
- Dev lokal `CACHE_STORE=database`; produksi (Docker) `CACHE_STORE=redis`.
- Redis store MENDAPAT tags, database store TIDAK. Jangan pakai `Cache::tags()` agar bekerja di kedua env.
- JANGAN pakai `Cache::flush()`: session memakai store yang sama di redis, flush akan mengeluarkan semua user.

## Invalidasi lewat generation counter (BUKAN flush)
Pagination publik di-cache per halaman. Karena jumlah halaman tak diketahui, gunakan counter generation di key supaya satu invalidasi otomatis membasmi SEMUA halaman tanpa forget banyak key:
- `events.index.page.{page}.v{gen}` di mana `gen = Cache::get('cache.generation.events', 0)`.
- `activities.index.page.{page}.v{gen}` di mana `gen = Cache::get('cache.generation.activities', 0)`.
- Saat data berubah: `Cache::add()` + `Cache::increment()` (lihat bawah).

## Key yang dikelola
- `cache.generation.events`, `cache.generation.activities` — counter generasi.
- `home.data` — gabungan events + activities + contacts + salinan churchInfo (TTL 10m).
- `churchinfo` — singleton ChurchInfo::instance() (TTL 6h).
- `schedules.active` — daftar jadwal aktif, TTL 1 hari (sudah ada sejak awal).

## Invalidasi wajib (simpan key baru yang di-cache)
- Admin `EventController::store/update/destroy` → `Cache::add('cache.generation.events', 0)` + `Cache::increment('cache.generation.events')` + `Cache::forget('home.data')`.
- Admin `ActivityController::store/update/destroy` → `Cache::add('cache.generation.activities', 0)` + `Cache::increment('cache.generation.activities')` + `Cache::forget('home.data')`.
- Admin `ChurchInfoController::update` → `Cache::forget('churchinfo')` + `Cache::forget('home.data')`.
- Admin `ScheduleController` → `Cache::forget('schedules.active')` (sudah ada).

## Catatan penting
- URL tidak diblokir: menambah pendaftaran TIDAK meng-invalidasi cache publik karena jumlah pendaftar tidak ditampilkan di halaman user.
- **Sisa kuota HANYA boleh ditampilkan di halaman `events.show`** (yang memakai `loadCount('registrations')` dan TIDAK di-cache → akurat real-time). JANGAN tambahkan jumlah pendaftar/sisa kuota ke halaman `index`/`home` yang di-cache, karena itu akan menampilkan angka basi hingga cache expire.
- **Setiap kali mengubah struktur data yang di-cache (kolom, casts, return type query, bentuk array HOME.data), jalankan `php artisan cache:clear`.** Cache DB store menyimpan serialized Eloquent; struktur lama yang di-unserialize setelah kode berubah bisa memicu error "incomplete object Illuminate\\Database\\Eloquent\\Collection" → HTTP 500 (ViewException). `cache:clear` aman karena tidak menyentuh tabel `sessions`.
- `isRegistrationOpen()`/`registrationDeadline()` hanya bergantung pada tanggal (bukan jumlah pendaftar) → aman untuk model yang di-hydrate dari cache.
- Cache paginator menserialisasi `LengthAwarePaginator` berisi Eloquent models; hidrasi ulang tetap menerapkan casts datetime.
- `EventController::show` / `ActivityController::show` sengaja TIDAK di-cache (count registrasi real-time dengan `loadCount`).
- **`Cache::increment()` TIDAK BEKERJA pada database store jika key belum ada.** Database store melakukan `UPDATE ... increment` yang hanya mempengaruhi baris existing — jika row tidak ada, hasilnya 0 baris terpengaruh (no-op). Selalu panggil `Cache::add('key', 0, TTL_lama)` SEBELUM `Cache::increment('key')` untuk memastikan key ada. `Cache::add()` hanya mengatur nilai jika key belum ada (safe dipanggil berulang kali).
