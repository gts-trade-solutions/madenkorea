import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface Product {
  description: string;
  ingredients: string;
  howToUse: string;
  fullDescription?: string;
  benefits?: string[];
  tags?: string[];
}

interface EnhancedProductTabsProps {
  product: Product;
}

export const EnhancedProductTabs = ({ product }: EnhancedProductTabsProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const mockReviews = [
    {
      id: 1,
      name: "Sarah K.",
      rating: 5,
      date: "2024-01-15",
      title: "Amazing results!",
      content: "This cream has transformed my skin. The snail mucin really works for healing and hydration.",
      verified: true
    },
    {
      id: 2,
      name: "Priya M.",
      rating: 4,
      date: "2024-01-10",
      title: "Good product",
      content: "Nice texture and absorbs well. Noticed improvement in skin texture after 2 weeks.",
      verified: true
    },
    {
      id: 3,
      name: "Jessica L.",
      rating: 5,
      date: "2024-01-08",
      title: "Holy grail product!",
      content: "Been using for 3 months now. My acne scars have faded significantly and skin feels so much smoother.",
      verified: false
    }
  ];

  if (isMobile) {
    return (
      <div className="w-full">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="description">
            <AccordionTrigger className="text-left">Description</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.fullDescription || product.description}
                </p>
                
                {product.benefits && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Key Benefits:</h4>
                    <ul className="space-y-1">
                      {product.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {product.tags && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ingredients">
            <AccordionTrigger className="text-left">Ingredients</AccordionTrigger>
            <AccordionContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {product.ingredients}
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Always patch test before first use. Discontinue if irritation occurs.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="usage">
            <AccordionTrigger className="text-left">How to Use</AccordionTrigger>
            <AccordionContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.howToUse}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span className="text-sm">Cleanse your face thoroughly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span className="text-sm">Apply toner (if using)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span className="text-sm">Apply this cream</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <span className="text-sm">Follow with sunscreen (AM routine)</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reviews">
            <AccordionTrigger className="text-left">Customer Reviews</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {/* Review Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-2xl font-bold">4.8</div>
                    <div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">Based on 2,847 reviews</div>
                    </div>
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-4">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{review.name}</span>
                            {review.verified && (
                              <Badge variant="outline" className="text-xs">Verified</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{review.title}</h4>
                      <p className="text-sm text-muted-foreground">{review.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
        <TabsTrigger value="usage">How to Use</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <div className="prose max-w-none">
          <p className="text-muted-foreground leading-relaxed mb-6">
            {product.fullDescription || product.description}
          </p>
          
          {product.benefits && (
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Key Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {product.tags && (
            <div>
              <h3 className="font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="ingredients" className="mt-6">
        <div className="prose max-w-none">
          <p className="text-muted-foreground leading-relaxed mb-6">
            {product.ingredients}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Important Safety Information</h4>
            <p className="text-blue-800 text-sm">
              Always perform a patch test before first use. Apply a small amount to your inner wrist or behind your ear and wait 24 hours. 
              Discontinue use if any irritation, redness, or allergic reaction occurs.
            </p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="usage" className="mt-6">
        <div className="prose max-w-none">
          <p className="text-muted-foreground leading-relaxed mb-6">
            {product.howToUse}
          </p>
          
          <h3 className="font-semibold mb-4">Step-by-Step Application</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">1</span>
              <div>
                <h4 className="font-medium">Cleanse</h4>
                <p className="text-sm text-muted-foreground">Start with clean, dry skin. Use your favorite cleanser to remove makeup and impurities.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">2</span>
              <div>
                <h4 className="font-medium">Tone (Optional)</h4>
                <p className="text-sm text-muted-foreground">Apply toner if it's part of your routine. Wait until skin is slightly damp.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">3</span>
              <div>
                <h4 className="font-medium">Apply Cream</h4>
                <p className="text-sm text-muted-foreground">Take a small amount and gently pat into skin. Work from center of face outward.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">4</span>
              <div>
                <h4 className="font-medium">Sunscreen (AM Only)</h4>
                <p className="text-sm text-muted-foreground">Always follow with SPF 30+ sunscreen during your morning routine.</p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <div className="space-y-6">
          {/* Review Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-6 mb-4">
              <div className="text-4xl font-bold">4.8</div>
              <div>
                <div className="flex items-center mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-muted-foreground">Based on 2,847 reviews</div>
              </div>
            </div>
            
            {/* Rating Breakdown */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${rating === 5 ? 78 : rating === 4 ? 15 : rating === 3 ? 4 : rating === 2 ? 2 : 1}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12">
                    {rating === 5 ? 78 : rating === 4 ? 15 : rating === 3 ? 4 : rating === 2 ? 2 : 1}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-4">
            {mockReviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium">{review.name}</span>
                      {review.verified && (
                        <Badge variant="outline" className="text-xs">Verified Purchase</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{review.date}</span>
                </div>
                <h4 className="font-medium mb-2">{review.title}</h4>
                <p className="text-muted-foreground">{review.content}</p>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};