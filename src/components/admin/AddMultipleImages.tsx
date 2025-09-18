import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Images, Plus } from 'lucide-react';

export const AddMultipleImages = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const { toast } = useToast();

  const addMultipleImagesToProducts = async () => {
    setIsProcessing(true);
    setResults([]);
    
    try {
      // Get all products with only 1 image
      const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('product_id, name, brand')
        .eq('is_active', true);

      if (productsError) {
        throw new Error('Failed to fetch products');
      }

      // Get media counts per product
      const { data: mediaCounts, error: mediaCountError } = await supabase
        .from('product_media')
        .select('product_id')
        .eq('media_type', 'image');

      if (mediaCountError) {
        throw new Error('Failed to fetch media counts');
      }

      // Count images per product
      const imageCountMap = new Map<string, number>();
      mediaCounts?.forEach(media => {
        const count = imageCountMap.get(media.product_id) || 0;
        imageCountMap.set(media.product_id, count + 1);
      });

      // Find products with NO images (0 images)
      const productsWithNoImages = allProducts?.filter(product => 
        (imageCountMap.get(product.product_id) || 0) === 0
      ) || [];

      setResults(prev => [...prev, `Found ${productsWithNoImages.length} products with 0 images that need media`]);

      // Get all available images from media library
      const { data: mediaLibrary, error: mediaError } = await supabase
        .from('media_library')
        .select('file_url, filename, original_name, created_at')
        .eq('file_type', 'image');

      if (mediaError) {
        throw new Error('Failed to fetch media library');
      }

      setResults(prev => [...prev, `Found ${mediaLibrary?.length || 0} images in media library`]);

      // Process products in batches
      let processedCount = 0;
      const BATCH_SIZE = 5;

      for (let i = 0; i < productsWithNoImages.length; i += BATCH_SIZE) {
        const batch = productsWithNoImages.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (product) => {
          try {
            console.log(`🔍 Processing product: ${product.name} (${product.brand})`);
            
            // Much stricter image matching - only use recent images and be very specific
            const recentImages = mediaLibrary?.filter(media => {
              // Only use recently uploaded images (last 3 hours)
              const uploadDate = new Date(media.created_at);
              const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
              return uploadDate > threeHoursAgo;
            }) || [];
            
            console.log(`📅 Found ${recentImages.length} recent images to check`);
            
            // Super strict matching based on filename content
            const productNameWords = product.name.toLowerCase()
              .replace(/[^a-zA-Z0-9\s]/g, ' ')
              .split(/\s+/)
              .filter(word => word.length > 2);
            
            const brandWords = product.brand.toLowerCase()
              .replace(/[^a-zA-Z0-9\s]/g, ' ')
              .split(/\s+/)
              .filter(word => word.length > 2);
            
            console.log(`🔍 Searching for words: [${productNameWords.join(', ')}] or brand [${brandWords.join(', ')}]`);
            
            // Find images with specific filename matches
            const matchedImages = recentImages.filter(media => {
              const filename = (media.filename || '').toLowerCase();
              const originalName = (media.original_name || '').toLowerCase();
              
              // Count how many product words appear in filename
              let productMatchCount = 0;
              let brandMatchCount = 0;
              
              productNameWords.forEach(word => {
                if (filename.includes(word) || originalName.includes(word)) {
                  productMatchCount++;
                  console.log(`✅ Found product word "${word}" in: ${originalName || filename}`);
                }
              });
              
              brandWords.forEach(word => {
                if (filename.includes(word) || originalName.includes(word)) {
                  brandMatchCount++;
                  console.log(`✅ Found brand word "${word}" in: ${originalName || filename}`);
                }
              });
              
              // Require at least 1 product word match OR 1 brand word match
              const hasMatch = productMatchCount > 0 || brandMatchCount > 0;
              
              if (hasMatch) {
                console.log(`🎯 Image "${originalName || filename}" matched with score: ${productMatchCount + brandMatchCount}`);
              }
              
              return hasMatch;
            });
            
            console.log(`📸 Found ${matchedImages.length} matching images for "${product.name}"`);
            
            // Only proceed if we found specific matches
            if (matchedImages.length === 0) {
              console.log(`❌ SKIPPING "${product.name}" - No specific image matches found`);
              setResults(prev => [...prev, `❌ No images found for "${product.name}"`]);
              return;
            }
            
            // Take up to 4 unique images
            const imagesToAdd = matchedImages.slice(0, 4);
            console.log(`📸 Will assign ${imagesToAdd.length} images to "${product.name}"`);
            const { data: currentImages, error: currentError } = await supabase
              .from('product_media')
              .select('media_url, position')
              .eq('product_id', product.product_id)
              .eq('media_type', 'image');

            if (currentError) {
              setResults(prev => [...prev, `❌ Error fetching current images for ${product.name}`]);
              return;
            }

            const currentImageUrls = new Set(currentImages?.map(img => img.media_url) || []);
            const maxPosition = Math.max(...(currentImages?.map(img => img.position) || [-1]));
            
            // Add up to 4 images for products with no images
            const imagesToInsert = [];
            let position = maxPosition >= 0 ? maxPosition + 1 : 0;
            let addedCount = 0;
            
            for (const image of imagesToAdd) {
              if (addedCount >= 4) break; // Max 4 images for products with no images
              if (currentImageUrls.has(image.file_url)) continue; // Skip if already exists
              
              imagesToInsert.push({
                product_id: product.product_id,
                media_url: image.file_url,
                media_type: 'image',
                position: position,
                is_primary: position === 0, // First image is primary
                alt_text: `${product.name} - Image ${position + 1}`
              });
              
              position++;
              addedCount++;
            }

            if (imagesToInsert.length > 0) {
              const { error: insertError } = await supabase
                .from('product_media')
                .insert(imagesToInsert);

              if (insertError) {
                setResults(prev => [...prev, `❌ Error adding images to ${product.name}: ${insertError.message}`]);
              } else {
                setResults(prev => [...prev, `✅ Added ${imagesToInsert.length} images to ${product.name}`]);
                processedCount++;
              }
            } else {
              setResults(prev => [...prev, `⚠️ No suitable images found for ${product.name}`]);
            }
          } catch (error) {
            setResults(prev => [...prev, `❌ Error processing ${product.name}: ${error.message}`]);
          }
        }));

        // Small delay between batches
        if (i + BATCH_SIZE < productsWithNoImages.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setResults(prev => [...prev, `🎉 Completed! Enhanced ${processedCount} products with additional images`]);
      
      toast({
        title: "Success!",
        description: `Added multiple images to ${processedCount} products`,
      });

    } catch (error) {
      console.error('Error adding multiple images:', error);
      setResults(prev => [...prev, `❌ Error: ${error.message}`]);
      toast({
        title: "Error",
        description: "Failed to add multiple images. Check the logs.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Images className="h-5 w-5" />
          Add Multiple Images to Products
        </CardTitle>
        <CardDescription>
          This will add up to 4 images to products that currently have no images, 
          using images from your media library based on brand matching.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={addMultipleImagesToProducts}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Multiple Images to Products
            </>
          )}
        </Button>

        {results.length > 0 && (
          <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
            <h4 className="font-semibold mb-2">Processing Results:</h4>
            <div className="space-y-1 text-sm font-mono">
              {results.map((result, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};