import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
// import { AutoScrollVideo } from "./video-sections/AutoScrollVideo";
import { AutoScrollVideo } from "@/components/video-sections/AutoScrollVideo";
import { SplitBanner } from "@/components/video-sections/SplitBanner";

interface VideoData {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  video_type: string;
  tags?: string[];
  position?: number;
}

export const Testimonials = () => {
  const [tutorialVideo, setTutorialVideo] = useState<VideoData | null>(null);
  const [testimonialVideo, setTestimonialVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideosFromCMS();
  }, []);

  const fetchVideosFromCMS = async () => {
    try {
      const { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .eq('is_active', true)
        .order('position');

      if (error) {
        console.error('Error fetching videos:', error);
        return;
      }

      // Categorize videos by type - exclude hero videos from this section
      const tutorial = videos.find(video => video.video_type === 'tutorial');
      const testimonial = videos.find(video => video.video_type === 'testimonial');

      setTutorialVideo(tutorial || null);
      setTestimonialVideo(testimonial || null);

    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert YouTube URL to embed format
  const convertYouTubeUrl = (url: string) => {
    if (!url) return url;

    // Convert YouTube watch URL to embed URL
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${youtubeMatch[1]}`;
    }

    return url;
  };

  if (loading) {
    return (
      <div className="">
        <div className="container mx-auto px-4">
          <div className="h-30 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="space-y-10 py-10">
        {/* Tutorial Video */}
        {tutorialVideo && (
          <section className="container mx-auto px-4">
            <AutoScrollVideo
              videoUrl={convertYouTubeUrl(tutorialVideo.video_url)}
              posterImage={tutorialVideo.thumbnail_url || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200"}
              title={tutorialVideo.title}
              description={tutorialVideo.description || ""}
              ctaText="Buy Now"
              ctaLink="/products"
            />
          </section>
        )}

        {/* Testimonial Video */}
        {testimonialVideo && (
          <section className="container mx-auto px-4 ">
            <SplitBanner
              videoUrl={convertYouTubeUrl(testimonialVideo.video_url)}
              posterImage={
                testimonialVideo.thumbnail_url ||
                "https://images.unsplash.com/photo-1505575972945-2804a5b68a56?q=80&w=1200"
              }
              title="Plasma Sanitizer Sprayer "
              subtitle="Plasma Sanitizer Sprayer"
              description=""
              ctaText="Shop Now"
              ctaSecondaryText="Explore Bestsellers"
              ctaLink="/products?brand=MEDI%20WATER"
              layout="right"
            />
          </section>


        )}
      </div>


      <section className="container mx-auto px-4">
        <AutoScrollVideo
          videoUrl="https://www.youtube.com/embed/_LDdrqlSTCE?autoplay=1&mute=1&playsinline=1&loop=1&playlist=_LDdrqlSTCE&rel=0&modestbranding=1"
          posterImage="https://img.youtube.com/vi/_LDdrqlSTCE/hqdefault.jpg"
          title="Medi Water"
          description=""
          ctaText="Buy Now"
          ctaLink="/products"
        />
      </section>



      <section className="container mx-auto px-4 mt-10">
        <SplitBanner
          title="Baby Products"
          subtitle="Baby Products"
          description=""
          ctaText="Shop Now"
          ctaSecondaryText="Explore Bestsellers"
          ctaLink="/products?brand=MEDI%20WATER"
          layout="right"
          videoUrl="https://www.youtube.com/embed/SqeIZRLWDDI?autoplay=1&mute=1&playsinline=1&loop=1&playlist=SqeIZRLWDDI&rel=0&modestbranding=1"
          posterImage="https://cdn.example.com/images/plasma-sanitizer-poster.jpg"

        />
      </section>



      <section className="container mx-auto px-4 mt-10">
  <AutoScrollVideo
    videoUrl="https://www.youtube.com/embed/sd3ymTJXuQ0?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1"
    posterImage="https://img.youtube.com/vi/sd3ymTJXuQ0/hqdefault.jpg"
    title=""
    description=""
    ctaText="Buy Now"
    ctaLink="/products"
  />
</section>

    </>
  );
};