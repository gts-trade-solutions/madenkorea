// Enhanced product type matching the backend fields specification
export interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  subCategory?: string;
  brand: string;
  images: string[];
  video?: string;
  price: number;
  discountPrice?: number;
  description: string;
  ingredients: string;
  howToUse: string;
  stockStatus: "In Stock" | "Only X Left" | "Out of Stock";
  stockQuantity?: number;
  tags: string[];
  rating: number;
  reviews: number;
  variants?: {
    size?: string[];
    color?: string[];
    type?: string[];
    volume?: string[];
    pack?: string[];
  };
  benefits?: string[];
  fullDescription?: string;
  productCode?: string;
  vendorId?: string;
  categoryId?: string;
  costPrice?: number;
  keywords?: string;
}

export interface VideoConfig {
  id: string;
  title: string;
  subtitle?: string;
  videoUrl: string;
  videoUrl2?: string;
  posterImage: string;
  ctaText: string;
  ctaLink: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  overlay?: boolean;
}

export interface ProductVideoCard {
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

export interface AdminConfig {
  heroVideo: VideoConfig;
  secondaryVideos: VideoConfig[];
  productVideos: ProductVideoCard[];
  siteSettings: {
    siteName: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
  };
}