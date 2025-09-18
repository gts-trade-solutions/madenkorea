import { useState } from "react";
import { ChevronLeft, ChevronRight, Play, X, ZoomIn } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProductMediaSectionProps {
  images: string[];
  videoUrl?: string;
  productName: string;
}

export const ProductMediaSection = ({ images, videoUrl, productName }: ProductMediaSectionProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Main Image/Video Display */}
      <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden group">
        {showVideo && videoUrl ? (
          <iframe
            src={videoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={images[currentImageIndex]}
              alt={`${productName} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => openLightbox(currentImageIndex)}
            />
            
            {/* Zoom Icon */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openLightbox(currentImageIndex)}
                className="bg-white/80 hover:bg-white"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && !showVideo && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Video Play Button */}
        {videoUrl && !showVideo && (
          <Button
            variant="secondary"
            className="absolute bottom-4 left-4 bg-black/80 hover:bg-black text-white"
            onClick={() => setShowVideo(true)}
          >
            <Play className="h-4 w-4 mr-2" />
            Play Video
          </Button>
        )}

        {/* Close Video Button */}
        {showVideo && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 left-4 bg-black/80 hover:bg-black text-white"
            onClick={() => setShowVideo(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
              currentImageIndex === index && !showVideo
                ? "border-primary shadow-md"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => {
              setCurrentImageIndex(index);
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
            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all bg-black/10 flex items-center justify-center ${
              showVideo
                ? "border-primary shadow-md"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => setShowVideo(true)}
          >
            <Play className="h-6 w-6 text-gray-600" />
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black/90">
          <div className="relative">
            <img
              src={images[currentImageIndex]}
              alt={`${productName} - Image ${currentImageIndex + 1}`}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            
            {/* Lightbox Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
            
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            
            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};