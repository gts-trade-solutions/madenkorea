import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  fullDescription: string;
  ingredients: string;
  howToUse: string;
}

interface ProductTabsSectionProps {
  product: Product;
}

// Mock reviews data
const mockReviews = [
  {
    id: 1,
    author: "Priya S.",
    rating: 5,
    date: "2024-01-15",
    title: "Amazing product!",
    content: "This cream has completely transformed my skin. The snail mucin really works wonders for hydration and healing acne scars.",
    helpful: 24,
    verified: true,
    skinType: "Combination"
  },
  {
    id: 2,
    author: "Arjun M.",
    rating: 4,
    date: "2024-01-10",
    title: "Good moisturizer",
    content: "Great for dry skin, but takes a bit of time to absorb. Overall satisfied with the results.",
    helpful: 18,
    verified: true,
    skinType: "Dry"
  },
  {
    id: 3,
    author: "Sneha K.",
    rating: 5,
    date: "2024-01-08",
    title: "Holy grail product!",
    content: "I've been using this for 3 months now and my skin has never looked better. Highly recommend for anyone with sensitive skin.",
    helpful: 31,
    verified: true,
    skinType: "Sensitive"
  }
];

export const ProductTabsSection = ({ product }: ProductTabsSectionProps) => {
  const averageRating = mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: mockReviews.filter(r => r.rating === rating).length,
    percentage: (mockReviews.filter(r => r.rating === rating).length / mockReviews.length) * 100
  }));

  return (
    <div className="mt-16">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="howto">How to Use</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({mockReviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <div className="prose max-w-none">
            <p className="text-base leading-relaxed text-muted-foreground">
              {product.fullDescription}
            </p>
            
            {/* Additional description content */}
            <div className="mt-6 space-y-4">
              <h4 className="text-lg font-semibold">Why Choose This Product?</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Clinically tested and dermatologist approved</li>
                <li>• Made with premium Korean ingredients</li>
                <li>• Suitable for all skin types including sensitive skin</li>
                <li>• Cruelty-free and ethically sourced</li>
                <li>• Free from harmful chemicals and parabens</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ingredients" className="mt-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-3">Full Ingredients List</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.ingredients}
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-3">Key Active Ingredients</h4>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="snail">
                  <AccordionTrigger>Snail Secretion Filtrate (92%)</AccordionTrigger>
                  <AccordionContent>
                    A powerful moisturizing and healing ingredient that helps repair damaged skin, reduce acne scars, and provide deep hydration. Rich in hyaluronic acid, glycolic acid, and antimicrobial peptides.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="hyaluronic">
                  <AccordionTrigger>Sodium Hyaluronate</AccordionTrigger>
                  <AccordionContent>
                    A smaller molecule form of hyaluronic acid that penetrates deeper into the skin to provide intense hydration and plumpness. Helps maintain skin elasticity and smoothness.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="allantoin">
                  <AccordionTrigger>Allantoin</AccordionTrigger>
                  <AccordionContent>
                    A soothing ingredient that helps calm irritated skin, promotes healing, and provides gentle exfoliation. Perfect for sensitive or problematic skin types.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="howto" className="mt-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-3">Application Instructions</h4>
              <p className="text-base text-muted-foreground mb-4">
                {product.howToUse}
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-3">Step-by-Step Guide</h4>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <h5 className="font-medium">Cleanse</h5>
                    <p className="text-sm text-muted-foreground">Start with a clean face using your preferred gentle cleanser.</p>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <h5 className="font-medium">Tone</h5>
                    <p className="text-sm text-muted-foreground">Apply your toner to balance skin pH and prepare for better absorption.</p>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <h5 className="font-medium">Apply Cream</h5>
                    <p className="text-sm text-muted-foreground">Take a pea-sized amount and gently pat into face and neck until fully absorbed.</p>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                    4
                  </div>
                  <div>
                    <h5 className="font-medium">Sun Protection (AM)</h5>
                    <p className="text-sm text-muted-foreground">Always follow with SPF 30+ sunscreen during daytime use.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use gentle patting motions instead of rubbing for better absorption</li>
                <li>• Can be used both morning and evening</li>
                <li>• Layer under heavier moisturizers if you have very dry skin</li>
                <li>• Results typically visible within 2-4 weeks of consistent use</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="space-y-8">
            {/* Rating Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                  <div>
                    <div className="flex items-center space-x-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">Based on {mockReviews.length} reviews</div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  Write a Review
                </Button>
              </div>
              
              <div className="space-y-2">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center space-x-3">
                    <span className="text-sm w-3">{rating}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-6">
              {mockReviews.map((review) => (
                <div key={review.id} className="border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{review.author}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {review.skinType} Skin
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  <h5 className="font-medium mb-2">{review.title}</h5>
                  <p className="text-muted-foreground mb-4">{review.content}</p>
                  
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground">
                      <ThumbsUp className="h-4 w-4" />
                      <span>Helpful ({review.helpful})</span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground">
                      <ThumbsDown className="h-4 w-4" />
                      <span>Not helpful</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Button variant="outline">
                Load More Reviews
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};