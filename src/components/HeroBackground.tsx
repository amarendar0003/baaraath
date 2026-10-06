"use client";

import { useEffect, useState } from "react";

type HeroImage = {
  id: string;
  url: string;
};

// Put your six images in  public/hero/  with these exact names
// (or change the file names below to match yours).
const HERO_IMAGES: string[] = [
  "/hero/hero-1.png",
  "/hero/hero-2.png",
  "/hero/hero-3.png",
  "/hero/hero-4.png",
  "/hero/hero-5.png",
  "/hero/hero-6.png",
];

const SLIDE_INTERVAL_MS = 6500;

function preload(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Full-bleed slideshow used as the home page hero background.
 * Images come from the static files in public/hero/ (see HERO_IMAGES).
 *
 * Calls onReady(true) when at least one image exists so the parent can switch
 * its text to the light-on-dark style, and onReady(false) otherwise.
 */
export default function HeroBackground({
  onReady,
}: {
  onReady?: (hasImages: boolean) => void;
}) {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  // Preload the images; any file that is missing is skipped automatically.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const results = await Promise.all(HERO_IMAGES.map(preload));

      if (cancelled) return;

      const list: HeroImage[] = HERO_IMAGES.filter(
        (_, index) => results[index]
      ).map((url) => ({ id: url, url }));

      if (list.length === 0) {
        onReady?.(false);
        return;
      }

      setImages(list);
      onReady?.(true);
      requestAnimationFrame(() => setVisible(true));
    }

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-advance
  useEffect(() => {
    if (images.length < 2) return;

    const timer = window.setInterval(() => {
      setActive((current) => {
        setPrevious(current);
        return (current + 1) % images.length;
      });
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [images.length]);

  function goTo(index: number) {
    if (index === active) return;
    setPrevious(active);
    setActive(index);
  }

  if (images.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes heroZoomIn {
          from { transform: scale(1) translate3d(0, 0, 0); }
          to   { transform: scale(1.14) translate3d(-1.5%, -1%, 0); }
        }
        @keyframes heroZoomOut {
          from { transform: scale(1.14) translate3d(1.5%, 1%, 0); }
          to   { transform: scale(1) translate3d(0, 0, 0); }
        }
        .hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1800ms cubic-bezier(0.4, 0, 0.2, 1);
          will-change: opacity;
        }
        .hero-slide.is-active { opacity: 1; z-index: 2; }
        .hero-slide.is-previous { opacity: 0; z-index: 1; }
        .hero-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          will-change: transform;
        }
        .hero-slide.is-active img,
        .hero-slide.is-previous img {
          animation: heroZoomIn ${SLIDE_INTERVAL_MS + 2500}ms ease-out forwards;
        }
        .hero-slide.is-alt.is-active img,
        .hero-slide.is-alt.is-previous img {
          animation-name: heroZoomOut;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-slide img { animation: none !important; }
          .hero-slide { transition-duration: 600ms; }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden bg-slate-950 transition-opacity duration-1000"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className={[
              "hero-slide",
              index % 2 === 1 ? "is-alt" : "",
              index === active ? "is-active" : "",
              index === previous && index !== active ? "is-previous" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="" decoding="async" draggable={false} />
          </div>
        ))}

        {/* Very light shading only - the photo stays fully visible */}
        <div className="absolute inset-x-0 top-0 z-10 h-1/5 bg-gradient-to-b from-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-[65%] bg-gradient-to-t from-black/85 via-black/50 to-transparent" />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Show background ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === active
                  ? "w-8 bg-amber-400"
                  : "w-3 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}