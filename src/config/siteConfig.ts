/**
 * This file contains comprehensive configurations for the Consumer Innovations e-commerce platform.
 * It includes all admin-configurable settings, product data structures, and site configurations.
 */

import {
  Product,
  VideoConfig,
  ProductVideoCard,
  AdminConfig,
} from "@/types/product";

// Master product categories as specified in requirements
export const PRODUCT_CATEGORIES = [
  "Skin Care",
  "Make Up",
  "Hair Care",
  "Body Care",
  "Men Care",
  "Beauty Tools",
  "Health & Personal Care",
  "Perfume & Deodorant",
  "Life & Home",
  "Baby",
  "Food & Beverages",
  "Others",
  "K-POP",
  "Exclusive",
] as const;

// Enhanced product data with all backend fields
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "COSRX Advanced Snail 92 All In One Cream",
    slug: "cosrx-advanced-snail-92-cream",
    category: "Skin Care",
    subCategory: "Moisturizers",
    brand: "COSRX",
    images: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
    ],
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    price: 1599,
    discountPrice: 1199,
    description:
      "Advanced snail secretion filtrate 92% for ultimate skin repair and hydration",
    ingredients:
      "Snail Secretion Filtrate, Betaine, Caprylic/Capric Triglyceride, Cetearyl Olivate, Sorbitan Olivate, Sodium Hyaluronate, Allantoin, Arginine, Dimethicone, Carbomer, Sodium Polyacrylate",
    howToUse:
      "After cleansing and toning, apply an appropriate amount to the face and neck. Gently pat until fully absorbed. Use morning and evening.",
    stockStatus: "In Stock",
    stockQuantity: 45,
    tags: ["hydrating", "repairing", "korean", "bestseller"],
    rating: 4.8,
    reviews: 2847,
    variants: {
      size: ["50ml", "100ml"],
      type: ["Original", "Sensitive Skin Formula"],
      color: ["Natural"],
      volume: ["Standard", "Travel Size"],
      pack: ["Single", "Duo Pack"],
    },
    benefits: [
      "Soothes irritated skin",
      "Provides deep moisturization",
      "Improves skin texture",
    ],
    fullDescription:
      "The COSRX Advanced Snail 92 All In One Cream contains 92% snail secretion filtrate to repair and regenerate damaged skin while providing deep hydration. This cream helps improve skin texture, reduces acne scars, and provides long-lasting moisture without feeling heavy or greasy.",
    productCode: "CRX-SNAIL-92",
    vendorId: "COSRX-KR-001",
    categoryId: "skin-care-moisturizer",
    costPrice: 800,
    keywords:
      "snail cream, korean skincare, moisturizer, acne scars, hydration",
  },
  {
    id: 2,
    name: "LANEIGE Water Bank Blue Hyaluronic Cream",
    slug: "laneige-water-bank-blue-hyaluronic-cream",
    category: "Skin Care",
    subCategory: "Moisturizers",
    brand: "LANEIGE",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    price: 2899,
    discountPrice: 2199,
    description:
      "Revolutionary Blue Hyaluronic Acid for 72-hour intense hydration",
    ingredients:
      "Water, Glycerin, Dimethicone, Niacinamide, Hyaluronic Acid, Blue Spirulina Extract, Ceramide NP, Panthenol, Allantoin",
    howToUse:
      "Apply evenly to face and neck after cleansing and toning. Use morning and evening.",
    stockStatus: "Only X Left",
    stockQuantity: 8,
    tags: ["hydrating", "premium", "hyaluronic", "korean"],
    rating: 4.9,
    reviews: 3456,
    variants: {
      size: ["50ml", "70ml"],
      type: ["Original", "Intensive"],
      pack: ["Single", "Value Set"],
    },
    benefits: [
      "72-hour continuous hydration",
      "Strengthens skin barrier",
      "Clinically tested",
    ],
    fullDescription:
      "LANEIGE's innovative Blue Hyaluronic Acid technology delivers deep, long-lasting hydration for up to 72 hours. This premium moisturizer strengthens the skin barrier and provides intense moisture without greasiness.",
    productCode: "LNG-WB-BH-70",
    vendorId: "LANEIGE-KR-002",
    categoryId: "skin-care-moisturizer",
    costPrice: 1500,
    keywords:
      "laneige, hyaluronic acid, hydration, premium skincare, korean beauty",
  },
];

// Default admin configuration
export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  heroVideo: {
    id: "hero-main",
    title: "Discover Authentic Korean Beauty",
    subtitle: "Premium Consumer Innovations products directly from Korea",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoUrl2: "",
    posterImage: "/api/placeholder/1920/1080",
    ctaText: "Shop Now",
    ctaLink: "#products",
    autoplay: true,
    muted: true,
    loop: true,
    overlay: true,
  },
  secondaryVideos: [
    {
      id: "secondary-skincare",
      title: "Korean Skincare Routine",
      subtitle: "Learn the 10-step Korean skincare routine",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      posterImage: "/placeholder.svg",
      ctaText: "Learn More",
      ctaLink: "#skincare-guide",
      autoplay: false,
      muted: true,
      loop: false,
      overlay: true,
    },
  ],
  productVideos: [
    {
      id: "video-cosrx",
      productName: "COSRX Advanced Snail 92 All In One Cream",
      productBrand: "COSRX",
      productPrice: "₹1,199",
      originalPrice: "₹1,599",
      rating: 4.8,
      reviews: 2847,
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      posterImage: "/placeholder.svg",
      badge: "BESTSELLER",
      description:
        "Revolutionary snail secretion filtrate for ultimate skin repair and deep hydration.",
      benefits: [
        "Repairs damaged skin barrier",
        "Provides 24-hour hydration",
        "Reduces acne scars",
      ],
      ctaText: "Buy Now",
      ctaLink: "/product/1",
    },
  ],
  siteSettings: {
    siteName: "Consumer Innovations Store",
    logo: "/api/placeholder/400/400",
    primaryColor: "#ef4444",
    secondaryColor: "#ec4899",
  },
};

// SEO configurations
export const SEO_CONFIG = {
  defaultTitle: "Consumer Innovations Store | Authentic Korean Beauty Products",
  defaultDescription:
    "Discover the best Korean beauty products. Shop authentic Consumer Innovations skincare, makeup, and more from top Korean brands.",
  defaultKeywords:
    "korean beauty, Consumer Innovations, skincare, korean skincare, korean makeup, korean cosmetics",
  defaultImage: "/api/placeholder/1200/630",
  siteName: "Consumer Innovations Store",
  twitterHandle: "@kbeautystore",
  facebookAppId: "your-facebook-app-id",
};

// Social media links
export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/kbeautystore",
  facebook: "https://facebook.com/kbeautystore",
  youtube: "https://youtube.com/@kbeautystore",
  twitter: "https://twitter.com/kbeautystore",
};

// Trust badges and certifications
export const TRUST_BADGES = [
  {
    icon: "🚚",
    title: "Free Shipping",
    description: "on orders ₹1999+",
  },
  {
    icon: "🛡️",
    title: "100% Authentic",
    description: "Guaranteed genuine products",
  },
  {
    icon: "↩️",
    title: "Easy Returns",
    description: "30-day return policy",
  },
  {
    icon: "📞",
    title: "24/7 Support",
    description: "Customer service",
  },
];

// Feature flags for enabling/disabling functionality
export const FEATURE_FLAGS = {
  enableReviews: true,
  enableWishlist: true,
  enableCompare: true,
  enableQuickView: true,
  enableSocialShare: true,
  enableLazyLoading: true,
  enableVideoAutoplay: true,
  enableProductRecommendations: true,
  enableBulkDiscounts: true,
  enableGuestCheckout: true,
};

// Payment and shipping configuration
export const COMMERCE_CONFIG = {
  currency: "INR",
  currencySymbol: "₹",
  freeShippingThreshold: 1999,
  taxRate: 0.18, // 18% GST
  shippingRates: {
    standard: 99,
    express: 199,
    overnight: 299,
  },
  paymentMethods: ["razorpay", "paytm", "phonepe", "googlepay", "upi"],
  supportedRegions: ["IN"],
};

export default {
  PRODUCT_CATEGORIES,
  SAMPLE_PRODUCTS,
  DEFAULT_ADMIN_CONFIG,
  SEO_CONFIG,
  SOCIAL_LINKS,
  TRUST_BADGES,
  FEATURE_FLAGS,
  COMMERCE_CONFIG,
};
