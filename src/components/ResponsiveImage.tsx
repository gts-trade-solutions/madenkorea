import { useState } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const ResponsiveImage = ({ 
  src, 
  alt, 
  className, 
  width, 
  height, 
  priority = false 
}: ResponsiveImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Check if we have a valid image source
  const hasValidSrc = src && src.trim() !== '';

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // If no valid source, show "Image coming soon" immediately
  if (!hasValidSrc) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <div 
          className="flex flex-col items-center justify-center bg-muted text-muted-foreground rounded w-full h-full min-h-[200px]"
          style={{ aspectRatio: width && height ? `${width}/${height}` : "16/9" }}
        >
          <div className="w-12 h-12 mb-3 rounded-full bg-muted-foreground/10 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-medium">Image coming soon</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && !hasError && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse rounded flex items-center justify-center" 
          style={{ aspectRatio: width && height ? `${width}/${height}` : "16/9" }}
        >
          <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-muted-foreground/60 rounded-full animate-spin" />
        </div>
      )}
      
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      ) : (
        <div 
          className="flex flex-col items-center justify-center bg-muted text-muted-foreground rounded w-full h-full min-h-[200px]"
          style={{ aspectRatio: width && height ? `${width}/${height}` : "16/9" }}
        >
          <div className="w-12 h-12 mb-3 rounded-full bg-muted-foreground/10 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-medium">Image coming soon</span>
        </div>
      )}
    </div>
  );
};