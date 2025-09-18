import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Upload, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VideoData {
  id?: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  video_type: string;
  is_active: boolean;
  position?: number;
}

export const DynamicHeroManager = () => {
  const [heroVideos, setHeroVideos] = useState<VideoData[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const [editingVideo, setEditingVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewVideo, setPreviewVideo] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchHeroVideos();
  }, []);

  const fetchHeroVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('video_type', 'hero')
        .order('position');

      if (error) throw error;

      setHeroVideos(data || []);
      
      // Set the first active video as the current one
      const activeVideo = data?.find(v => v.is_active);
      if (activeVideo) {
        setActiveVideoId(activeVideo.id);
      }
    } catch (error) {
      console.error('Error fetching hero videos:', error);
      toast({
        title: "Error",
        description: "Failed to load hero videos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveVideo = async (video: VideoData) => {
    try {
      setLoading(true);
      
      if (video.id) {
        // Update existing video
        const { error } = await supabase
          .from('videos')
          .update({
            title: video.title,
            description: video.description,
            video_url: video.video_url,
            thumbnail_url: video.thumbnail_url,
            is_active: video.is_active,
            position: video.position,
          })
          .eq('id', video.id);

        if (error) throw error;
      } else {
        // Create new video
        const { error } = await supabase
          .from('videos')
          .insert([{
            ...video,
            video_type: 'hero',
            position: heroVideos.length,
          }]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Hero video ${video.id ? 'updated' : 'created'} successfully`,
      });

      fetchHeroVideos();
      setEditingVideo(null);
    } catch (error) {
      console.error('Error saving video:', error);
      toast({
        title: "Error",
        description: "Failed to save video",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Video deleted successfully",
      });

      fetchHeroVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const setAsActive = async (id: string) => {
    try {
      // First, deactivate all hero videos
      await supabase
        .from('videos')
        .update({ is_active: false })
        .eq('video_type', 'hero');

      // Then activate the selected one
      const { error } = await supabase
        .from('videos')
        .update({ is_active: true })
        .eq('id', id);

      if (error) throw error;

      setActiveVideoId(id);
      toast({
        title: "Success",
        description: "Active hero video updated",
      });

      fetchHeroVideos();
    } catch (error) {
      console.error('Error setting active video:', error);
      toast({
        title: "Error",
        description: "Failed to update active video",
        variant: "destructive",
      });
    }
  };

  if (loading && heroVideos.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center">Loading hero videos...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dynamic Hero Video Manager</h1>
          <p className="text-muted-foreground">Manage multiple hero videos for your homepage banner</p>
        </div>
        <Button onClick={() => setEditingVideo({
          title: "",
          description: "",
          video_url: "",
          thumbnail_url: "",
          video_type: "hero",
          is_active: false,
        })}>
          Add New Video
        </Button>
      </div>

      {/* Current Active Video */}
      {activeVideoId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-500" />
              <span>Currently Active Hero Video</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const activeVideo = heroVideos.find(v => v.id === activeVideoId);
              return activeVideo ? (
                <div className="flex items-center space-x-4">
                  {activeVideo.thumbnail_url && (
                    <img
                      src={activeVideo.thumbnail_url}
                      alt={activeVideo.title}
                      className="w-32 h-18 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{activeVideo.title}</h3>
                    <p className="text-sm text-muted-foreground">{activeVideo.description}</p>
                    <Badge variant="default" className="mt-2">Currently Live</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No active video selected</p>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {heroVideos.map((video) => (
          <Card key={video.id} className={`${video.is_active ? 'ring-2 ring-green-500' : ''}`}>
            <CardContent className="p-4">
              <div className="space-y-4">
                {video.thumbnail_url && (
                  <div className="relative">
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-32 object-cover rounded"
                    />
                    {video.is_active && (
                      <Badge className="absolute top-2 right-2 bg-green-500">Live</Badge>
                    )}
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium line-clamp-2">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {video.description}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={video.is_active ? "default" : "outline"}
                    onClick={() => setAsActive(video.id!)}
                    disabled={video.is_active}
                  >
                    {video.is_active ? "Active" : "Set Active"}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingVideo(video)}
                  >
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewVideo(video.video_url)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteVideo(video.id!)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {heroVideos.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Hero Videos</h3>
              <p>Create your first hero video to get started</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit/Create Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingVideo.id ? 'Edit Hero Video' : 'Create Hero Video'}
                <Button variant="ghost" onClick={() => setEditingVideo(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({...editingVideo, title: e.target.value})}
                  placeholder="Enter video title"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingVideo.description || ""}
                  onChange={(e) => setEditingVideo({...editingVideo, description: e.target.value})}
                  placeholder="Enter video description"
                />
              </div>

              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input
                  value={editingVideo.video_url}
                  onChange={(e) => setEditingVideo({...editingVideo, video_url: e.target.value})}
                  placeholder="https://example.com/video.mp4"
                />
              </div>

              <div className="space-y-2">
                <Label>Thumbnail URL (Optional)</Label>
                <Input
                  value={editingVideo.thumbnail_url || ""}
                  onChange={(e) => setEditingVideo({...editingVideo, thumbnail_url: e.target.value})}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={() => saveVideo(editingVideo)}
                  disabled={!editingVideo.title || !editingVideo.video_url}
                >
                  {editingVideo.id ? 'Update Video' : 'Create Video'}
                </Button>
                <Button variant="outline" onClick={() => setEditingVideo(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Video Modal */}
      {previewVideo && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Video Preview
                <Button variant="ghost" onClick={() => setPreviewVideo("")}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <video
                src={previewVideo}
                controls
                className="w-full h-64 object-cover rounded"
                autoPlay
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};