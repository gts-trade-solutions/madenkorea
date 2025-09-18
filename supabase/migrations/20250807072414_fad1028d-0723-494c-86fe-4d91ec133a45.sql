-- Update the hero video to match the Quench Botanics professional glass skin aesthetic
UPDATE videos 
SET 
  title = 'The Ultimate Glass Skin Routine',
  description = 'Discover the Korean beauty philosophy for clear, luminous, and hydrated skin that looks lit from within',
  video_url = 'https://www.youtube.com/watch?v=G6FbdzK5-Tc',
  updated_at = now()
WHERE video_type = 'hero' AND is_active = true;