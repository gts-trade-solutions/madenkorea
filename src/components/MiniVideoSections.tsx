// import { useEffect, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { AutoScrollVideo } from "./video-sections/AutoScrollVideo";
// import { SplitBanner } from "./video-sections/SplitBanner";

// interface VideoData {
//   id: string;
//   title: string;
//   description?: string;
//   video_url: string;
//   thumbnail_url?: string;
//   video_type: string;
//   tags?: string[];
//   position?: number;
// }

// export const MiniVideoSections = () => {
//   const [tutorialVideo, setTutorialVideo] = useState<VideoData | null>(null);
//   const [testimonialVideo, setTestimonialVideo] = useState<VideoData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchVideosFromCMS();
//   }, []);

//   const fetchVideosFromCMS = async () => {
//     try {
//       const { data: videos, error } = await supabase
//         .from('videos')
//         .select('*')
//         .eq('is_active', true)
//         .order('position');

//       if (error) {
//         console.error('Error fetching videos:', error);
//         return;
//       }

//       // Categorize videos by type - exclude hero videos from this section
//       const tutorial = videos.find(video => video.video_type === 'tutorial');
//       const testimonial = videos.find(video => video.video_type === 'testimonial');

//       setTutorialVideo(tutorial || null);
//       setTestimonialVideo(testimonial || null);

//     } catch (error) {
//       console.error('Error fetching videos:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper function to convert YouTube URL to embed format
//   const convertYouTubeUrl = (url: string) => {
//     if (!url) return url;

//     // Convert YouTube watch URL to embed URL
//     const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
//     if (youtubeMatch) {
//       return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${youtubeMatch[1]}`;
//     }

//     return url;
//   };

//   if (loading) {
//     return (
//       <div className="space-y-20 py-16">
//         <div className="container mx-auto px-4">
//           <div className="h-64 bg-muted rounded-lg animate-pulse" />
//         </div>
//       </div>
//     );
//   }
//   return (
//     <div className="space-y-20 py-16">
//       {/* Tutorial Video */}
//       {tutorialVideo && (
//         <section className="container mx-auto px-4">
//           <AutoScrollVideo
//             videoUrl={convertYouTubeUrl(tutorialVideo.video_url)}
//             posterImage={tutorialVideo.thumbnail_url || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200"}
//             title={tutorialVideo.title}
//             description={tutorialVideo.description || "Learn the secrets of Korean skincare routines and techniques."}
//             ctaText="Watch Tutorial"
//             ctaLink="/products"
//           />
//         </section>
//       )}

//       {/* Testimonial Video */}
//       {testimonialVideo && (
//         <section className="container mx-auto px-4">
//           <SplitBanner
//             videoUrl={convertYouTubeUrl(testimonialVideo.video_url)}
//             posterImage={testimonialVideo.thumbnail_url || "https://images.unsplash.com/photo-1556228578-dd1e4b0d6ba1?q=80&w=1200"}
//             title={testimonialVideo.title}
//             subtitle="Real Results from Real Customers"
//             description={testimonialVideo.description || "Hear from our satisfied customers about their amazing skin transformation journey with our Korean beauty products."}
//             ctaText="Shop Now"
//             ctaSecondaryText="Read Reviews"
//             ctaLink="/products"
//             layout="right"
//           />
//         </section>
//       )}
//     </div>
//   );
// };

import React from "react";
import { useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  Keyboard,
  A11y,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

/* ========= Types ========= */
interface VideoData {
  id: string;
  title: string;
  video_url: string;
  video_type?: "influencer";
  brand: string;
  creatorName: string;
  creatorGender: "female";
  position?: number;
}

/* ========= Data (HOME) ========= */
const HOME_VIDEOS: VideoData[] = [
  {
    id: "boj-1",
    title: "BOJ — Makgeolli Philosophy",
    video_url:
      "https://www.instagram.com/beautyofjoseon_official/reel/C7MP5n9M1pU/",
    brand: "Beauty of Joseon",
    creatorName: "BOJ Official",
    creatorGender: "female",
    position: 1,
  },
  {
    id: "boj-2",
    title: "BOJ — Full Routine",
    video_url: "https://www.instagram.com/reel/DNkR3LNNBlm/",
    brand: "Beauty of Joseon",
    creatorName: "BOJ Official",
    creatorGender: "female",
    position: 2,
  },
  {
    id: "anua-2",
    title: "Anua — 5 Must-Have Items",
    video_url: "https://www.instagram.com/reel/DFwIwHGSl9U/",
    brand: "Anua",
    creatorName: "Anua Global",
    creatorGender: "female",
    position: 5,
  },
  {
    id: "anua-3",
    title: "Anua — Restock Notice",
    video_url: "https://www.instagram.com/anua_global/reel/DL0UkKNSkc5/",
    brand: "Anua",
    creatorName: "Anua Global",
    creatorGender: "female",
    position: 6,
  },
  {
    id: "cosrx-1",
    title: "COSRX — Sun Stick + Masks",
    video_url: "https://www.instagram.com/cosrx/reel/DJtNbEFKX07/",
    brand: "COSRX",
    creatorName: "COSRX Official",
    creatorGender: "female",
    position: 7,
  },
  {
    id: "cosrx-3",
    title: "COSRX — Double Cleanse",
    video_url: "https://www.instagram.com/reel/DLjcGJ_uIKN/",
    brand: "COSRX",
    creatorName: "COSRX Official",
    creatorGender: "female",
    position: 9,
  },
  {
    id: "etude-1",
    title: "Etude — Jelly Pang (RIIZE)",
    video_url:
      "https://www.instagram.com/etudeofficial.global/reel/C9bGVl2SVW6/",
    brand: "Etude",
    creatorName: "ETUDE Global",
    creatorGender: "female",
    position: 10,
  },
  {
    id: "etude-2",
    title: "Etude — Makeup Multi Sealer",
    video_url: "https://www.instagram.com/reel/C-mXxmUM4bb/",
    brand: "Etude",
    creatorName: "ETUDE Global",
    creatorGender: "female",
    position: 11,
  },
  {
    id: "etude-3",
    title: "Etude — SPF Stick Cute!",
    video_url: "https://www.instagram.com/reel/C5SR-raB-31/",
    brand: "Etude",
    creatorName: "ETUDE Global",
    creatorGender: "female",
    position: 12,
  },
  {
    id: "extra-13",
    title: "Reel — DMxdJFbSpOm",
    video_url: "https://www.instagram.com/reel/DMxdJFbSpOm/",
    brand: "Various",
    creatorName: "Unknown",
    creatorGender: "female",
    position: 13,
  },
  {
    id: "extra-14",
    title: "Reel — DNAzQhpy3hS",
    video_url: "https://www.instagram.com/reel/DNAzQhpy3hS/",
    brand: "Various",
    creatorName: "Unknown",
    creatorGender: "female",
    position: 14,
  },
  {
    id: "extra-15",
    title: "Reel — DNLGLjHyVk2",
    video_url: "https://www.instagram.com/reel/DNLGLjHyVk2/",
    brand: "Various",
    creatorName: "Unknown",
    creatorGender: "female",
    position: 15,
  },
  {
    id: "extra-16",
    title: "Reel — DNk8SDhyTXo",
    video_url: "https://www.instagram.com/reel/DNk8SDhyTXo/",
    brand: "Various",
    creatorName: "Unknown",
    creatorGender: "female",
    position: 16,
  },
  {
    id: "extra-17",
    title: "Reel — DN1n3qqZlTx",
    video_url: "https://www.instagram.com/reel/DN1n3qqZlTx/",
    brand: "Various",
    creatorName: "Unknown",
    creatorGender: "female",
    position: 17,
  },
];

/* ========= Data (BABY) ========= */
const BABY_VIDEOS: VideoData[] = [
  {
    id: "baby-1",
    title: "Gentle Skincare for Newborns",
    video_url: "https://www.instagram.com/reel/DNPiTerSxXN/",
    brand: "Various",
    creatorName: "Creator A",
    creatorGender: "female",
    position: 1,
  },
  {
    id: "baby-2",
    title: "K-Baby Bath Routine",
    video_url: "https://www.instagram.com/reel/DK1PWLlsokv/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    brand: "Various",
    creatorName: "Creator B",
    creatorGender: "female",
    position: 2,
  },
  {
    id: "baby-3",
    title: "Sun Care for Toddlers",
    video_url: "https://www.instagram.com/reel/DJ_-0FNyCb5/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    brand: "Various",
    creatorName: "Creator C",
    creatorGender: "female",
    position: 3,
  },
  {
    id: "baby-4",
    title: "Soothing Bedtime Balm",
    video_url: "https://www.instagram.com/reel/DBrhHw7y8HF/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    brand: "Various",
    creatorName: "Creator D",
    creatorGender: "female",
    position: 4,
  },
  {
    id: "baby-5",
    title: "Diaper Rash Care Tips",
    video_url: "https://www.instagram.com/reel/DKrUq8MsxHc/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    brand: "Various",
    creatorName: "Creator E",
    creatorGender: "female",
    position: 5,
  },
   {
    id: "baby-6",
    title: "Diaper Rash Care Tips",
    video_url: "https://www.instagram.com/reel/DIwKOTQMm_4/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    brand: "Various",
    creatorName: "Creator E",
    creatorGender: "female",
    position: 6,
  },
   {
    id: "baby-7",
    title: "Diaper Rash Care Tips",
    video_url: "https://www.instagram.com/reel/DIB2_VQM0jJ/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    brand: "Various",
    creatorName: "Creator E",
    creatorGender: "female",
    position: 7,
  },
   
];

/* ========= Data (LIFE & HOME) ========= */
const LIFE_VIDEOS: VideoData[] = [
  {
    id: "life-1",
    title: "Minimal Home Shelf Restock",
    video_url: "https://www.instagram.com/reel/CgQL9Q1qpEZ",
    brand: "Various",
    creatorName: "Creator F",
    creatorGender: "female",
    position: 1,
  },

  {
    id: "life-3",
    title: "Laundry Hacks, Fabric Care",
    video_url: "https://www.instagram.com/reel/DNkwSIATKE7",
    brand: "Various",
    creatorName: "Creator H",
    creatorGender: "female",
    position: 3,
  },

  {
    id: "life-10",
    title: "Home Fragrance Mood",
    video_url: "https://www.instagram.com/reel/C8wMhjfPvWF",
    brand: "Various",
    creatorName: "Creator J",
    creatorGender: "female",
    position: 10,
  },
  {
    id: "life-11",
    title: "Home Fragrance Mood",
    video_url: "https://www.instagram.com/reel/C5DVMcXu05i",
    brand: "Various",
    creatorName: "Creator J",
    creatorGender: "female",
    position: 11,
  },
  {
    id: "life-12",
    title: "Home Fragrance Mood",
    video_url: "https://www.instagram.com/reel/DA4YXAmopQq",
    brand: "Various",
    creatorName: "Creator J",
    creatorGender: "female",
    position: 12,
  },

  {
    id: "life-15",
    title: "Home Fragrance Mood",
    video_url: "https://www.instagram.com/reel/DNKYZtBvWW0",
    brand: "Various",
    creatorName: "Creator J",
    creatorGender: "female",
    position: 15,
  },
  {
    id: "life-16",
    title: "Home Fragrance Mood",
    video_url: "https://www.instagram.com/reel/DMNIr1uxzSI",
    brand: "Various",
    creatorName: "Creator J",
    creatorGender: "female",
    position: 16,
  },

  {
    id: "life-18",
    title: "Home Fragrance Mood",
    video_url: "https://www.instagram.com/reel/DNayMXIBgx_",
    brand: "Various",
    creatorName: "Creator J",
    creatorGender: "female",
    position: 18,
  },

  {
    id: "life-20",
    title: "Home Fragrance Mood",
    video_url: "https://www.instagram.com/reel/DMCmaOry_o-",
    brand: "Various",
    creatorName: "Creator J",
    creatorGender: "female",
    position: 20,
  },

  {
    id: "life-23",
    title: "Home Fragrance Mood",
    video_url: "https://www.instagram.com/reel/DMH81jhyga8",
    brand: "Various",
    creatorName: "Creator J",
    creatorGender: "female",
    position: 23,
  },
];

/* ========= Data (SKINCARE) ========= */
const SKINCARE_VIDEOS: VideoData[] = [
  {
    id: "skin-2",
    title: "SPF Basics — Stick vs Cream",
    video_url: "https://www.instagram.com/reel/C8IZsSIygco",
    brand: "Various",
    creatorName: "Skincare B",
    creatorGender: "female",
    position: 2,
  },
  {
    id: "skin-3",
    title: "Double Cleansing 101",
    video_url: "https://www.instagram.com/reel/DLULLUpRXY2",
    brand: "Various",
    creatorName: "Skincare C",
    creatorGender: "female",
    position: 3,
  },

  {
    id: "skin-5",
    title: "Night Routine — Retinol Care",
    video_url: "https://www.instagram.com/reel/DCW-_-xyJCz",
    brand: "Various",
    creatorName: "Skincare E",
    creatorGender: "female",
    position: 5,
  },
  {
    id: "skin-5",
    title: "Night Routine — Retinol Care",
    video_url: "https://www.instagram.com/reel/DDmbC_KB70Q",
    brand: "Various",
    creatorName: "Skincare E",
    creatorGender: "female",
    position: 5,
  },
  {
    id: "skin-5",
    title: "Night Routine — Retinol Care",
    video_url: "https://www.instagram.com/reel/DHZcaE-uETV",
    brand: "Various",
    creatorName: "Skincare E",
    creatorGender: "female",
    position: 5,
  },
  {
    id: "skin-5",
    title: "Night Routine — Retinol Care",
    video_url: "https://www.instagram.com/reel/Csq-0sZMc3I",
    brand: "Various",
    creatorName: "Skincare E",
    creatorGender: "female",
    position: 5,
  },
  {
    id: "skin-5",
    title: "Night Routine — Retinol Care",
    video_url: "https://www.instagram.com/reel/DI-8zMeiG5y",
    brand: "Various",
    creatorName: "Skincare E",
    creatorGender: "female",
    position: 5,
  },
  {
    id: "skin-5",
    title: "Night Routine — Retinol Care",
    video_url: "https://www.instagram.com/reel/C4egZpxAF2B",
    brand: "Various",
    creatorName: "Skincare E",
    creatorGender: "female",
    position: 5,
  },

  {
    id: "skin-5",
    title: "Night Routine — Retinol Care",
    video_url: "https://www.instagram.com/reel/C7RxNA2vzYN",
    brand: "Various",
    creatorName: "Skincare E",
    creatorGender: "female",
    position: 5,
  },

  {
    id: "skin-5",
    title: "Night Routine — Retinol Care",
    video_url: "https://www.instagram.com/reel/DIydSgoIAdj",
    brand: "Various",
    creatorName: "Skincare E",
    creatorGender: "female",
    position: 5,
  },
  {
    id: "skin-5",
    title: "Night Routine — Retinol Care",
    video_url: "https://www.instagram.com/reel/DH1FSqEIN4h",
    brand: "Various",
    creatorName: "Skincare E",
    creatorGender: "female",
    position: 5,
  },
  {
    id: "skin-5",
    title: "Night Routine — Retinol Care",
    video_url: "https://www.instagram.com/reel/DMw_Kd7ucwT",
    brand: "Various",
    creatorName: "Skincare E",
    creatorGender: "female",
    position: 5,
  },
];

/* ========= Helpers ========= */
const toInstagramEmbed = (url: string) => {
  const m = url.match(
    /(?:instagram\.com|instagr\.am)\/(?:[^/]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9._-]+)/i
  );
  if (!m) return null;
  const kind = m[1].toLowerCase() === "reels" ? "reel" : m[1].toLowerCase();
  const code = m[2].replace(/\/.*/, "");
  // Hint params for autoplay/mute; IG generally auto-plays muted when visible.
  return `https://www.instagram.com/${kind}/${code}/embed?utm_source=ig_embed&autoplay=1&mute=1`;
};

/* ========= Clean, cropped embed + CTA ========= */
const InstaEmbed: React.FC<{
  url: string;
  active?: boolean;
  scale?: number;
  shiftY?: number;
  ctaLabel?: string;
}> = ({
  url,
  active,
  scale = 1.68, // zoom to crop footer/edges
  shiftY = -10, // push frame up a bit
  ctaLabel = "Shop now",
}) => {
  const src = toInstagramEmbed(url);
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);

  React.useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      try {
        iframeRef.current?.focus();
      } catch {}
    }, 80);
    return () => clearTimeout(t);
  }, [active]);

  if (!src) {
    return (
      <div className="relative w-full aspect-[9/15] overflow-hidden rounded-xl bg-transparent grid place-items-center text-xs text-black/60">
        Invalid Instagram URL
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-[9/13] overflow-hidden rounded-xl bg-transparent"
      data-igwrap
    >
      {/* Instagram embed */}
      <iframe
        ref={iframeRef}
        src={src}
        title="Instagram reel"
        className="absolute inset-0 h-full w-full"
        loading={active ? "eager" : "lazy"}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        style={{
          border: 0,
          background: "transparent",
          transformOrigin: "center center",
          transform: `translateY(${shiftY}%) scale(${scale})`,
        }}
      />

      {/* Mask a small strip at the bottom so any "More on Instagram" is hidden */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-white rounded-b-xl z-10" />

      {/* CTA button that opens the original Instagram reel */}
      {/* <div className="absolute inset-x-0 bottom-2 z-20 flex justify-center pointer-events-none">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open this reel on Instagram"
          className="pointer-events-auto inline-flex items-center rounded-full bg-[#f26666] hover:bg-[#e05555] text-white text-xs font-semibold px-4 py-2 shadow"
        >
          {ctaLabel}
        </a>
      </div> */}

      {/* Hide any sibling link IG injects after the iframe */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            [data-igwrap] iframe + * { display: none !important; }
            [data-igwrap] + a[href*="instagram.com"] { display: none !important; }
          `,
        }}
      />
    </div>
  );
};

/* ========= Swiper Section ========= */
const MiniVideoSections: React.FC = () => {
  const location = useLocation();

  // Map paths to datasets
  const datasetByPath: Record<string, VideoData[]> = {
    "/": HOME_VIDEOS,
    "/baby": BABY_VIDEOS,
    "/life": LIFE_VIDEOS,
    "/Skincare": SKINCARE_VIDEOS,
  };

  const currentPath = location.pathname as keyof typeof datasetByPath;
  const rawVideos = datasetByPath[currentPath] ?? HOME_VIDEOS;

  const videos = React.useMemo(
    () =>
      [...rawVideos]
        .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
        .filter((v) => !!toInstagramEmbed(v.video_url)),
    [rawVideos]
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <Swiper
        modules={[Navigation, Autoplay, Keyboard, A11y]}
        breakpoints={{
          0: { slidesPerView: 2, spaceBetween: 12 },
          640: { slidesPerView: 2, spaceBetween: 14 },
          1024: { slidesPerView: 4, spaceBetween: 16 },
          1280: { slidesPerView: 6, spaceBetween: 18 },
        }}
        loop
        centeredSlides
        speed={650}
        keyboard={{ enabled: true }}
        navigation
        // pagination={{ clickable: true }}
        autoplay={{
          delay: 6200,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        className="!pb-8"
      >
        {videos.map((v) => (
          <SwiperSlide key={v.id} className="!h-auto">
            {({ isActive }) => (
              <InstaEmbed url={v.video_url} active={isActive} />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MiniVideoSections;
export {
  MiniVideoSections,
  HOME_VIDEOS,
  BABY_VIDEOS,
  LIFE_VIDEOS,
  SKINCARE_VIDEOS,
};
