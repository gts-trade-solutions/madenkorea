import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VideoHeroBanner } from "@/components/VideoHeroBanner";
import { BrandRotatingHero } from "@/components/BrandRotatingHero";
import { ProductGrid } from "@/components/ProductGrid";
import { EditorialProductSections } from "@/components/EditorialProductSections";
import { MiniVideoSections } from "@/components/MiniVideoSections";
import { Testimonials } from "@/pages/Testimonials";

import {
  SEOMeta,
  OrganizationSchema,
  WebsiteSchema,
  FAQSchema,
} from "@/components/SEO/SEOComponents";
import { supabase } from "@/integrations/supabase/client";
import classyHeroImage from "@/assets/videos/classy-cosmetics-hero.jpg";
import ReelsStatic from "@/components/video-sections/SkincareVideos";
import ReelsStaticCategory from "@/components/video-sections/SkinCareVideos-v2";
import CertificationSwiper from "@/components/Cetifications";

/* ──────────────────────────────
   Mobile video hero (16:9)
   - Uses same video URL as desktop
   - Supports YouTube embeds or direct MP4/WebM
   ────────────────────────────── */
const MobileVideoHero16x9: React.FC<{
  videoUrl: string;
  posterImage?: string;
}> = ({ videoUrl, posterImage }) => {
  // Is it YouTube?
  const yt = videoUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
  );
  const embed = yt
    ? `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&playsinline=1&loop=1&controls=0&rel=0&modestbranding=1&playlist=${yt[1]}`
    : null;

  const isFile = /\.(mp4|webm|ogg)(\?|$)/i.test(videoUrl);

  return (
    <div className="relative w-full overflow-hidden bg-black rounded-none">
      {/* Tailwind's aspect-video = 16:9 */}
      <div className="aspect-video w-full">
        {embed ? (
          <iframe
            src={embed}
            title="Hero video"
            className="h-full w-full"
            loading="eager"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            style={{ border: 0 }}
          />
        ) : isFile ? (
          <video
            className="h-full w-full object-cover"
            src={videoUrl}
            poster={posterImage}
            playsInline
            muted
            loop
            autoPlay
            controls={false}
          />
        ) : (
          // Fallback for other providers
          <img
            src={posterImage || classyHeroImage}
            alt="Hero"
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
        )}
      </div>
    </div>
  );
};

export default function Index() {
  const [heroVideo, setHeroVideo] = useState<any>(null);
  const [allHeroVideos, setAllHeroVideos] = useState<any[]>([]);
  const [testimonialVideo, setTestimonialVideo] = useState<any>(null);

  useEffect(() => {
    const fetchHeroVideos = async () => {
      try {
        const { data: allVideos, error: allError } = await supabase
          .from("videos")
          .select("*")
          .eq("video_type", "hero")
          .eq("is_active", true)
          .order("position");

        if (allError) {
          console.error("Database error:", allError);
          return;
        }

        setAllHeroVideos(allVideos || []);
        if (allVideos && allVideos.length > 0) setHeroVideo(allVideos[0]);

        const { data: testimonialVideos, error: testimonialError } =
          await supabase
            .from("videos")
            .select("*")
            .eq("video_type", "testimonial")
            .eq("is_active", true)
            .order("position")
            .limit(1);

        if (!testimonialError && testimonialVideos?.length) {
          setTestimonialVideo(testimonialVideos[0]);
        }
      } catch (err) {
        console.error("Unexpected error fetching videos:", err);
      }
    };

    fetchHeroVideos();
  }, []);

  // FAQ for SEO
  const faqs = [
    {
      question: "What makes Korean beauty products different?",
      answer:
        "Korean beauty products focus on gentle, effective ingredients and innovative formulations that prioritize skin health and hydration over quick fixes.",
    },
    {
      question: "Are your products authentic?",
      answer:
        "Yes, all our Consumer Innovations products are 100% authentic and sourced directly from authorized distributors in Korea.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "We offer fast shipping across India with delivery typically within 3-7 business days depending on your location.",
    },
    {
      question: "Do you offer returns?",
      answer:
        "Yes, we offer hassle-free returns within 30 days of purchase for unopened products in original packaging.",
    },
  ];

  // Convert YT watch/short link to embed (for desktop banner)
  const convertYouTubeUrl = (url: string) => {
    if (!url) return url;
    const m = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );
    return m
      ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&mute=1&loop=1&playlist=${m[1]}`
      : url;
  };

  return (
    <>
      <SEOMeta
        title="Consumer Innovations Store | Authentic Korean Beauty Products Online in India"
        description="Shop authentic Korean beauty products online. Premium Consumer Innovations skincare, makeup & cosmetics from top Korean brands like COSRX, INNISFREE, LANEIGE. Free shipping across India."
        keywords="korean beauty products india, Consumer Innovations online, korean skincare, cosrx, innisfree, laneige, korean makeup, authentic Consumer Innovations, korean cosmetics online"
        type="website"
      />
      <OrganizationSchema />
      <WebsiteSchema />
      <FAQSchema faqs={faqs} />

      <div className="min-h-screen bg-white dark:bg-white">
        <Header />

        {/* HERO */}
        <div className="fade-in bg-white dark:bg-white">
          {/* Mobile: render SAME video in 16:9 */}
          <div className="block md:hidden">
            <MobileVideoHero16x9
              videoUrl={
                heroVideo?.video_url ||
                "https://www.youtube.com/watch?v=XRoT_jgN4-4"
              }
              posterImage={heroVideo?.thumbnail_url || classyHeroImage}
            />
          </div>

          {/* Desktop: your existing video hero banner */}
          <div className="hidden md:block">
            {heroVideo ? (
              <VideoHeroBanner
                videoUrl={convertYouTubeUrl(heroVideo.video_url)}
                posterImage={heroVideo.thumbnail_url || classyHeroImage}
                title="중강저다 삼로디비 SMARTER CHOICES BETTER LIVING"
                subtitle=""
                description=""
                ctaText="SHOP NOW"
                ctaLink="/products"
                badge="Consumer Innovations"
                allVideos={allHeroVideos}
                onVideoChange={setHeroVideo}
              />
            ) : (
              <VideoHeroBanner
                videoUrl="https://youtu.be/MnMZp28HNjk?si=8Ue7-3iC4psl30BG"
                posterImage={classyHeroImage}
                title="중강저다 삼로디비  SMARTER CHOICES BETTER LIVING"
                subtitle=""
                description=""
                ctaText="SHOP NOW"
                ctaLink="/products"
                badge="Consumer Innovations"
              />
            )}
          </div>
        </div>

        {/* Rest of page */}
        <div
          className="bg-white dark:bg-white fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <BrandRotatingHero />
        </div>

        <div
          className="bg-white dark:bg-white fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <ProductGrid />
        </div>
         <MiniVideoSections />
        
        <div
          className="bg-white dark:bg-white fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <EditorialProductSections />
        </div>

        <div
          className="bg-white dark:bg-white fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <Testimonials />
        </div>
        <div
          className="bg-gradient-to-br from-slate-50/50 to-purple-50/30 dark:bg-none dark:bg-white fade-in"
          style={{ animationDelay: "0.4s" }}
        >
         <ReelsStatic />
          {/* <ReelsStaticCategory/> */}
        </div>
        <CertificationSwiper/>
        <Footer />
      </div>
    </>
  );
}
