import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoScrollVideoProps {
  videoUrl: string;
  posterImage: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  className?: string;
}

export const AutoScrollVideo = ({
  videoUrl,
  posterImage,
  title,
  description,
  ctaText,
  ctaLink,
  className
}: AutoScrollVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (videoRef.current) {
          if (entry.isIntersecting) {
            videoRef.current.play();
            setIsPlaying(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <Card className={cn("relative overflow-hidden group", className)}>
      <div className="relative aspect-video">
        {videoUrl.includes('youtube.com/embed') ? (
          <iframe
            src={videoUrl}
            className="w-full h-full object-cover"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{ border: 'none' }}
          />
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterImage}
            muted={isMuted}
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Video Controls */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 text-white" />
            ) : (
              <Play className="h-4 w-4 text-white" />
            )}
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-white" />
            ) : (
              <Volume2 className="h-4 w-4 text-white" />
            )}
          </Button>
        </div>

        {/* CTA Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
          <div className="p-6 text-white w-full">
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-white/90 mb-4 max-w-md">{description}</p>
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-gray-100"
              onClick={() => window.location.href = ctaLink}
            >
              {ctaText}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};