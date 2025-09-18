import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '@/lib/utils';
import { 
  Plus, 
  Minus, 
  Heart, 
  Share2, 
  Star, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Move, 
  Maximize2,
  Minimize2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface Professional360ViewerProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export const Professional360Viewer: React.FC<Professional360ViewerProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  const images = product?.images || [];
  const hasMultipleImages = images.length > 1;

  // Reset zoom and pan when image changes
  useEffect(() => {
    if (product) {
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
      setRotationAngle(0);
    }
  }, [currentImageIndex, product]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.5, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1.5) {
      setPanPosition({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  const handleRotate = useCallback(() => {
    setRotationAngle(prev => (prev + 90) % 360);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y
      });
    }
  }, [zoomLevel, panPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, zoomLevel]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  }, [handleZoomIn, handleZoomOut]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = async () => {
    await addToCart(product.product_id || product.id, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  // Early return after all hooks are called
  if (!product) return null;

  // CORRECT LOGIC: cost_price is discounted price, selling_price is original price
  const currentPrice = product.cost_price || 0; // What customer pays (discounted)
  const originalPrice = product.selling_price || 0; // Original price before discount
  const hasDiscount = originalPrice > currentPrice && originalPrice > 0;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const imageTransform = `
    scale(${zoomLevel}) 
    translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px) 
    rotate(${rotationAngle}deg)
  `;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-[95vw] max-h-[95vh]' : 'max-w-6xl max-h-[90vh]'} overflow-hidden`}>
        <DialogHeader>
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
          <DialogDescription className="sr-only">
            Professional 360° product viewer for {product.name} by {product.brand}
          </DialogDescription>
        </DialogHeader>
        
        <div className={`grid ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-6 h-full`}>
          {/* Professional Image Viewer */}
          <div className="space-y-4 flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  className="h-8 w-8 p-0"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[60px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 5}
                  className="h-8 w-8 p-0"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotate}
                  className="h-8 w-8 p-0"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="h-8 w-8 p-0"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Main Image Display */}
            <div 
              ref={containerRef}
              className={`relative ${isFullscreen ? 'h-[calc(95vh-200px)]' : 'aspect-square'} bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg overflow-hidden group cursor-${zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              {images.length > 0 ? (
                <>
                  <img
                    ref={imageRef}
                    src={images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-300 select-none"
                    style={{
                      transform: imageTransform,
                      transformOrigin: 'center center'
                    }}
                    draggable={false}
                  />
                  
                  {/* Navigation Arrows */}
                  {hasMultipleImages && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </>
                  )}

                  {/* Image Counter */}
                  {hasMultipleImages && (
                    <div className="absolute top-4 right-4 bg-background/90 px-3 py-1 rounded-full text-sm font-medium">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📸</div>
                    <p>No image available</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Image Thumbnails */}
            {hasMultipleImages && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'border-primary shadow-lg scale-105' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Zoom Instructions */}
            {zoomLevel === 1 && (
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <Move className="inline h-4 w-4 mr-1" />
                  Scroll to zoom • Click and drag when zoomed • Use toolbar for rotation
                </p>
              </div>
            )}
          </div>

          {/* Product Information - Only show when not fullscreen */}
          {!isFullscreen && (
            <div className="space-y-6 flex-shrink-0">
              <div>
                <Badge variant="secondary" className="mb-2">{product.brand}</Badge>
                <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">(4.0) • 128 reviews</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-4">
                  {hasDiscount ? (
                    <>
                      <span className="text-3xl font-bold text-primary">
                        {formatPrice(currentPrice)}
                      </span>
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(originalPrice)}
                      </span>
                      <Badge variant="destructive">{discountPercentage}% OFF</Badge>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(currentPrice)}
                    </span>
                  )}
                </div>

                {/* Size */}
                {product.size && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Size: </span>
                    <span className="text-sm">{product.size}</span>
                  </div>
                )}

                {/* Stock Status */}
                <div className="mb-4">
                  {product.stock_quantity > 0 ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      In Stock ({product.stock_quantity} available)
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={quantity >= product.stock_quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1" 
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleWishlist}
                    className={isWishlisted ? 'text-red-500 border-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Product Details Tabs */}
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                  <TabsTrigger value="usage">How to Use</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="mt-4">
                  <div className="space-y-3">
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description || 'No description available for this product.'}
                    </p>
                    {product.benefits && (
                      <div>
                        <h4 className="font-semibold mb-2">Benefits:</h4>
                        <p className="text-muted-foreground">{product.benefits}</p>
                      </div>
                    )}
                    {product.skin_type && product.skin_type.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Suitable for:</h4>
                        <div className="flex gap-2 flex-wrap">
                          {product.skin_type.map((type: string) => (
                            <Badge key={type} variant="outline">{type}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="ingredients" className="mt-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Ingredients:</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {product.ingredients || 'Ingredient information not available.'}
                    </p>
                    {product.safety_information && (
                      <div>
                        <h4 className="font-semibold mb-2 text-orange-600">Safety Information:</h4>
                        <p className="text-muted-foreground">{product.safety_information}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="usage" className="mt-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">How to Use:</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {product.how_to_use || 'Usage instructions not available.'}
                    </p>
                    {product.country_of_origin && (
                      <div>
                        <h4 className="font-semibold mb-2">Country of Origin:</h4>
                        <p className="text-muted-foreground">{product.country_of_origin}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};