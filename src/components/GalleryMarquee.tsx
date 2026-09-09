// Placeholder photos (picsum.photos) — swap these URLs with real gallery photos later.
const ROW_1_PHOTOS = Array.from(
  { length: 5 },
  (_, i) => `https://picsum.photos/seed/eluzai-gallery-a-${i + 1}/640/360`
);
const ROW_2_PHOTOS = Array.from(
  { length: 5 },
  (_, i) => `https://picsum.photos/seed/eluzai-gallery-b-${i + 1}/640/360`
);

// Each row's content is repeated 4x so the -25% translate loops seamlessly.
const REPEAT = 4;

function MarqueeRow({ photos, reverse = false }: { photos: string[]; reverse?: boolean }) {
  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        className={`flex w-max gap-5 hover:[animation-play-state:paused] motion-reduce:[animation-play-state:paused] ${
          reverse ? 'animate-marquee-slow-reverse' : 'animate-marquee-slow'
        }`}
      >
        {Array.from({ length: REPEAT }, (_, rep) =>
          photos.map((src, i) => (
            <div
              key={`${rep}-${i}`}
              className="w-60 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:w-72 dark:border-slate-700 dark:bg-slate-800"
            >
              <img
                src={src}
                alt={`Galeri GPI Eluzai Kids ${i + 1}`}
                loading="lazy"
                className="aspect-video w-full object-cover transition duration-300 hover:scale-105"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function GalleryMarquee() {
  return (
    <section id="galeri" className="overflow-hidden bg-white py-12 sm:py-16 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
              Gallery Kami
            </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded gradient-primary" />
        </div>
      </div>

      <div className="mt-10 space-y-5">
        <MarqueeRow photos={ROW_1_PHOTOS} />
        <MarqueeRow photos={ROW_2_PHOTOS} reverse />
      </div>
    </section>
  );
}
