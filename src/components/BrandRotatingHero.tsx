import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Import brand logos
import anuaLogo from "@/assets/brand-logos/anua-logo.png";
import beautyOfJoseonLogo from "@/assets/brand-logos/beauty-of-joseon-logo.png";
import etudeLogo from "@/assets/brand-logos/etude-logo.png";
import etudeHouseLogo from "@/assets/brand-logos/etude-house-logo.png";
import innisfreeLogo from "@/assets/brand-logos/innisfree-logo.png";
import laneigeLogo from "@/assets/brand-logos/laneige-logo.png";
import lilyfieldLogo from "@/assets/brand-logos/lilyfield-logo.png";
import mixsoonLogo from "@/assets/brand-logos/mixsoon-logo.png";
import someByMiLogo from "@/assets/brand-logos/some-by-mi-logo.png";

interface Brand {
  name: string;
  logo_url?: string;
}

// Logo mapping for local assets
const logoMap: Record<string, string> = {
  anua: anuaLogo,
  "beauty of joseon": beautyOfJoseonLogo,
  etude: etudeLogo,
  "etude house": etudeHouseLogo,
  innisfree: innisfreeLogo,
  laneige: laneigeLogo,
  lilyfield: lilyfieldLogo,
  mixsoon: mixsoonLogo,
  "some by mi": someByMiLogo,
};

export const BrandRotatingHero = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const { toast } = useToast();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data: brandsData } = await supabase
          .from("brands")
          .select("name, logo_url")
          .eq("is_active", true)
          .order("position");

        if (brandsData && brandsData.length > 0) {
          const brandsWithAssets = brandsData.map((brand) => ({
            ...brand,
            logo_url: logoMap[brand.name.toLowerCase()] || brand.logo_url,
          }));
          setBrands(brandsWithAssets);
          setLastUpdate(Date.now());
        } else {
          setBrands([]);
        }
      } catch (error) {
        console.error("❌ BrandHero - Error fetching brands:", error);
        toast({
          title: "Error",
          description: "Failed to load brands. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();

    // live updates
    const subscription = supabase
      .channel("brands-realtime-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "brands" },
        async () => {
          try {
            const { data: brandsData } = await supabase
              .from("brands")
              .select("name, logo_url")
              .eq("is_active", true)
              .order("position");

            if (brandsData) {
              const brandsWithAssets = brandsData.map((brand) => ({
                ...brand,
                logo_url: logoMap[brand.name.toLowerCase()] || brand.logo_url,
              }));

              setBrands((prev) => {
                const changed =
                  JSON.stringify(prev) !== JSON.stringify(brandsWithAssets);
                if (changed) {
                  setLastUpdate(Date.now());
                  return brandsWithAssets;
                }
                return prev;
              });
            }
          } catch (error) {
            console.error("❌ Error updating brands:", error);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  if (loading) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Loading Trusted Brands...
            </h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-4">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-muted rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const logos = brands.filter((b) => b.logo_url);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Subtle floating blobs (keep if you like; they’re behind and very light) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-accent/20 rounded-full blur-xl animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-2">
          {/* <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <span className="text-sm sm:text-lg md:text-2xl font-bold text-primary/80 tracking-wider uppercase">
              Trusted Partners
            </span>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300" />
          </div> */}

          <h2 className="font-bricolage font-extrabold text-2xl sm:text-5xl md:text-5xl leading-[1.1] tracking-tight mb-2 sm:mb-3 text-foreground">
            대한 드리유 - KOREA'S BEST FOR YOU
          </h2>

          {/* <p className="max-w-xl text-sm sm:text-base md:text-lg mx-auto">
            Authentic Korean beauty from the most trusted brands in the industry
          </p> */}
        </div>

        {/* Auto-swiper / marquee – no ash background */}
        {/* Auto-swiper / marquee — solid blue background */}
        {/* <div
          className="relative overflow-hidden rounded-2xl py-6"
          style={{ backgroundColor: "rgb(0, 132, 214)" }}
        >
          <div
            className="marquee-track flex items-center gap-8 will-change-transform [animation-duration:30s] hover:[animation-play-state:paused]"
            style={{ ["--marquee-speed" as any]: "30s" }}
          >
            {([...logos, ...logos] as Brand[]).map((brand, i) => (
              <button
                key={`${brand.name}-${i}-${lastUpdate}`}
                onClick={() =>
                  (window.location.href = `/products?brand=${encodeURIComponent(
                    brand.name
                  )}`)
                }
                className="shrink-0 focus:outline-none"
                aria-label={brand.name}
                title={brand.name}
              >
                <div className="rounded-lg bg-black-500 border border-black/10 shadow-2xl flex items-center justify-center">
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="h-10 sm:h-12 md:h-16 lg:h-20 w-auto object-contain rounded-lg"
                    onError={(e) =>
                      ((e.currentTarget as HTMLImageElement).style.display =
                        "none")
                    }
                  />
                </div>
              </button>
            ))}
          </div>
        </div> */}

        {/* Optional CTA */}
        {/* <div className="text-center mt-8">
          <Button variant="outline" onClick={() => (window.location.href = "/products")} className="group">
            Browse All Products
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div> */}
      </div>

      {/* Component-scoped styles for the marquee */}
      <style>{`
        /* Auto-swiper marquee */
        .marquee-track {
          --marquee-speed: 30s; /* fallback */
          display: flex;
          width: max-content;
          animation-name: brand-marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-duration: var(--marquee-speed);
        }

        /* Pause on hover or when a child is focused (accessibility) */
        .marquee-track:hover,
        .marquee-track:focus-within {
          animation-play-state: paused;
        }

        @keyframes brand-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } /* because we duplicated the content */
        }
      `}</style>
    </div>
  );
};
