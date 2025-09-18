import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Video,
  Image as ImageIcon,
  Save,
  Play,
  Upload,
  Eye,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

interface VideoConfig {
  id: string;
  title: string;
  subtitle?: string;
  videoUrl: string;
  videoUrl2?: string;
  posterImage: string;
  ctaText: string;
  ctaLink: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  overlay: boolean;
}

export const VideoManager = () => {
  const [heroVideo, setHeroVideo] = useState<VideoConfig>({
    id: "hero",
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
  });

  const [secondaryVideos, setSecondaryVideos] = useState<VideoConfig[]>([
    {
      id: "secondary-1",
      title: "Korean Skincare Routine",
      subtitle: "Learn the 10-step Korean skincare routine",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      videoUrl2: "",
      posterImage: "/placeholder.svg",
      ctaText: "Learn More",
      ctaLink: "#skincare-guide",
      autoplay: false,
      muted: true,
      loop: false,
      overlay: true,
    },
  ]);

  const handleSaveHeroVideo = () => {
    // Save hero video configuration
    toast.success("Hero video updated successfully!");
  };

  const handleSaveSecondaryVideo = (index: number) => {
    // Save secondary video configuration
    toast.success(`Secondary video ${index + 1} updated successfully!`);
  };

  const addSecondaryVideo = () => {
    const newVideo: VideoConfig = {
      id: `secondary-${secondaryVideos.length + 1}`,
      title: "New Video",
      subtitle: "",
      videoUrl: "",
      videoUrl2: "",
      posterImage: "/placeholder.svg",
      ctaText: "Learn More",
      ctaLink: "#",
      autoplay: false,
      muted: true,
      loop: false,
      overlay: true,
    };
    setSecondaryVideos([...secondaryVideos, newVideo]);
  };

  const removeSecondaryVideo = (index: number) => {
    setSecondaryVideos(secondaryVideos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Hero Video Configuration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Hero Video Banner
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure the main hero video that appears at the top of your
              homepage
            </p>
          </div>
          <Button onClick={handleSaveHeroVideo}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hero-title">Title</Label>
              <Input
                id="hero-title"
                value={heroVideo.title}
                onChange={(e) =>
                  setHeroVideo({ ...heroVideo, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-subtitle">Subtitle</Label>
              <Input
                id="hero-subtitle"
                value={heroVideo.subtitle || ""}
                onChange={(e) =>
                  setHeroVideo({ ...heroVideo, subtitle: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-video-url">Primary Video URL</Label>
              <Input
                id="hero-video-url"
                value={heroVideo.videoUrl}
                onChange={(e) =>
                  setHeroVideo({ ...heroVideo, videoUrl: e.target.value })
                }
                placeholder="https://youtube.com/embed/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-video-url2">Fallback Video URL</Label>
              <Input
                id="hero-video-url2"
                value={heroVideo.videoUrl2 || ""}
                onChange={(e) =>
                  setHeroVideo({ ...heroVideo, videoUrl2: e.target.value })
                }
                placeholder="Alternative video source"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-poster">Poster Image URL</Label>
              <Input
                id="hero-poster"
                value={heroVideo.posterImage}
                onChange={(e) =>
                  setHeroVideo({ ...heroVideo, posterImage: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-cta-text">CTA Button Text</Label>
              <Input
                id="hero-cta-text"
                value={heroVideo.ctaText}
                onChange={(e) =>
                  setHeroVideo({ ...heroVideo, ctaText: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-cta-link">CTA Link</Label>
              <Input
                id="hero-cta-link"
                value={heroVideo.ctaLink}
                onChange={(e) =>
                  setHeroVideo({ ...heroVideo, ctaLink: e.target.value })
                }
                placeholder="#section or https://..."
              />
            </div>
          </div>

          {/* Video Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Video Settings</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="hero-autoplay"
                  checked={heroVideo.autoplay}
                  onCheckedChange={(checked) =>
                    setHeroVideo({ ...heroVideo, autoplay: checked })
                  }
                />
                <Label htmlFor="hero-autoplay">Autoplay</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="hero-muted"
                  checked={heroVideo.muted}
                  onCheckedChange={(checked) =>
                    setHeroVideo({ ...heroVideo, muted: checked })
                  }
                />
                <Label htmlFor="hero-muted">Muted</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="hero-loop"
                  checked={heroVideo.loop}
                  onCheckedChange={(checked) =>
                    setHeroVideo({ ...heroVideo, loop: checked })
                  }
                />
                <Label htmlFor="hero-loop">Loop</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="hero-overlay"
                  checked={heroVideo.overlay}
                  onCheckedChange={(checked) =>
                    setHeroVideo({ ...heroVideo, overlay: checked })
                  }
                />
                <Label htmlFor="hero-overlay">Show Overlay</Label>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Play className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Video Preview</p>
                <p className="text-xs text-gray-400">{heroVideo.title}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Videos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Secondary Video Banners
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure additional video banners for your site
            </p>
          </div>
          <Button onClick={addSecondaryVideo}>
            <Upload className="h-4 w-4 mr-2" />
            Add Video
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {secondaryVideos.map((video, index) => (
            <Card key={video.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Secondary Video {index + 1}</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSaveSecondaryVideo(index)}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeSecondaryVideo(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={video.title}
                    onChange={(e) => {
                      const updated = [...secondaryVideos];
                      updated[index] = { ...video, title: e.target.value };
                      setSecondaryVideos(updated);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={video.subtitle || ""}
                    onChange={(e) => {
                      const updated = [...secondaryVideos];
                      updated[index] = { ...video, subtitle: e.target.value };
                      setSecondaryVideos(updated);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input
                    value={video.videoUrl}
                    onChange={(e) => {
                      const updated = [...secondaryVideos];
                      updated[index] = { ...video, videoUrl: e.target.value };
                      setSecondaryVideos(updated);
                    }}
                    placeholder="https://youtube.com/embed/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA Text</Label>
                  <Input
                    value={video.ctaText}
                    onChange={(e) => {
                      const updated = [...secondaryVideos];
                      updated[index] = { ...video, ctaText: e.target.value };
                      setSecondaryVideos(updated);
                    }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Site-wide Video Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Global Video Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Video Quality</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="auto">Auto (Recommended)</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Fallback Behavior</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="poster">Show Poster Image</option>
                <option value="placeholder">Show Placeholder</option>
                <option value="hide">Hide Section</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="lazy-loading" defaultChecked />
            <Label htmlFor="lazy-loading">Enable Lazy Loading for Videos</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="preload-metadata" defaultChecked />
            <Label htmlFor="preload-metadata">Preload Video Metadata</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
