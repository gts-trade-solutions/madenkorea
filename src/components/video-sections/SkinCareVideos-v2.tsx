// pages/ReelsStatic.tsx
import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";

type Reel = {
  id: number | string;
  src: string;       // e.g. "/videos/skincare-1.mp4"
  poster?: string;   // e.g. "/videos/skincare-1.jpg"
};

// ---------- 5 reels for each page ----------
const REELS_BY_CATEGORY: Record<string, Reel[]> = {
  // keys are normalized (lowercase, no spaces/symbols)
  skincare: [
      { id: "sk-1", src: "/videos/skincare-1.mp4", poster: "/videos/skincare-1.jpg" },
      { id: "sk-2", src: "/videos/skincare-2.mp4", poster: "/videos/skincare-2.jpg" },
      { id: "sk-3", src: "/videos/skincare-3.mp4", poster: "/videos/skincare-3.jpg" },
      { id: "sk-4", src: "/videos/skincare-4.mp4", poster: "/videos/skincare-4.jpg" },
      { id: "sk-5", src: "/videos/skincare-5.mp4", poster: "/videos/skincare-5.jpg" },
  ],
  home: [
      { id: "hm-1", src: "/videos/home-1.mp4", poster: "/videos/home-1.jpg" },
      { id: "hm-2", src: "/videos/home-2.mp4", poster: "/videos/home-2.jpg" },
      { id: "hm-3", src: "/videos/home-3.mp4", poster: "/videos/home-3.jpg" },
      { id: "hm-4", src: "/videos/home-4.mp4", poster: "/videos/home-4.jpg" },
      { id: "hm-5", src: "/videos/home-5.mp4", poster: "/videos/home-5.jpg" },
  ],
  lifestyle: [
      { id: "ls-1", src: "/videos/lifestyle-1.mp4", poster: "/videos/lifestyle-1.jpg" },
      { id: "ls-2", src: "/videos/lifestyle-2.mp4", poster: "/videos/lifestyle-2.jpg" },
      { id: "ls-3", src: "/videos/lifestyle-3.mp4", poster: "/videos/lifestyle-3.jpg" },
      { id: "ls-4", src: "/videos/lifestyle-4.mp4", poster: "/videos/lifestyle-4.jpg" },
      { id: "ls-5", src: "/videos/lifestyle-5.mp4", poster: "/videos/lifestyle-5.jpg" },
  ],
  babycare: [
      { id: "bb-1", src: "/videos/baby-1.mp4", poster: "/videos/baby-1.jpg" },
      { id: "bb-2", src: "/videos/baby-2.mp4", poster: "/videos/baby-2.jpg" },
      { id: "bb-3", src: "/videos/baby-3.mp4", poster: "/videos/baby-3.jpg" },
      { id: "bb-4", src: "/videos/baby-4.mp4", poster: "/videos/baby-4.jpg" },
      { id: "bb-5", src: "/videos/baby-5.mp4", poster: "/videos/baby-5.jpg" },
  ],
};

// Accepts: "skincare", "home", "lifestyle", "baby care" (also tolerant of “skin care”, “baby” etc.)
const norm = (s?: string) => (s || "")
  .toLowerCase()
  .replace(/&/g, "and")
  .replace(/\s+/g, "")
  .replace(/[^a-z0-9]/g, "");

const getReelsFor = (pageName?: string): Reel[] => {
  const key = norm(pageName);
  if (REELS_BY_CATEGORY[key]) return REELS_BY_CATEGORY[key];

  // smart fallbacks for common variants
  if (["skincare", "skincar", "skinc"].includes(key)) return REELS_BY_CATEGORY.skincare;
  if (["baby", "babycare"].includes(key)) return REELS_BY_CATEGORY.babycare;
  if (["lifehome", "lifeandhome"].includes(key)) return REELS_BY_CATEGORY.home;

  return REELS_BY_CATEGORY.skincare; // default
};

// ===== Buttons =====
const IconButton = ({
  className,
  ariaLabel,
  children,
  onClick,
}: {
  className?: string;
  ariaLabel: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={[
      "rounded-full bg-black/60 p-3 sm:p-2 text-white hover:bg-black/70",
      "backdrop-blur-sm ring-1 ring-white/10 shadow-md",
      "active:scale-95 transition-transform",
      className || "",
    ].join(" ")}
  >
    {children}
  </button>
);

const MuteButton: React.FC<{ muted: boolean; onToggle: () => void }> = ({ muted, onToggle }) => (
  <IconButton ariaLabel={muted ? "Unmute" : "Mute"}>
    <span onClick={onToggle} className="relative block">
      {muted ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-5 sm:w-5" fill="currentColor">
          <path d="M5 9v6h4l5 4V5L9 9H5z" />
        </svg>
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-5 sm:w-5" fill="currentColor">
            <path d="M5 9v6h4l5 4V5L9 9H5z" />
          </svg>
          <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-5 sm:w-5 absolute inset-0 m-auto" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16.5 8.5a5 5 0 0 1 0 7.07M18.5 6.5a8 8 0 0 1 0 11.31" />
          </svg>
        </>
      )}
    </span>
  </IconButton>
);

const PlayPauseButton: React.FC<{ playing: boolean; onToggle: () => void }> = ({ playing, onToggle }) => (
  <IconButton ariaLabel={playing ? "Pause video" : "Play video"}>
    <span onClick={onToggle}>
      {playing ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-5 sm:w-5" fill="currentColor">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-5 sm:w-5" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </span>
  </IconButton>
);

// ===== Card =====
const ReelCard: React.FC<{
  item: Reel;
  pauseOthers: (target?: HTMLVideoElement | null) => void;
}> = ({ item, pauseOthers }) => {
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const vidRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  const handleEnded = () => {
    const v = vidRef.current;
    if (!v) return;
    try {
      v.currentTime = 0;
      v.play().catch(() => {});
    } catch {}
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="relative w-full aspect-[9/16] bg-black">
        <video
          ref={vidRef}
          className="absolute inset-0 h-full w-full object-cover rounded-3xl"
          src={item.src}
          poster={item.poster}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          controls={false}
          onEnded={handleEnded}
        />
        <div className="absolute right-2 sm:right-3 top-2 sm:top-3 z-20 flex items-center gap-2">
          <PlayPauseButton
            playing={playing}
            onToggle={() => {
              const v = vidRef.current;
              if (!v) return;
              if (playing) v.pause();
              else {
                pauseOthers(v);
                v.play().catch(() => {});
              }
            }}
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
    </div>
  );
};

// ===== Page =====
export default function ReelsStaticCategory({ pageName }: { pageName?: string }) {
  const swiperRef = useRef<SwiperType | null>(null);
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  const reels = getReelsFor(pageName);

  // Pause everything (or everything except a target)
  const pauseAllExcept = (target?: HTMLVideoElement | null) => {
    const container = swiperRef.current?.el as HTMLElement | undefined;
    const videos = container?.querySelectorAll("video");
    videos?.forEach((v) => {
      if (v !== target) {
        v.pause();
        try { v.currentTime = 0; } catch {}
      }
    });
  };
  const handleSlideChange = () => pauseAllExcept(undefined);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
      <header className="mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
          {pageName ? pageName : "Reels"}
        </h2>
      </header>

      <div className="relative">
        <Swiper
          modules={[Navigation]}
          onBeforeInit={(s) => {
            // @ts-ignore
            s.params.navigation = { prevEl: prevRef.current, nextEl: nextRef.current };
          }}
          onSwiper={(s) => {
            swiperRef.current = s;
            setTimeout(() => {
              // @ts-ignore
              s.params.navigation.prevEl = prevRef.current;
              // @ts-ignore
              s.params.navigation.nextEl = nextRef.current;
              s.navigation.init();
              s.navigation.update();
            }, 0);
          }}
          onSlideChange={handleSlideChange}
          loop
          speed={600}
          slidesPerView={1}
          spaceBetween={8}
          centeredSlides={false}
          slidesOffsetBefore={0}
          slidesOffsetAfter={0}
          navigation
          className="overflow-hidden md:overflow-visible"
          breakpoints={{
            0:   { slidesPerView: 1, spaceBetween: 8,  slidesOffsetBefore: 0, slidesOffsetAfter: 0, navigation: { enabled: false } },
            768: { slidesPerView: 2, spaceBetween: 16, slidesOffsetBefore: 0, slidesOffsetAfter: 0, navigation: { enabled: true } },
            1024:{ slidesPerView: 3, spaceBetween: 20 },
            1280:{ slidesPerView: 4, spaceBetween: 24 },
            1536:{ slidesPerView: 5, spaceBetween: 24 },
          }}
        >
          {reels.map((item) => (
            <SwiperSlide key={item.id} className="!h-auto">
              <ReelCard item={item} pauseOthers={pauseAllExcept} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons (hidden on phones) */}
        <button
          ref={prevRef}
          aria-label="Previous"
          className={[
            "hidden sm:flex items-center justify-center",
            "absolute left-2 top-1/2 -translate-y-1/2 z-30",
            "h-10 w-10 md:h-11 md:w-11 lg:h-12 lg:w-12",
            "rounded-full bg-white/85 hover:bg-white shadow-lg ring-1 ring-black/5",
            "backdrop-blur supports-[backdrop-filter]:backdrop-blur-md",
          ].join(" ")}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 md:h-7 md:w-7" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          ref={nextRef}
          aria-label="Next"
          className={[
            "hidden sm:flex items-center justify-center",
            "absolute right-2 top-1/2 -translate-y-1/2 z-30",
            "h-10 w-10 md:h-11 md:w-11 lg:h-12 lg:w-12",
            "rounded-full bg-white/85 hover:bg-white shadow-lg ring-1 ring-black/5",
            "backdrop-blur supports-[backdrop-filter]:backdrop-blur-md",
          ].join(" ")}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 md:h-7 md:w-7" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
