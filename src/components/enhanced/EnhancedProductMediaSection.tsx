import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, Play, X, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface EnhancedProductMediaSectionProps {
  images: string[];
  videoUrl?: string;
  productName: string;
}

export const EnhancedProductMediaSection = ({ 
  images, 
  videoUrl, 
  productName 
}: EnhancedProductMediaSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const allMedia = [...images];
  if (videoUrl) allMedia.push(videoUrl);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allMedia.length);
    setShowVideo(false);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
    setShowVideo(false);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    setShowVideo(index === allMedia.length - 1 && !!videoUrl);
  };

  const handleImageHover = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const currentMedia = allMedia[currentIndex];
  const isCurrentVideo = currentIndex === allMedia.length - 1 && videoUrl;

  return (
    <div className="space-y-4">
      {/* Main Display */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
        {isCurrentVideo || showVideo ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted={isVideoMuted}
              loop
              playsInline
              poster={images[0]}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
            
            {/* Video Controls */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              <Button
                size="lg"
                onClick={toggleVideoPlay}
                className="bg-white/90 text-black hover:bg-white rounded-full p-4"
              >
                <Play className={`h-6 w-6 ${isVideoPlaying ? 'hidden' : 'block'}`} />
                <span className={`h-6 w-6 ${isVideoPlaying ? 'block' : 'hidden'}`}>⏸️</span>
              </Button>
            </div>
            
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="outline"
                onClick={toggleVideoMute}
                className="bg-black/50 border-white/20 text-white hover:bg-black/70"
              >
                {isVideoMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="relative w-full h-full cursor-zoom-in overflow-hidden"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleImageHover}
            onClick={() => openLightbox(currentIndex)}
          >
            <img
              ref={imageRef}
              src={currentMedia}
              alt={`${productName} - Image ${currentIndex + 1}`}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : {}
              }
            />
            
            {/* Zoom Indicator */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <ZoomIn className="h-3 w-3" />
                Hover to zoom
              </div>
            </div>
          </div>
        )}

        {/* Navigation Arrows */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={prevImage}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={nextImage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Thumbnails */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
              currentIndex === index && !showVideo
                ? "border-primary ring-2 ring-primary/20" 
                : "border-transparent hover:border-gray-300"
            }`}
            onClick={() => {
              setCurrentIndex(index);
              setShowVideo(false);
            }}
          >
            <img
              src={image}
              alt={`${productName} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
        
        {/* Video Thumbnail */}
        {videoUrl && (
          <button
            className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all relative ${
              showVideo || isCurrentVideo
                ? "border-primary ring-2 ring-primary/20" 
                : "border-transparent hover:border-gray-300"
            }`}
            onClick={() => {
              setCurrentIndex(allMedia.length - 1);
              setShowVideo(true);
            }}
          >
            <img
              src={images[0]}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Play className="h-4 w-4 text-white" />
            </div>
          </button>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            
            {showVideo ? (
              <video
                className="w-full max-h-[80vh] object-contain"
                controls
                autoPlay
                muted
              >
                <source src={videoUrl} type="video/mp4" />
              </video>
            ) : (
              <img
                src={allMedia[lightboxIndex]}
                alt={`${productName} - Image ${lightboxIndex + 1}`}
                className="w-full max-h-[80vh] object-contain"
              />
            )}
            
            {/* Lightbox Navigation */}
            {allMedia.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white border-white/20 hover:bg-black/70"
                  onClick={() => {
                    const newIndex = (lightboxIndex - 1 + allMedia.length) % allMedia.length;
                    setLightboxIndex(newIndex);
                    setShowVideo(newIndex === allMedia.length - 1 && !!videoUrl);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white border-white/20 hover:bg-black/70"
                  onClick={() => {
                    const newIndex = (lightboxIndex + 1) % allMedia.length;
                    setLightboxIndex(newIndex);
                    setShowVideo(newIndex === allMedia.length - 1 && !!videoUrl);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};