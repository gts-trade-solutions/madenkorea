import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface VideoHeroBannerProps {
  videoUrl?: string;
  videoUrl2?: string;
  posterImage?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  badge?: string;
  autoplay?: boolean;
  showControls?: boolean;
  allVideos?: any[];
  onVideoChange?: (video: any) => void;
}

function isYouTube(url?: string) {
  if (!url) return false;
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}
function getYouTubeId(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
    const v = u.searchParams.get("v");
    if (v) return v;
    const m = u.pathname.match(/\/embed\/([^/?#]+)/);
    return m?.[1];
  } catch {
    return undefined;
  }
}
function buildYouTubeEmbed(url: string) {
  const id = getYouTubeId(url);
  if (!id) return url;
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",             // autoplay requires muted on mobile
    controls: "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    loop: "1",
    playlist: id,          // loop needs playlist=id
    iv_load_policy: "3",
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export const VideoHeroBanner: React.FC<VideoHeroBannerProps> = ({
  videoUrl = "",
  videoUrl2 = "",
  posterImage = "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200",
  title = "Consumer Innovations REVOLUTION",
  subtitle = "SMARTER CHOICES, BETTER LIVING",
  description = "Buy 2 Get 2 FREE • Imported directly from Seoul",
  ctaText = "SHOP Consumer Innovations NOW",
  ctaLink = "#products",
  badge = "🇰🇷 AUTHENTIC KOREAN BEAUTY",
  autoplay = true,
  showControls = true,
  allVideos = [],
  onVideoChange,
}) => {
  const usingYouTube = isYouTube(videoUrl);
  const embedSrc = useMemo(() => (usingYouTube ? buildYouTubeEmbed(videoUrl) : ""), [usingYouTube, videoUrl]);

  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeStyle, setIframeStyle] = useState<React.CSSProperties>({
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    height: "100%",
  });

  // Force the 16:9 iframe to "background-cover" the container
  const updateCoverSize = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const cw = el.clientWidth || window.innerWidth;
    const ch = el.clientHeight || window.innerHeight;

    const videoAspect = 16 / 9;
    const containerAspect = cw / ch;

    let w: number, h: number;
    if (containerAspect < videoAspect) {
      // container is taller/narrower => base on height
      h = ch;
      w = h * videoAspect;
    } else {
      // container is wider => base on width
      w = cw;
      h = w / videoAspect;
    }
    setIframeStyle((s) => ({
      ...s,
      width: `${w}px`,
      height: `${h}px`,
    }));
  }, []);

  useLayoutEffect(() => {
    updateCoverSize();
    const onResize = () => updateCoverSize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateCoverSize]);

  // Play/pause only applies to native <video>, not the iframe
  useEffect(() => {
    if (usingYouTube) return;
    const el = videoRef.current;
    if (!el) return;
    if (isPlaying) {
      el.play().catch(() => setVideoError(true));
    } else {
      el.pause();
    }
  }, [isPlaying, usingYouTube]);

  // Minimal loading state handling
  useEffect(() => {
    if (usingYouTube) {
      const t = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(t);
    }
  }, [usingYouTube, videoUrl]);

  const handleVideoLoadStart = () => setIsLoading(true);
  const handleVideoCanPlay = () => setIsLoading(false);
  const togglePlayPause = () => setIsPlaying((p) => !p);
  const handleVideoError = () => setVideoError(true);

  return (
    <section className="relative w-full h-screen min-h-[500px] md:min-h-[700px] overflow-hidden">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <LoadingSpinner size="lg" className="text-white" />
        </div>
      )}

      {/* Background container we size against */}
      <div ref={containerRef} className="absolute inset-0 overflow-hidden">
        {/* YouTube iframe sized to cover (no black bars) */}
        {!videoError && usingYouTube && (
          <iframe
            style={iframeStyle}
            className="pointer-events-none" // keep hero clickable
            src={embedSrc}
            title="YouTube video"
            frameBorder={0}
            allow="autoplay; fullscreen; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
        )}

        {/* Native <video> fallback (mp4, etc.) */}
        {!videoError && !usingYouTube && videoUrl && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={videoUrl}
            poster={posterImage}
            muted={isMuted}
            autoPlay={autoplay}
            loop
            playsInline
            onLoadStart={handleVideoLoadStart}
            onCanPlay={handleVideoCanPlay}
            onError={handleVideoError}
          >
            {videoUrl2 ? <source src={videoUrl2} /> : null}
          </video>
        )}

        {/* Poster fallback if no video */}
        {(videoError || !videoUrl) && (
          <img
            src={posterImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onLoad={() => setIsLoading(false)}
          />
        )}
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* CONTENT */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center h-full">
            <div className="max-w-4xl text-center z-10 relative animate-fade-in px-4">
              <div className="mb-4 md:mb-6">
                <span className="bg-red-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold animate-scale-in">
                  {badge}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight drop-shadow-2xl">
                {title.split(" ").map((word, index) => (
                  <span
                    key={index}
                    className={
                      index === 1
                        ? "block text-2xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-pink-300 to-yellow-300 bg-clip-text text-transparent"
                        : ""
                    }
                  >
                    {word}
                    {index === 0 ? <br /> : " "}
                  </span>
                ))}
              </h1>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-2 md:mb-3 drop-shadow-lg">
                {subtitle}
              </p>

              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/80 mb-8 md:mb-12 drop-shadow-md max-w-3xl mx-auto">
                {description}
              </p>

              <Button
                size="lg"
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-4 md:px-12 md:py-6 text-lg md:text-xl lg:text-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 animate-scale-in"
                onClick={() => {
                  if (ctaLink.startsWith("#")) {
                    document.querySelector(ctaLink)?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.open(ctaLink, "_blank");
                  }
                }}
              >
                {ctaText}
              </Button>
            </div>
          </div>
        </div>

        {/* Controls only for native <video> */}
        {showControls && !usingYouTube && (
          <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 flex space-x-2 md:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted((m) => !m)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20 hover:scale-105 transition-all h-8 w-8 md:h-10 md:w-10"
            >
              {isMuted ? <VolumeX className="h-4 w-4 md:h-5 md:w-5" /> : <Volume2 className="h-4 w-4 md:h-5 md:w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20 hover:scale-105 transition-all h-8 w-8 md:h-10 md:w-10"
            >
              {isPlaying ? <Pause className="h-4 w-4 md:h-5 md:w-5" /> : <Play className="h-4 w-4 md:h-5 md:w-5" />}
            </Button>
          </div>
        )}

        {/* Dots (fix: proper template string) */}
        {allVideos.length > 1 && (
          <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 flex space-x-2 md:space-x-3">
            {allVideos.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 cursor-pointer hover:scale-125 ${
                  index === currentVideoIndex ? "bg-white shadow-lg" : "bg-white/50 hover:bg-white/70"
                }`}
                onClick={() => {
                  setCurrentVideoIndex(index);
                  onVideoChange?.(allVideos[index]);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
