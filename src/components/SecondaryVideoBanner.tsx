import { Button } from "@/components/ui/button";
import { Play, Volume2, VolumeX, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SecondaryVideoBannerProps {
  // Admin configurable props
  videoUrl?: string;
  videoUrl2?: string; // Secondary video source
  posterImage?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  autoplay?: boolean;
  showControls?: boolean;
  layout?: "left" | "right" | "center";
  backgroundColor?: string;
}

export const SecondaryVideoBanner = ({
  videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4",
  videoUrl2 = "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
  posterImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Cdefs%3E%3ClinearGradient id='bg2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23fecaca'/%3E%3Cstop offset='50%25' style='stop-color:%23fed7d7'/%3E%3Cstop offset='100%25' style='stop-color:%23fbb6ce'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg2)'/%3E%3C/svg%3E",
  title = "Discover the Secret of Korean Skincare",
  subtitle = "Transform Your Skin with Authentic Consumer Innovations Products",
  description = "Experience the revolutionary skincare routine that has taken the world by storm. Our carefully curated selection of authentic Korean beauty products delivers visible results for all skin types.",
  ctaText = "Explore Collection",
  ctaLink = "#products",
  secondaryCtaText = "Watch Tutorial",
  secondaryCtaLink = "#tutorial",
  autoplay = false,
  showControls = true,
  layout = "left",
  backgroundColor = "bg-gradient-to-br from-rose-50 to-pink-100",
}: SecondaryVideoBannerProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [videoError, setVideoError] = useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = useState(!autoplay);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => setVideoError(true));
        setShowVideoOverlay(false);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  const handleVideoClick = () => {
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case "right":
        return "lg:flex-row-reverse";
      case "center":
        return "flex-col";
      default:
        return "lg:flex-row";
    }
  };

  return (
    <section className={`py-16 lg:py-24 ${backgroundColor}`}>
      <div className="container mx-auto px-4">
        <div
          className={`flex ${getLayoutClasses()} items-center gap-6 lg:gap-16 flex-col lg:flex-row`}
        >
          {/* Content Section */}
          <div
            className={`${
              layout === "center" ? "w-full text-center" : "w-full lg:flex-1"
            } space-y-6 animate-fade-in`}
          >
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {title}
              </h2>
              <p className="text-xl lg:text-2xl text-primary font-medium">
                {subtitle}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {description}
              </p>
            </div>

            {/* CTAs */}
            <div
              className={`flex ${
                layout === "center" ? "justify-center" : "justify-start"
              } gap-4 flex-wrap w-full`}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  if (ctaLink.startsWith("#")) {
                    document
                      .querySelector(ctaLink)
                      ?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.open(ctaLink, "_blank");
                  }
                }}
              >
                {ctaText}
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  if (secondaryCtaLink.startsWith("#")) {
                    document
                      .querySelector(secondaryCtaLink)
                      ?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.open(secondaryCtaLink, "_blank");
                  }
                }}
              >
                {secondaryCtaText}
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground pt-6 justify-center lg:justify-start">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>100% Authentic Products</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Free Shipping on ₹1999+</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Dermatologist Tested</span>
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div
            className={`${
              layout === "center"
                ? "w-full max-w-4xl mx-auto"
                : "w-full lg:flex-1"
            } animate-scale-in`}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/5 backdrop-blur-sm">
              {/* Video or fallback */}
              {!videoError ? (
                <div
                  className="relative aspect-video cursor-pointer"
                  onClick={handleVideoClick}
                >
                  {videoUrl.includes("youtube.com/embed") ? (
                    <iframe
                      src={videoUrl}
                      className="w-full h-full object-cover"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      style={{ border: "none" }}
                    />
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        loop
                        muted={isMuted}
                        playsInline
                        poster={posterImage}
                        onError={handleVideoError}
                      >
                        <source src={videoUrl} type="video/mp4" />
                        <source src={videoUrl2} type="video/mp4" />
                      </video>

                      {/* Video Overlay */}
                      {showVideoOverlay && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-all duration-300 hover:bg-black/20">
                          <Button
                            size="lg"
                            className="bg-white/90 text-black hover:bg-white rounded-full p-6 shadow-2xl transform hover:scale-110 transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsPlaying(true);
                            }}
                          >
                            <Play className="h-8 w-8 ml-1" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div
                  className="aspect-video bg-cover bg-center flex items-center justify-center"
                  style={{
                    backgroundImage: `url(${posterImage})`,
                  }}
                >
                  <div className="text-center text-white">
                    <p className="text-lg font-medium">Video Unavailable</p>
                    <p className="text-sm opacity-75">
                      Showing fallback content
                    </p>
                  </div>
                </div>
              )}

              {/* Video Controls */}
              {showControls && !videoError && (
                <div className="absolute bottom-4 left-4 flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border border-white/20"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlayPause();
                    }}
                    className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border border-white/20"
                  >
                    {isPlaying ? (
                      <span className="h-4 w-4 flex items-center">⏸</span>
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}

              {/* Gradient Border Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 to-red-500/20 pointer-events-none"></div>
            </div>

            {/* Video Caption */}
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Watch how Korean skincare can transform your daily routine
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
