// pages/ShowcaseAllInOne.tsx
import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import BestSellersShowcase from "@/components/video-sections/BestSeller";
import SnapReels from "@/components/video-sections/SkincareVideos";
import SkinConsultPanel from "@/components/video-sections/SkincareBottom";
import BabyProducts from "@/components/video-sections/BabyProducts";
import LifeProducts from "@/components/video-sections/LifeHomeProduct";
import LifeandhomeBottom from "@/components/video-sections/LifeHomeBottom";
import ReelsStatic from "@/components/video-sections/SkincareVideos";
import MiniVideoSections from "@/components/MiniVideoSections";

type Slide = {
  image: string;
  alt: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  cta?: { label: string; href: string };
};

const slides: Slide[] = [
  {
    image: "/images/life-1.jpg",
    alt: "Hydrating skincare serum on acrylic",
    eyebrow: "New Arrival",
    title: "Brightening Creams",
    description: "Glow like glass — clean, simple, effective.",
    cta: { label: "Shop Now", href: "/products" },
  },
  {
    image: "/images/life-2.jpg",
    alt: "Flatlay of Korean skincare routine",
    eyebrow: "Editor's Pick",
    title: "Build Your Routine",
    description: "Cleanser → Toner → Essence → Moisturizer → SPF.",
    cta: { label: "Explore Sets", href: "/collections/sets" },
  },
  {
    image: "/images/life-3.jpg",
    alt: "Minimal bottle on soft fabric",
    eyebrow: "Limited",
    title: "Velvet Night Cream",
    description: "Deep hydration for your PM routine.",
    cta: { label: "View Details", href: "/products/velvet-night-cream" },
  },
  // {
  //   image: "/images/7.png",
  //   alt: "Soothing toner on stone",
  //   eyebrow: "Trending",
  //   title: "Soothing Toner",
  //   description: "Calm, balance, and prep your skin.",
  //   cta: { label: "See Product", href: "/products/soothing-toner" },
  // },
//     {
//     image: "/images/5.webp",
//     alt: "Soothing toner on stone",
//     eyebrow: "Trending",
//     title: "Soothing Toner",
//     description: "Calm, balance, and prep your skin.",
//     cta: { label: "See Product", href: "/products/soothing-toner" },
//   },
  //    {
  //   image: "/images/1.jpg",
  //   alt: "Soothing toner on stone",
  //   eyebrow: "Trending",
  //   title: "Soothing Toner",
  //   description: "Calm, balance, and prep your skin.",
  //   cta: { label: "See Product", href: "/products/soothing-toner" },
  // },
];

const cls = (...v: Array<string | false | null | undefined>) =>
  v.filter(Boolean).join(" ");

export default function Lifeandhome() {
  const [active, setActive] = useState(0);
  const mainRef = useRef<SwiperType | null>(null);

  const onMainSwiper = (s: SwiperType) => {
    mainRef.current = s;
    setActive(s.realIndex ?? s.activeIndex ?? 0);
  };
  const onMainChange = (s: SwiperType) => setActive(s.realIndex ?? s.activeIndex ?? 0);
  const goTo = (i: number) => mainRef.current?.slideToLoop(i, 500);

  return (
    <>
    <Header />
    <div className="container-fluid mx-auto ">
      {/* HERO SWIPER (overlay text, 16:9) */}
      <section>
        <div className="relative  overflow-hidden ">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            slidesPerView={1}
            loop
            autoplay={{ delay: 1500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation
            onSwiper={onMainSwiper}
            onSlideChange={onMainChange}
          className="h-[60%]"
          >
            {slides.map((s, i) => (
              <SwiperSlide key={i}>
                <div className="relative h-full  w-100 aspect-[4/1.4]">
                  <img
                    src={s.image}
                    alt={s.alt} style={{ objectFit: "cover" }}
                    className="absolute inset-0 h-full w-full "
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Overlay text */}
                  {(s.eyebrow || s.title || s.description || s.cta) && (
                    <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
                      <div className="relative text-white">
                        {s.eyebrow && (
                          <span className="text-xs sm:text-sm opacity-90">
                            {s.eyebrow}
                          </span>
                        )}
                        {s.title && (
                          <h2 className="text-xl sm:text-3xl font-semibold mt-1">
                            {s.title}
                          </h2>
                        )}
                        {s.description && (
                          <p className="opacity-90 mt-2">{s.description}</p>
                        )}
                        {s.cta && (
                          <a
                            href={s.cta.href}
                            className="inline-flex items-center rounded-xl border border-white/70 text-white px-4 py-2 mt-4 hover:bg-white/10"
                          >
                            {s.cta.label}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

    
    </div>
    <LifeProducts />
 {/* <ReelsStatic /> */}
  <MiniVideoSections/>
  <LifeandhomeBottom />
  {/* <SkinConsultPanel /> */}
    <Footer />
    </>
  );
}
