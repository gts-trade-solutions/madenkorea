import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProductRow {
  name: string;
  brand: string;
  category: string;
  description?: string;
  cost_price: number;
  stock_quantity: number;
  size?: string;
  product_code?: string;
  keywords?: string;
}

// Simple CSV parser function
function parseCSV(text: string): string[][] {
  const lines = text.split('\n').filter(line => line.trim());
  const result: string[][] = [];
  
  for (const line of lines) {
    // Simple CSV parsing - handles basic comma separation
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current) {
      fields.push(current.trim());
    }
    
    result.push(fields);
  }
  
  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { fileName, userId } = await req.json()
    
    if (!fileName) {
      throw new Error('File name is required')
    }

    if (!userId) {
      throw new Error('User ID is required')
    }

    // Get supplier information for the user
    const { data: supplierData, error: supplierError } = await supabaseClient
      .from('suppliers')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (supplierError || !supplierData) {
      throw new Error('You must be registered as a supplier to bulk upload products')
    }

    console.log('Processing bulk upload file:', fileName)

    // Return immediate response and process in background
    const backgroundProcessing = async () => {
      try {
        // Check file extension
        const fileExt = fileName.split('.').pop()?.toLowerCase()
        
        if (!['csv', 'txt'].includes(fileExt || '')) {
          throw new Error('Only CSV files are supported. Please save your Excel file as CSV format.')
        }

        // Download the file from storage
        const { data: fileData, error: downloadError } = await supabaseClient.storage
          .from('bulk-uploads')
          .download(fileName)

        if (downloadError) {
          throw new Error(`Failed to download file: ${downloadError.message}`)
        }

        let rows: string[][]
        
        if (fileExt === 'xlsx') {
          // For Excel files, we'll reject them and ask for CSV format
          throw new Error('Excel files (.xlsx) are currently not supported due to parsing issues. Please save your file as CSV format (.csv) and upload again. Make sure your CSV has these headers: name,brand,category,description,cost_price,stock_quantity,size,product_code,keywords')
        } else {
          // Parse CSV/TXT content
          const fileText = await fileData.text()
          console.log('File content length:', fileText.length)
          console.log('First 200 characters:', fileText.substring(0, 200))
          rows = parseCSV(fileText)
        }
        
        if (rows.length === 0) {
          throw new Error('File appears to be empty or could not be parsed')
        }

        const headers = rows[0].map(h => h.trim().toLowerCase().replace(/"/g, ''))
        console.log('Headers found:', headers)

        // Map headers to our database fields
        const headerMap: { [key: string]: string } = {
          'name': 'name',
          'product name': 'name',
          'product_name': 'name',
          'title': 'name',
          'brand': 'brand',
          'category': 'category',
          'description': 'description',
          'price': 'cost_price',
          'cost price': 'cost_price',
          'cost_price': 'cost_price',
          'stock': 'stock_quantity',
          'stock quantity': 'stock_quantity',
          'stock_quantity': 'stock_quantity',
          'quantity': 'stock_quantity',
          'size': 'size',
          'product code': 'product_code',
          'product_code': 'product_code',
          'sku': 'product_code',
          'keywords': 'keywords',
          'tags': 'keywords',
          // Image fields
          'image': 'image',
          'images': 'images',
          'image_url': 'image',
          'image_urls': 'images',
          'image_url_1': 'image_url_1',
          'image_url_2': 'image_url_2', 
          'image_url_3': 'image_url_3',
          'image_url_4': 'image_url_4',
          'media': 'images',
          'photo': 'image',
          'photos': 'images'
        }

        const products: any[] = []
        
        // Fetch all media files to match against
        console.log('Fetching media library...')
        const { data: mediaFiles, error: mediaError } = await supabaseClient
          .from('media_library')
          .select('file_url, filename, original_name')
        
        if (mediaError) {
          console.error('Error fetching media library:', mediaError)
        }
        
        const mediaLookup = new Map()
        if (mediaFiles) {
          mediaFiles.forEach(media => {
            // Index by filename, original name, and full URL
            if (media.filename) mediaLookup.set(media.filename.toLowerCase(), media.file_url)
            if (media.original_name) mediaLookup.set(media.original_name.toLowerCase(), media.file_url)
            if (media.file_url) mediaLookup.set(media.file_url, media.file_url)
            
            // Also index by brand patterns for auto-matching
            if (media.original_name) {
              const originalLower = media.original_name.toLowerCase()
              if (originalLower.includes('roundlab') || originalLower.includes('round-lab')) {
                mediaLookup.set('roundlab-default', media.file_url)
              }
              if (originalLower.includes('cosrx')) {
                mediaLookup.set('cosrx-default', media.file_url)
              }
            }
          })
        }
        
        console.log('Media library indexed:', mediaLookup.size, 'entries')
        
        // Process data rows (skip header row)
        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].map(v => v.trim().replace(/"/g, ''))
          
          if (values.length < headers.length || values.every(v => !v)) {
            console.log(`Skipping row ${i + 1}: incomplete or empty`)
            continue // Skip incomplete or empty rows
          }
          
          const product: any = {}
          const productImages: string[] = []
          
          headers.forEach((header, index) => {
            const mappedField = headerMap[header]
            if (mappedField && values[index]) {
              if (mappedField === 'cost_price' || mappedField === 'stock_quantity') {
                const numValue = parseFloat(values[index].replace(/[^\d.-]/g, '')) || 0
                product[mappedField] = numValue
              } else if (mappedField === 'image' || mappedField === 'images' || 
                         mappedField.startsWith('image_url_')) {
                // Handle images - can be comma-separated list or individual columns
                const imageList = values[index].split(',').map(img => img.trim()).filter(img => img)
                
                imageList.forEach(imageName => {
                  // Try multiple matching strategies
                  let imageUrl = null
                  
                  // Strategy 1: Exact match (case-insensitive)
                  imageUrl = mediaLookup.get(imageName.toLowerCase()) || mediaLookup.get(imageName)
                  
                  // Strategy 2: Smart filename matching for "download" patterns
                  if (!imageUrl) {
                    // Handle "download - 2025-07-30T144105.777.jfif" -> "download.webp" pattern
                    if (imageName.toLowerCase().includes('download')) {
                      // Look for unique download-related images by extracting numbers
                      const downloadMatch = imageName.match(/download.*?(\d+)/i)
                      const downloadNumber = downloadMatch ? downloadMatch[1] : null
                      
                      // Find all download images
                      const downloadImages = []
                      for (const [key, url] of mediaLookup.entries()) {
                        if (key.includes('download')) {
                          downloadImages.push({ key, url })
                        }
                      }
                      
                      if (downloadImages.length > 0) {
                        if (downloadNumber && downloadImages.length > 1) {
                          // Try to find specific numbered download image
                          const numberIndex = parseInt(downloadNumber) % downloadImages.length
                          imageUrl = downloadImages[numberIndex]?.url
                          console.log(`Found numbered download image match: ${imageName} -> ${downloadImages[numberIndex]?.key}`)
                        } else {
                          // Use first available download image
                          imageUrl = downloadImages[0].url
                          console.log(`Found download image match: ${imageName} -> ${downloadImages[0].key}`)
                        }
                      }
                    }
                    
                    // General partial matching
                    if (!imageUrl) {
                      const baseNameWithoutExt = imageName.replace(/\.[^/.]+$/, '').toLowerCase()
                      for (const [key, url] of mediaLookup.entries()) {
                        if (key.includes(baseNameWithoutExt) || baseNameWithoutExt.includes(key.replace(/\.[^/.]+$/, ''))) {
                          imageUrl = url
                          console.log(`Found image by partial match: ${imageName} -> ${key}`)
                          break
                        }
                      }
                    }
                  }
                  
                  // Strategy 3: Direct URL
                  if (!imageUrl && imageName.startsWith('http')) {
                    imageUrl = imageName
                  }
                  
                  if (imageUrl && !productImages.includes(imageUrl)) {
                    productImages.push(imageUrl)
                  } else if (!imageUrl) {
                    console.log(`Image not found in media library: ${imageName}`)
                  }
                })
              } else {
                product[mappedField] = values[index]
              }
            }
          })

          // If no images were found from columns, try to auto-assign based on brand
          if (productImages.length === 0 && product.brand) {
            const brandLower = product.brand.toLowerCase().replace(/\s+/g, '')
            
            // Get all available images for this brand
            const brandImages = []
            for (const [key, url] of mediaLookup.entries()) {
              if (key.includes(brandLower) || key.includes(brandLower.substring(0, 5))) {
                brandImages.push(url)
              }
            }
            
            // If we have multiple brand images, assign up to 4 per product
            if (brandImages.length > 0) {
              // Use a simple rotation based on product index to distribute images
              const productIndex = products.length
              const selectedImages = []
              
              // Assign up to 4 images per product
              for (let imgIdx = 0; imgIdx < Math.min(4, brandImages.length); imgIdx++) {
                const imageIndex = (productIndex + imgIdx) % brandImages.length
                const imageUrl = brandImages[imageIndex]
                
                // Avoid duplicates
                if (!selectedImages.includes(imageUrl)) {
                  selectedImages.push(imageUrl)
                }
              }
              
              // If we have fewer than 4 unique images, fill with rotated images
              while (selectedImages.length < 4 && brandImages.length > 0) {
                const imageIndex = selectedImages.length % brandImages.length
                const imageUrl = brandImages[imageIndex]
                if (!selectedImages.includes(imageUrl)) {
                  selectedImages.push(imageUrl)
                } else {
                  break // Prevent infinite loop if all images are already used
                }
              }
              
              productImages.push(...selectedImages)
              console.log(`Auto-assigned ${selectedImages.length} images to ${product.name}`)
            }
          }

          // Add images to product
          if (productImages.length > 0) {
            product.images = productImages
          }

          console.log(`Row ${i + 1} parsed:`, { ...product, imageCount: product.images?.length || 0 })

          // Validate required fields
          if (product.name && product.brand && product.category && product.cost_price > 0) {
            products.push(product)
          } else {
            console.log(`Row ${i + 1} skipped: missing required fields`)
          }
        }

        console.log('Valid products to insert:', products.length)

        if (products.length === 0) {
          throw new Error('No valid products found. Please check your CSV format and ensure all required fields (name, brand, category, cost_price) are filled.')
        }

        // Process products in batches for better performance
        const BATCH_SIZE = 10
        const insertedProducts = []
        const errors = []
        
        for (let batchStart = 0; batchStart < products.length; batchStart += BATCH_SIZE) {
          const batch = products.slice(batchStart, batchStart + BATCH_SIZE)
          console.log(`Processing batch ${Math.floor(batchStart / BATCH_SIZE) + 1}/${Math.ceil(products.length / BATCH_SIZE)}`)
          
          // Process batch in parallel
          const batchPromises = batch.map(async (product, i) => {
            const actualIndex = batchStart + i
            try {
              // Generate unique product ID and slug
              const productId = `${product.brand.toUpperCase().replace(/\s+/g, '-')}-${Date.now()}-${actualIndex}`
              
              // Create unique slug by adding timestamp if needed
              let slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
              
              // Check if slug exists and make it unique
              const { data: existingProduct } = await supabaseClient
                .from('products')
                .select('slug')
                .eq('slug', slug)
                .maybeSingle()
              
              if (existingProduct) {
                slug = `${slug}-${Date.now()}-${actualIndex}`
              }
              
              const productData = {
                product_id: productId,
                name: product.name,
                slug,
                description: product.description || '',
                keywords: product.keywords || '',
                brand: product.brand,
                category: product.category,
                product_code: product.product_code || '',
                size: product.size || '',
                stock_quantity: product.stock_quantity || 0,
                cost_price: product.cost_price,
                selling_price: Math.round(product.cost_price * 1.3 * 100) / 100, // 30% markup
                supplier_id: supplierData.id,
                is_active: true,
                is_featured: false,
                discount_percentage: 0,
                country_of_origin: 'South Korea',
                gender: 'unisex'
              }

              const { data, error } = await supabaseClient
                .from('products')
                .insert(productData)
                .select()

              if (error) {
                console.error('Error inserting product:', error, productData)
                errors.push(`${product.name}: ${error.message}`)
                return null
              } else {
                console.log('Inserted product:', data[0].name)
                
                // Handle product images in parallel if any
                if (product.images && product.images.length > 0) {
                  console.log(`Adding ${product.images.length} images for product: ${product.name}`)
                  
                  const imagePromises = product.images.map(async (imageUrl, imgIndex) => {
                    const { error: mediaError } = await supabaseClient
                      .from('product_media')
                      .insert({
                        product_id: productData.product_id,
                        media_url: imageUrl,
                        media_type: 'image',
                        position: imgIndex,
                        is_primary: imgIndex === 0,
                        alt_text: `${product.name} - Image ${imgIndex + 1}`
                      })
                    
                    if (mediaError) {
                      console.error('Error linking image:', mediaError, imageUrl)
                      errors.push(`${product.name} image ${imgIndex + 1}: ${mediaError.message}`)
                    } else {
                      console.log(`Linked image ${imgIndex + 1} to ${product.name}`)
                    }
                  })
                  
                  await Promise.allSettled(imagePromises)
                }
                
                return data[0]
              }
            } catch (error) {
              console.error('Error processing product:', error, product)
              errors.push(`${product.name}: ${error.message}`)
              return null
            }
          })
          
          const batchResults = await Promise.allSettled(batchPromises)
          batchResults.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
              insertedProducts.push(result.value)
            }
          })
          
          // Small delay between batches to prevent overwhelming the database
          if (batchStart + BATCH_SIZE < products.length) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }

        // Clean up: delete the processed file
        await supabaseClient.storage
          .from('bulk-uploads')
          .remove([fileName])

        console.log(`Bulk upload completed: ${insertedProducts.length} products processed, ${errors.length} errors`)

      } catch (error) {
        console.error('Background processing error:', error)
      }
    }

    // Use waitUntil for background processing
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      EdgeRuntime.waitUntil(backgroundProcessing())
    } else {
      // Fallback: start background task without waiting
      backgroundProcessing().catch(console.error)
    }

    // Return immediate response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Bulk upload started. Processing ${fileName} in the background. You will be notified when complete.`,
        status: 'processing'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 202, // Accepted
      },
    )

  } catch (error) {
    console.error('Error starting bulk upload:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// Handle shutdown events
if (typeof addEventListener !== 'undefined') {
  addEventListener('beforeunload', (ev) => {
    console.log('Function shutdown due to:', ev.detail?.reason)
  })
}