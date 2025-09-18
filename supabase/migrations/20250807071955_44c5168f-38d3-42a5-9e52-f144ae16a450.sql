-- Update the video to a viral Anua-style Korean skincare video
UPDATE videos 
SET 
  title = 'VIRAL Korean Skincare Products from ANUA',
  description = 'Discover the trending Korean skincare products that everyone is talking about',
  video_url = 'https://www.youtube.com/watch?v=NDISNKCqxI4',
  updated_at = now()
WHERE video_type = 'hero' AND is_active = true;