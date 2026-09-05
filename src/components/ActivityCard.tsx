import Link from 'next/link';
import { formatDateIndo, remainingQuota } from '@/lib/helpers';
import type { Activity } from '@/lib/types';
import { RegistrationForm } from './RegistrationForm';

interface ActivityCardProps {
  activity: Activity;
  registrationsCount?: number;
}

export function ActivityCard({ activity, registrationsCount = 0 }: ActivityCardProps) {
  const remaining = remainingQuota(activity.quota, registrationsCount);
  const isFull = remaining !== null && remaining <= 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      {activity.image ? (
        <Link href={`/activities/${activity.id}`} className="block">
          <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              src={activity.image}
              alt={activity.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 hover:scale-105"
            />
          </div>
        </Link>
      ) : (
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-white">
          {activity.activity_date && (
            <p className="text-sm font-medium text-white/90">{formatDateIndo(activity.activity_date)}</p>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
          {activity.title}
        </h3>
        {activity.location && (
          <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <svg className="h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
              <path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
            </svg>
            {activity.location}
          </p>
        )}
        <div className="mt-auto flex gap-3 pt-3">
          <Link
            href={`/activities/${activity.id}`}
            className="flex-1 inline-flex items-center justify-center rounded-lg bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            Detail
          </Link>
          {!isFull && (
            <div className="flex-1">
              <RegistrationForm
                registrableType="activity"
                registrableId={activity.id}
                registrableTitle={activity.title}
                buttonClass="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
