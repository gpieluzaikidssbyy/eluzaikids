import { formatDateIndo, getMapsLink, isDatePassed, remainingQuota } from '@/lib/helpers';
import type { Event } from '@/lib/types';
import { RegistrationForm } from '@/components/RegistrationForm';
import { PreserveFromLink } from './PreserveFromLink';
import { ImageReveal } from './ImageReveal';

interface EventCardProps {
  event: Event;
  registrationsCount?: number;
  section?: string;
}

export function EventCard({ event, registrationsCount = 0, section }: EventCardProps) {
  const remaining = remainingQuota(event.quota, registrationsCount);
  const isFull = remaining !== null && remaining <= 0;
  const isOver = isDatePassed(event.event_date);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      {event.image && (
        <PreserveFromLink section={section} href={`/events/${event.id}`} className="block">
          <ImageReveal>
            <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={event.image}
                alt={event.title}
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 hover:scale-105"
              />
            </div>
          </ImageReveal>
        </PreserveFromLink>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
            {event.title}
          </h3>
          {isOver && (
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              Selesai
            </span>
          )}
        </div>
        {section === 'event' && (
          <div className="space-y-1.5 text-sm">
            {event.tema && (
              <p className="text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-900 dark:text-slate-100">Tema:</span> {event.tema}
              </p>
            )}
            <p className="text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-900 dark:text-slate-100">Tanggal:</span> {formatDateIndo(event.event_date)}
            </p>
            {event.location && (
              <p className="text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-900 dark:text-slate-100">Lokasi:</span> {event.location}
              </p>
            )}
          </div>
        )}
        {section !== 'event' && (
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {event.tema && (
              <p className="flex items-center gap-2">
                <svg className="h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {event.tema}
              </p>
            )}
            <p className="flex items-center gap-2">
              <svg className="h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
              </svg>
              {formatDateIndo(event.event_date)}
            </p>
            {event.location && (
              <p className="flex items-center gap-2">
                <svg className="h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                  <path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                </svg>
                {event.location}
              </p>
            )}
            {isFull && (
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-red-700 dark:bg-slate-700 dark:text-red-300">
                Penuh
              </span>
            )}
          </div>
        )}
        <div className="mt-auto flex gap-3 pt-3">
          <PreserveFromLink
            section={section}
            href={`/events/${event.id}`}
            className="flex-1 inline-flex items-center justify-center rounded-lg bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            Detail
          </PreserveFromLink>
          {isOver ? (
            // Event selesai: tombol jadi link Google Drive foto (hijau = link tersedia).
            event.drive_link ? (
              <a
                href={event.drive_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Foto
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="flex-1 cursor-not-allowed rounded-lg bg-slate-400 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Foto
              </button>
            )
          ) : (
            !isFull && (
              <div className="flex-1">
                <RegistrationForm
                  registrableType="event"
                  registrableId={event.id}
                  registrableTitle={event.title}
                  buttonClass="w-full"
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
