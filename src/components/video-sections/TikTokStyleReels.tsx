import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReelVideo {
  id: string;
  videoUrl: string;
  posterImage: string;
  title: string;
  brand: string;
  price: string;
  originalPrice?: string;
  description: string;
  tags: string[];
  productUrl: string;
}

interface TikTokStyleReelsProps {
  videos: ReelVideo[];
  className?: string;
}

export const TikTokStyleReels = ({
  videos,
  className,
}: TikTokStyleReelsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollRef.current.scrollLeft +
        (direction === "right" ? scrollAmount : -scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });

      // Update current index
      const newIndex = Math.round(newScrollLeft / scrollAmount);
      setCurrentIndex(Math.max(0, Math.min(videos.length - 1, newIndex)));
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Popular Videos</h2>
          <p className="text-muted-foreground">
            Discover what's popular in Consumer Innovations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            disabled={currentIndex >= videos.length - 3}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Reels Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {videos.map((video) => (
          <Card
            key={video.id}
            className="flex-shrink-0 w-64 group relative overflow-hidden snap-start"
          >
            {/* 9:16 Video Container */}
            <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
              <video
                src={video.videoUrl}
                poster={video.posterImage}
                muted
                loop
                playsInline
                autoPlay
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* TikTok-style Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Action Buttons - Right Side */}
              <div className="absolute right-3 bottom-20 flex flex-col gap-4">
                <Button
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                >
                  <Heart className="h-5 w-5 text-white" />
                </Button>
                <Button
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                >
                  <ShoppingCart className="h-5 w-5 text-white" />
                </Button>
              </div>

              {/* Content - Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="mb-2">
                  <Badge variant="secondary" className="mb-2">
                    {video.brand}
                  </Badge>
                </div>
                <h3 className="font-bold text-sm mb-1 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-xs text-white/80 mb-3 line-clamp-2">
                  {video.description}
                </p>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-lg">{video.price}</span>
                  {video.originalPrice && (
                    <span className="text-sm line-through text-white/60">
                      {video.originalPrice}
                    </span>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {video.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-white/20 px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  size="sm"
                  className="w-full bg-white text-black hover:bg-gray-100"
                  onClick={() => (window.location.href = video.productUrl)}
                >
                  Shop Now
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Mobile Scroll Indicator */}
      <div className="flex justify-center mt-4 gap-2 md:hidden">
        {videos.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index === currentIndex ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
};
