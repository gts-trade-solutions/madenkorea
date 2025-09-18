// pages/ReelsStatic.tsx  (a.k.a. SnapReelsVideoOnly.tsx)
import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Reel = {
  id: number | string;
  src: string;      // e.g. "/videos/1.mp4"
  poster?: string;  // e.g. "/videos/v1.jpg"
};

const reels: Reel[] = [
  { id: 1, src: "/videos/1.mp4", poster: "/videos/v1.jpg" },
  { id: 2, src: "/videos/2.mp4", poster: "/videos/v2.jpg" },
  { id: 3, src: "/videos/3.mp4", poster: "/videos/v3.jpg" },
  { id: 4, src: "/videos/4.mp4", poster: "/videos/v4.jpg" },
  { id: 5, src: "/videos/5.mp4", poster: "/videos/v5.jpg" },
];

const MuteButton: React.FC<{ muted: boolean; onToggle: () => void }> = ({ muted, onToggle }) => (
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
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M5 9v6h4l5 4V5L9 9H5z" />
        <path d="M16.5 8.5a5 5 0 010 7.07M18.5 6.5a8 8 0 010 11.31" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    )}
  </button>
);

const ReelCard: React.FC<{ item: Reel }> = ({ item }) => {
  const [muted, setMuted] = useState(true);
  const vidRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      {/* Portrait 9:16 */}
      <div className="relative w-full aspect-[9/16] bg-black">
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

export default function MakeupVideo() {
  const swiperRef = useRef<SwiperType | null>(null);

  // Pause videos on non-active slides (battery-friendly on phones)
  const handleSlideChange = () => {
    const s = swiperRef.current;
    if (!s) return;
    s.slides.forEach((slide, idx) => {
      const video = slide.querySelector("video") as HTMLVideoElement | null;
      if (!video) return;
      if (idx === s.activeIndex) {
        video.play().catch(() => {});
      } else {
        video.pause();
        try { video.currentTime = 0; } catch {}
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="mb-6">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Skincare Makeup Products</h2>
      </header>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        onSwiper={(s) => {
          swiperRef.current = s;
          setTimeout(handleSlideChange, 0);
        }}
        onSlideChange={handleSlideChange}
        loop
        speed={600}
        // Mobile-first defaults
        slidesPerView={1.05}
        spaceBetween={12}
        centeredSlides={false}
        slidesOffsetBefore={16}  // aligns with container px-4
        slidesOffsetAfter={16}
        pagination={{ clickable: true }}
        navigation={{ enabled: true }} // disabled on mobile via breakpoints
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
          stopOnLastSlide: false,
        }}
        className="!overflow-visible"
        breakpoints={{
          // <640px: autoplay ON, arrows OFF, slight peek of next card
          0: {
            slidesPerView: 1.05,
            spaceBetween: 12,
            centeredSlides: false,
            slidesOffsetBefore: 16,
            slidesOffsetAfter: 16,
            navigation: { enabled: false },
            autoplay: { enabled: true },
          },
          // ≥640px: autoplay OFF, arrows ON, standard spacing
          640: {
            slidesPerView: 2.1,
            spaceBetween: 16,
            slidesOffsetBefore: 0,
            slidesOffsetAfter: 0,
            navigation: { enabled: true },
            autoplay: { enabled: false },
          },
          768: { slidesPerView: 2.6, spaceBetween: 20 },
          1024: { slidesPerView: 3.2, spaceBetween: 22 },
          1280: { slidesPerView: 4, spaceBetween: 24 },
          1536: { slidesPerView: 5, spaceBetween: 24 },
        }}
      >
        {reels.map((item) => (
          <SwiperSlide key={item.id} className="!h-auto">
            <ReelCard item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
