import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface HowToVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  views: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface HowToVideoGridProps {
  videos: HowToVideo[];
  className?: string;
}

export const HowToVideoGrid = ({ videos, className }: HowToVideoGridProps) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const categories = [
    "All",
    ...Array.from(new Set(videos.map((v) => v.category))),
  ];

  const filteredVideos =
    selectedCategory === "All"
      ? videos
      : videos.filter((v) => v.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const openVideoModal = (videoId: string) => {
    setSelectedVideo(videoId);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  return (
    <div className={cn("", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Consumer Innovations Tutorials
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Master your skincare routine with our step-by-step video guides
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex justify-center mb-8">
        <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="rounded-md"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.map((video) => (
          <Card
            key={video.id}
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            onClick={() => openVideoModal(video.id)}
          >
            <div className="relative aspect-video">
              <video
                src={video.videoUrl}
                poster={video.thumbnail}
                muted
                loop
                playsInline
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => e.currentTarget.pause()}
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="icon"
                  className="h-14 w-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                >
                  <Play className="h-6 w-6 text-white ml-1" />
                </Button>
              </div>

              {/* Duration Badge */}
              <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                <Clock className="h-3 w-3 mr-1" />
                {video.duration}
              </Badge>

              {/* Difficulty Badge */}
              <Badge
                className={cn(
                  "absolute top-2 left-2",
                  getDifficultyColor(video.difficulty)
                )}
              >
                {video.difficulty}
              </Badge>
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {video.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {video.description}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {video.views}
                </span>
                <Badge variant="outline" className="text-xs">
                  {video.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeVideoModal}
        >
          <div
            className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video">
              <iframe
                src={videos.find((v) => v.id === selectedVideo)?.videoUrl}
                className="w-full h-full"
                allowFullScreen
                title="Tutorial Video"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">
                {videos.find((v) => v.id === selectedVideo)?.title}
              </h3>
              <p className="text-muted-foreground">
                {videos.find((v) => v.id === selectedVideo)?.description}
              </p>
              <Button className="mt-4" onClick={closeVideoModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
