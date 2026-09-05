import Link from 'next/link';
import { EventCard } from '@/components/EventCard';
import { ActivityCard } from '@/components/ActivityCard';
import { HeroSlider } from '@/components/HeroSlider';
import { fetchHomeData } from '@/lib/home-data';

export const dynamic = 'force-dynamic';

const MONTHS: Record<string, string> = {
  '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
  '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
  '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTHS[String(d.getMonth() + 1).padStart(2, '0')];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export default async function HomePage() {
  const data = await fetchHomeData();

  return (
    <>
      {/* Hero */}
      <section className="relative gradient-hero text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12">
          <div>
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Selamat Datang di GPI Eluzai Kids
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Tempat anak-anak bertumbuh dalam iman, sukacita, dan kasih Kristus.
              Ibadah yang hidup, persekutuan yang hangat, dan kegiatan yang kreatif
              untuk masa depan gereja.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#jadwal" className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700">
                Lihat Jadwal
              </a>
              <a href="#event" className="rounded-full border border-white/30 bg-transparent px-6 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
                Event Mendatang
              </a>
            </div>
          </div>

          <HeroSlider />
        </div>
      </section>

      {/* Jadwal */}
      <section id="jadwal" className="bg-white py-12 sm:py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
              Jadwal Ibadah
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded gradient-primary" />
          </div>

          {data.schedules.length === 0 || data.schedules.every((s) => !s.schedule) ? (
            <div className="mt-8 rounded-2xl bg-slate-50 p-8 text-center text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              Belum ada jadwal ibadah yang tersedia.
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {data.schedules.map((slot) => (
                <div
                  key={slot.type}
                  className={`rounded-2xl border-2 p-6 shadow-sm transition hover:shadow-md ${
                    slot.schedule
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                      : 'border-red-400 bg-red-50 dark:bg-red-950/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                        slot.schedule
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                      }`}
                    >
                      {slot.type}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        slot.schedule ? 'text-slate-700 dark:text-slate-300' : 'text-red-600 dark:text-red-300'
                      }`}
                    >
                      {slot.schedule ? `${slot.schedule.time.slice(0, 5)} WIB` : '--:--'}
                    </span>
                  </div>

                  {slot.schedule ? (
                    <>
                      {slot.schedule.nextDate && (
                        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                          </svg>
                          {formatDate(slot.schedule.nextDate)}
                        </p>
                      )}
                      <h3 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-slate-100">
                        {slot.schedule.type}
                      </h3>
                      {slot.schedule.description && (
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          {slot.schedule.description}
                        </p>
                      )}
                      <p className="mt-3 flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                        </svg>
                        {slot.schedule.time.slice(0, 5)} WIB
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="mt-3 font-display text-xl font-bold text-red-700 dark:text-red-300">
                        {slot.type}
                      </h3>
                      <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-300">
                        Tidak ada jadwal untuk kategori ini.
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/schedule" className="inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
              Lihat Halaman Jadwal
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Events */}
      <section id="event" className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
              Event Mendatang
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded gradient-primary" />
          </div>

          {data.events.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-8 text-center text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-400">
              Belum ada event yang akan datang.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.events.map((event) => (
                <EventCard key={event.id} event={event} registrationsCount={event.registrations_count} />
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/events" className="inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
              Lihat Semua Event
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Activities */}
      <section id="kegiatan" className="bg-white py-12 sm:py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
              Kegiatan
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded gradient-primary" />
          </div>

          {data.activities.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-8 text-center text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-400">
              Belum ada kegiatan yang tersedia.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} registrationsCount={activity.registrations_count} />
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/activities" className="inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
              Lihat Semua Kegiatan
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Location */}
      {data.churchInfo?.map_embed_url && (
        <section id="lokasi" className="py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
                Lokasi Kami
              </h2>
              <div className="mx-auto mt-3 h-1 w-16 rounded gradient-primary" />
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 shadow-md dark:border-slate-700">
              <iframe
                src={data.churchInfo.map_embed_url}
                className="h-[50vh] w-full min-h-[420px]"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi GPI Eluzai Kids"
              />
            </div>

            {data.churchInfo.address && (
              <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-start justify-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary text-white">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                      <path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    </svg>
                  </div>
                  <div className="text-start">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Alamat</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{data.churchInfo.address}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link href="/location" className="inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
                Lihat Halaman Lokasi
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Contacts */}
      <section id="kontak" className="bg-slate-50 py-12 sm:py-16 dark:bg-slate-800/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
              Kontak Kami
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded gradient-primary" />
          </div>

          {data.churchInfo && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  key: 'whatsapp',
                  label: 'WhatsApp',
                  url: data.churchInfo.whatsapp ? `https://wa.me/${data.churchInfo.whatsapp.replace(/\D/g, '')}` : null,
                  color: 'from-green-500 to-green-600',
                  icon: (
                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  ),
                },
                {
                  key: 'instagram',
                  label: 'Instagram',
                  url: data.churchInfo.instagram_url,
                  color: 'from-pink-500 to-purple-600',
                  icon: (
                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  ),
                },
                {
                  key: 'youtube',
                  label: 'YouTube',
                  url: data.churchInfo.youtube_url,
                  color: 'from-red-500 to-red-600',
                  icon: (
                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  ),
                },
              ].map((contact) => (
                <a
                  key={contact.key}
                  href={contact.url || '#'}
                  target={contact.url ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className={`group relative flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 ${!contact.url ? 'pointer-events-none grayscale' : ''}`}
                >
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${contact.color} text-white shadow-md`}>
                    {contact.icon}
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                    {contact.label}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {contact.url ? 'Klik untuk terhubung' : 'Segera hadir'}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition group-hover:gap-2 dark:text-brand-300">
                    Kunjungi
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
              Lihat Halaman Kontak
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}