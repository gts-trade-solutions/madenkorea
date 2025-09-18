-- Restore the original Anua video with water running for the hero banner
UPDATE videos 
SET 
  title = 'Anua Heartleaf Collection',
  description = 'Soothing Korean skincare with natural heartleaf ingredients and flowing water aesthetics',
  video_url = 'https://youtu.be/MnMZp28HNjk',
  updated_at = now()
WHERE video_type = 'hero' AND is_active = true;