'use client';

import { useEffect, useState } from 'react';

const SLIDES = ['/img/home-1.svg', '/img/home-2.svg', '/img/home-3.svg'];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goPrev = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  const goNext = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={i !== currentSlide}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide}
              alt={i === currentSlide ? 'Gedung GPI Eluzai Kids' : undefined}
              width={800}
              height={600}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
      <button
        onClick={goPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-700 shadow transition hover:bg-white"
        aria-label="Sebelumnya"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-700 shadow transition hover:bg-white"
        aria-label="Berikutnya"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            aria-label={`Slide ${i + 1}`}
            aria-current={i === currentSlide}
            className="flex h-7 w-7 items-center justify-center"
          >
            <span
              className={`block h-2 rounded-full transition-all ${i === currentSlide ? 'w-5 bg-white' : 'w-2 bg-white/60'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}