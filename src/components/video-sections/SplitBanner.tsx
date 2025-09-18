import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface SplitBannerProps {
  videoUrl: string;
  posterImage: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaSecondaryText?: string;
  ctaLink: string;
  layout?: "left" | "right";
  className?: string;
}

export const SplitBanner = ({
  videoUrl,
  posterImage,
  title,
  subtitle,
  description,
  ctaText,
  ctaSecondaryText,
  ctaLink,
  layout = "left",
  className,
}: SplitBannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const VideoSection = () => {
    const isYouTubeEmbed = /youtube\.com\/embed/.test(videoUrl);

    // Center the video within its half of the grid and cap its width
    return (
      <div className="w-full flex items-center justify-center px-4">
        <div className="relative w-full max-w-3xl mx-auto aspect-[16/9] overflow-hidden rounded-lg">
          {isYouTubeEmbed ? (
            <iframe
              src={videoUrl}
              title={title}
              className="absolute inset-0 w-full h-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              style={{ border: "none" }}
            />
          ) : (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                poster={posterImage}
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                onLoadedData={() => videoRef.current?.play()}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              {/* Play/Pause Overlay for self-hosted videos */}
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  {isPlaying ? (
                    <Pause className="h-8 w-8 text-white" />
                  ) : (
                    <Play className="h-8 w-8 text-white ml-1" />
                  )}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const TextSection = () => (
    <div className="flex flex-col justify-center p-8 lg:p-12">
      <div className="max-w-md">
        <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
          {title}
        </h2>
        <h3 className="text-xl lg:text-2xl text-primary font-semibold mb-6">
          {subtitle}
        </h3>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="px-8 py-3 text-lg"
            onClick={() => (window.location.href = ctaLink)}
          >
            {ctaText}
          </Button>
          {ctaSecondaryText && (
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
              {ctaSecondaryText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className={cn("overflow-hidden border-0 shadow-xl", className)}>
      <div className={cn("grid lg:grid-cols-2 gap-0", layout === "right" && "lg:grid-cols-2")}>
        {layout === "left" ? (
          <>
            <VideoSection />
            <TextSection />
          </>
        ) : (
          <>
            <TextSection />
            <VideoSection />
          </>
        )}
      </div>
    </Card>
  );
};
