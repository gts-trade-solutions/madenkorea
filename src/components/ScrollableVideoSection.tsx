import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Volume2, VolumeX, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ProductVideoCard {
  id: string;
  productName: string;
  productBrand: string;
  productPrice: string;
  originalPrice: string;
  rating: number;
  reviews: number;
  videoUrl: string;
  videoUrl2?: string;
  posterImage: string;
  badge?: string;
  description: string;
  benefits: string[];
  ctaText?: string;
  ctaLink?: string;
}

interface ScrollableVideoSectionProps {
  title?: string;
  subtitle?: string;
  videos: ProductVideoCard[];
  autoplay?: boolean;
  showControls?: boolean;
  backgroundColor?: string;
}

const VideoCard = ({ 
  video, 
  autoplay, 
  showControls 
}: { 
  video: ProductVideoCard; 
  autoplay: boolean; 
  showControls: boolean; 
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = useState(true);
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

  const handleVideoClick = () => {
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  const discountPercentage = Math.round(((parseInt(video.originalPrice.slice(1)) - parseInt(video.productPrice.slice(1))) / parseInt(video.originalPrice.slice(1))) * 100);

  return (
    <div className="flex-none w-80 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Video Section */}
      <div className="relative aspect-[4/3] bg-black overflow-hidden">
        {!videoError ? (
          <div className="relative w-full h-full cursor-pointer" onClick={handleVideoClick}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              loop
              muted={isMuted}
              playsInline
              poster={video.posterImage}
              onError={handleVideoError}
            >
              <source src={video.videoUrl} type="video/mp4" />
              {video.videoUrl2 && <source src={video.videoUrl2} type="video/mp4" />}
            </video>
            
            {/* Video Overlay */}
            {showVideoOverlay && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all duration-300 hover:bg-black/30">
                <Button
                  size="lg"
                  className="bg-white/90 text-black hover:bg-white rounded-full p-4 shadow-xl transform hover:scale-110 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlaying(true);
                  }}
                >
                  <Play className="h-6 w-6 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center flex items-center justify-center"
            style={{
              backgroundImage: `url(${video.posterImage})`
            }}
          >
            <div className="text-center text-white">
              <p className="text-sm font-medium">Video Unavailable</p>
            </div>
          </div>
        )}

        {/* Video Controls */}
        {showControls && !videoError && (
          <div className="absolute bottom-2 left-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white h-8 w-8 p-0"
            >
              {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            </Button>
          </div>
        )}

        {/* Badge */}
        {video.badge && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-red-500 text-white text-xs font-bold">
              {video.badge}
            </Badge>
          </div>
        )}

        {/* Discount Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-green-500 text-white text-xs font-bold">
            {discountPercentage}% OFF
          </Badge>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Brand and Rating */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-primary">{video.productBrand}</span>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{video.rating}</span>
            <span className="text-xs text-muted-foreground">({video.reviews})</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-lg leading-tight text-foreground line-clamp-2">
          {video.productName}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {video.description}
        </p>

        {/* Benefits */}
        <div className="space-y-1">
          {video.benefits.slice(0, 2).map((benefit, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-green-500 text-xs">✓</span>
              <span className="text-xs text-muted-foreground">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-red-600">{video.productPrice}</span>
          <span className="text-sm text-muted-foreground line-through">{video.originalPrice}</span>
        </div>

        {/* CTA Button */}
        <Button 
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold"
          onClick={() => {
            if (video.ctaLink) {
              if (video.ctaLink.startsWith('#')) {
                document.querySelector(video.ctaLink)?.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.open(video.ctaLink, '_blank');
              }
            }
          }}
        >
          {video.ctaText || "Add to Cart"}
        </Button>
      </div>
    </div>
  );
};

export const ScrollableVideoSection = ({
  title = "Featured Product Videos",
  subtitle = "See Our Best Sellers in Action",
  videos,
  autoplay = false,
  showControls = true,
  backgroundColor = "bg-gradient-to-br from-gray-50 to-blue-50"
}: ScrollableVideoSectionProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (!videos || videos.length === 0) return null;

  return (
    <section className={`py-16 ${backgroundColor}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground animate-fade-in">
            {title}
          </h2>
          <p className="text-xl text-muted-foreground animate-fade-in">
            {subtitle}
          </p>
        </div>

        {/* Scrollable Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 transition-all"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 transition-all"
            onClick={scrollRight}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Video Cards Container */}
          <div 
            ref={scrollContainerRef}
            className="flex space-x-6 overflow-x-auto pb-4 px-12 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {videos.map((video) => (
              <div key={video.id} className="snap-start">
                <VideoCard 
                  video={video} 
                  autoplay={autoplay} 
                  showControls={showControls} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">100+</div>
              <p className="text-sm text-muted-foreground">Video Reviews Available</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">Real</div>
              <p className="text-sm text-muted-foreground">Customer Demonstrations</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">Expert</div>
              <p className="text-sm text-muted-foreground">Application Tips</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};