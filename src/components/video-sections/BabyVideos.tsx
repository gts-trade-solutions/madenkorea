// pages/ReelsStatic.tsx
import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Reel = { id: number | string; src: string; poster?: string };

const reels: Reel[] = [
  { id: 1, src: "/videos/1.mp4", poster: "/videos/v1.jpg" },
  { id: 2, src: "/videos/2.mp4", poster: "/videos/v2.jpg" },
  { id: 3, src: "/videos/3.mp4", poster: "/videos/v3.jpg" },
  { id: 4, src: "/videos/4.mp4", poster: "/videos/v4.jpg" },
  { id: 5, src: "/videos/5.mp4", poster: "/videos/v5.jpg" },
];

/** Orientation helper (landscape if width > height) */
const useOrientation = () => {
  const get = () =>
    typeof window !== "undefined" && window.innerWidth > window.innerHeight;
  const [landscape, setLandscape] = useState<boolean>(get());
  useEffect(() => {
    const onResize = () => setLandscape(get());
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);
  return landscape;
};

const MuteButton: React.FC<{ muted: boolean; onToggle: () => void }> = ({
  muted,
  onToggle,
}) => (
  <button
    onClick={onToggle}
    className="absolute right-3 top-3 z-20 rounded-full bg-black/60 p-2 text-white hover:bg-black/70"
    aria-label={muted ? "Unmute" : "Mute"}
  >
    {muted ? (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M5 9v6h4l5 4V5L9 9H5z" />
      </svg>
    ) : (
      <>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M5 9v6h4l5 4V5L9 9H5z" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 absolute inset-0 m-auto"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M16.5 8.5a5 5 0 0 1 0 7.07M18.5 6.5a8 8 0 0 1 0 11.31" />
        </svg>
      </>
    )}
  </button>
);

const ReelCard: React.FC<{ item: Reel; isLandscape: boolean }> = ({
  item,
  isLandscape,
}) => {
  const [muted, setMuted] = useState(true);
  const vidRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      {/* Portrait by default; 3:4 in landscape. Use native CSS aspect-ratio. */}
      <div
        className="relative w-full bg-black rounded-3xl"
        style={{
          aspectRatio: isLandscape ? "3 / 4" : "9 / 16",
          maxHeight: isLandscape ? "80vh" : "68vh",
        }}
      >
        <video
          ref={vidRef}
          className="absolute inset-0 h-full w-full object-cover rounded-3xl"
          src={item.src}
          poster={item.poster}
          muted={muted}
          autoPlay
          loop
          playsInline
          preload="metadata"
          controls={false}
        />
        <MuteButton
          muted={muted}
          onToggle={() => {
            const next = !muted;
            setMuted(next);
            if (vidRef.current) vidRef.current.muted = next;
          }}
        />
      </div>
    </div>
  );
};

export default function ReelsStatic() {
  const swiperRef = useRef<SwiperType | null>(null);
  const isLandscape = useOrientation();

  // custom nav button refs
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  /** Safe video play/pause handler (works even if s.slides is undefined) */
  const syncVideos = (s?: SwiperType | null) => {
    if (!s) return;
    const active = s.activeIndex ?? 0;

    const slidesList: Element[] =
      (s as any).slides && (s as any).slides.length
        ? Array.from((s as any).slides as any)
        : Array.from(s.el?.querySelectorAll(".swiper-slide") || []);

    if (!slidesList.length) return;

    slidesList.forEach((slide, idx) => {
      const video = slide.querySelector("video") as HTMLVideoElement | null;
      if (!video) return;
      if (idx === active) {
        video.play().catch(() => {});
      } else {
        video.pause();
        try {
          video.currentTime = 0;
        } catch {}
      }
    });
  };

  return (
    <div className="container mx-auto px-2 py-2">
      <header className="mb-4">
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
          Authentic Skincare Korean Products
        </h2>
      </header>

      <div className="relative">
        {/* Custom nav buttons (hidden on mobile) */}
        <button
          ref={prevRef}
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-40 h-10 w-10 items-center justify-center rounded-full bg-white/90 hover:bg-white shadow"
          aria-label="Previous"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M15 6l-6 6 6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
        <button
          ref={nextRef}
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-40 h-10 w-10 items-center justify-center rounded-full bg-white/90 hover:bg-white shadow"
          aria-label="Next"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M9 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>

        <Swiper
          key={isLandscape ? "landscape" : "portrait"} // re-init on orientation flip
          modules={[Navigation, Pagination, Autoplay]}
          onInit={(s) => {
            swiperRef.current = s;

            // wire custom nav buttons
            if (
              s.params.navigation &&
              typeof s.params.navigation !== "boolean"
            ) {
              s.params.navigation.prevEl = prevRef.current!;
              s.params.navigation.nextEl = nextRef.current!;
            }
            s.navigation.init();
            s.navigation.update();

            syncVideos(s);
          }}
          onSlideChange={(s) => syncVideos(s)}
          onResize={(s) => {
            // keep nav wired after responsive changes
            if (
              s.params.navigation &&
              typeof s.params.navigation !== "boolean"
            ) {
              s.params.navigation.prevEl = prevRef.current!;
              s.params.navigation.nextEl = nextRef.current!;
            }
            s.navigation.update();
            syncVideos(s);
          }}
          loop
          loopAdditionalSlides={6} // ✅ keeps loop smooth even near breakpoints
          speed={600}
          watchOverflow={false}
          slidesPerView={1}
          spaceBetween={8}
          centeredSlides={false}
          className="w-full !overflow-hidden"
          observer
          observeParents
          observeSlideChildren
          updateOnWindowResize
          breakpointsBase="window"
          pagination={{ clickable: true }}
          // base: no arrows on mobile; we use custom buttons from sm:+
          navigation={{
            enabled: true,
            prevEl: prevRef.current!,
            nextEl: nextRef.current!,
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
            stopOnLastSlide: false,
          }}
          // ✅ 1 / 2 / 4 layout
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 14,
              autoplay: { enabled: false as any },
            },
            1024: { slidesPerView: 4, spaceBetween: 20 },
            1280: { slidesPerView: 4, spaceBetween: 22 },
            1536: { slidesPerView: 4, spaceBetween: 24 },
          }}
        >
          {reels.map((item) => (
            <SwiperSlide key={item.id} className="!h-auto">
              <ReelCard item={item} isLandscape={isLandscape} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
