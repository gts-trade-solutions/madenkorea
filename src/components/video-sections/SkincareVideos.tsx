import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Reel = { id: number | string; src: string; poster?: string };

// ====== REELS BY SECTION ======
const reels: Reel[] = [
  { id: 1, src: "/videos/baby/baby-1.mp4", poster: "/videos/v1.jpg" },
  { id: 2, src: "/videos/skincare/skincare-2.mp4", poster: "/videos/v2.jpg" },
  { id: 3, src: "/videos/life/life-2.mp4", poster: "/videos/life/l2.jpg" },
  { id: 4, src: "/videos/skincare/skincare-4.mp4", poster: "/videos/v4.jpg" },
  { id: 5, src: "/videos/baby/baby-4.mp4", poster: "/videos/baby/b4.jpg" },
  { id: 6, src: "/videos/life/life-4.mp4", poster: "/videos/baby/b4.jpg" },
 { id: 7, src: "/videos/life/life-1.mp4", poster: "/videos/life/l1.jpg" },
];

const reels_skinCare: Reel[] = [
  { id: 1, src: "/videos/skincare/skincare-1.mp4", poster: "/videos/v1.jpg" },
  { id: 2, src: "/videos/skincare/skincare-2.mp4", poster: "/videos/v2.jpg" },
  { id: 3, src: "/videos/skincare/skincare-3.mp4", poster: "/videos/v3.jpg" },
  { id: 4, src: "/videos/skincare/skincare-4.mp4", poster: "/videos/v4.jpg" },
  { id: 5, src: "/videos/skincare/skincare-5.mp4", poster: "/videos/v5.jpg" },
  { id: 6, src: "/videos/skincare/skincare-6.mp4", poster: "/videos/v6.jpg" },
];

const reels_baby: Reel[] = [
  { id: "b1", src: "/videos/baby/baby-1.mp4", poster: "/videos/baby/b1.jpg" },
  { id: "b2", src: "/videos/baby/baby-2.mp4", poster: "/videos/baby/b2.jpg" },
  { id: "b3", src: "/videos/baby/baby-3.mp4", poster: "/videos/baby/b3.jpg" },
  { id: "b4", src: "/videos/baby/baby-4.mp4", poster: "/videos/baby/b4.jpg" },
];

const reels_life: Reel[] = [
  { id: "l1", src: "/videos/life/life-1.mp4", poster: "/videos/life/l1.jpg" },
  { id: "l2", src: "/videos/life/life-2.mp4", poster: "/videos/life/l2.jpg" },
  { id: "l3", src: "/videos/life/life-3.mp4", poster: "/videos/life/l3.jpg" },
  { id: "l4", src: "/videos/life/life-4.mp4", poster: "/videos/life/l4.jpg" },
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

const IconBtn: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
> = ({ className, active, ...rest }) => (
  <button
    {...rest}
    className={
      "grid h-9 w-9 place-items-center rounded-full text-white shadow " +
      (active ? "bg-emerald-600/90 hover:bg-emerald-600 " : "bg-black/60 hover:bg-black/70 ") +
      (className ?? "")
    }
  />
);

const MuteButton: React.FC<{ muted: boolean; onToggle: () => void }> = ({
  muted,
  onToggle,
}) => (
  <IconBtn onClick={onToggle} aria-label={muted ? "Unmute" : "Mute"}>
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M5 9v6h4l5 4V5L9 9H5z" />
    </svg>
    {!muted && (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 absolute inset-0 m-auto"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M16.5 8.5a5 5 0 0 1 0 7.07M18.5 6.5a8 8 0 0 1 0 11.31" />
      </svg>
    )}
  </IconBtn>
);

const PlayPauseButton: React.FC<{ playing: boolean; onToggle: () => void }> = ({
  playing,
  onToggle,
}) => (
  <IconBtn onClick={onToggle} aria-label={playing ? "Pause" : "Play"} active={playing}>
    {playing ? (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    )}
  </IconBtn>
);

const ReelCard: React.FC<{ item: Reel; isLandscape: boolean }> = ({
  item,
  isLandscape,
}) => {
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const vidRef = useRef<HTMLVideoElement | null>(null);

  // Force reliable loop (even if ended fires)
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    const onEnded = () => {
      try {
        v.currentTime = 0;
        if (v.dataset.userPaused === "1") return;
        v.play().catch(() => {});
      } catch {}
    };
    v.addEventListener("ended", onEnded);
    return () => v.removeEventListener("ended", onEnded);
  }, []);

  // Reflect native play/pause state
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

  const togglePlayPause = () => {
    const v = vidRef.current;
    if (!v) return;
    if (v.paused) {
      v.dataset.userPaused = "0";
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.dataset.userPaused = "1";
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div
        className="relative w-full bg-black rounded-3xl"
        style={{
          aspectRatio: isLandscape ? "3 / 4" : "9 / 14",
          maxHeight: isLandscape ? "80vh" : "62vh",
        }}
      >
        <video
          ref={vidRef}
          className="absolute inset-0 h-full w-full object-cover rounded-3xl"
          src={item.src}
          poster={item.poster}
          muted={muted}        // needed for autoplay policies
          autoPlay
          loop
          playsInline
          preload="metadata"
          controls={false}
          data-user-paused="0"
        />
        {/* Controls */}
        <div className="absolute left-3 right-3 top-3 z-20 flex items-center justify-between">
          <MuteButton
            muted={muted}
            onToggle={() => {
              const next = !muted;
              setMuted(next);
              if (vidRef.current) vidRef.current.muted = next;
            }}
          />
          <PlayPauseButton playing={playing} onToggle={togglePlayPause} />
        </div>
      </div>
    </div>
  );
};

export default function ReelsStatic() {
  const location = useLocation();
  const swiperRef = useRef<SwiperType | null>(null);
  const isLandscape = useOrientation();

  // path: '/', '/skincare', '/baby', '/life'
  const firstSeg =
    location.pathname.split("?")[0].split("#")[0].split("/").filter(Boolean)[0] || "";
  const pathKey = firstSeg.toLowerCase();
  const selectedReels: Reel[] =
    location.pathname === "/" || pathKey === ""
      ? reels
      : pathKey === "skincare"
      ? reels_skinCare
      : pathKey === "baby"
      ? reels_baby
      : pathKey === "life" || pathKey === "life-and-home" || pathKey === "life&home"
      ? reels_life
      : reels;

  // custom nav button refs
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  /** Autoplay ALL videos (don’t pause others). Respects user-paused flag. */
  const playAllVideos = (s?: SwiperType | null) => {
    if (!s) return;
    const videos = Array.from(s.el?.querySelectorAll("video") || []) as HTMLVideoElement[];
    videos.forEach((v) => {
      v.loop = true;
      if (v.dataset.userPaused !== "1") {
        v.play().catch(() => {});
      }
    });
  };

  // Pause all when page hidden, resume all when visible (except user-paused)
  useEffect(() => {
    const onVis = () => {
      const s = swiperRef.current;
      if (!s) return;
      const videos = Array.from(s.el?.querySelectorAll("video") || []) as HTMLVideoElement[];
      if (document.hidden) {
        videos.forEach((v) => v.pause());
      } else {
        playAllVideos(s);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const loopEnabled = selectedReels.length > 1;

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
            <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <button
          ref={nextRef}
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-40 h-10 w-10 items-center justify-center rounded-full bg-white/90 hover:bg-white shadow"
          aria-label="Next"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>

        <Swiper
          key={`${isLandscape ? "landscape" : "portrait"}-${pathKey || "home"}`}
          modules={[Navigation, Pagination, Autoplay]}
          onInit={(s) => {
            swiperRef.current = s;
            if (s.params.navigation && typeof s.params.navigation !== "boolean") {
              s.params.navigation.prevEl = prevRef.current!;
              s.params.navigation.nextEl = nextRef.current!;
            }
            s.navigation.init();
            s.navigation.update();
            playAllVideos(s);   // <-- autoplay ALL on init
          }}
          onSlideChange={(s) => playAllVideos(s)} // <-- keep all playing
          onResize={(s) => {
            if (s.params.navigation && typeof s.params.navigation !== "boolean") {
              s.params.navigation.prevEl = prevRef.current!;
              s.params.navigation.nextEl = nextRef.current!;
            }
            s.navigation.update();
            playAllVideos(s);  // <-- ensure new slides autoplay
          }}
          loop={loopEnabled}
          loopAdditionalSlides={selectedReels.length}
          rewind={!loopEnabled}
          speed={1000}
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
          navigation={{
            enabled: true,
            prevEl: prevRef.current!,
            nextEl: nextRef.current!,
          }}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
            stopOnLastSlide: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 14,
              autoplay: { enabled: false as any },
            },
            1024: { slidesPerView: 4, spaceBetween: 20 },
            1280: { slidesPerView: 6, spaceBetween: 22 },
            1536: { slidesPerView: 6, spaceBetween: 24 },
          }}
        >
          {selectedReels.map((item) => (
            <SwiperSlide key={item.id} className="!h-auto">
              <ReelCard item={item} isLandscape={isLandscape} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
