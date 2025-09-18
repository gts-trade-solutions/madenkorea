-- Update the tutorial video to be different from the hero video
UPDATE videos 
SET 
  title = 'Korean Glass Skin Routine Tutorial',
  description = 'Step-by-step guide to achieving radiant glass skin with Korean skincare',
  video_url = 'https://www.youtube.com/watch?v=G6FbdzK5-Tc',
  updated_at = now()
WHERE video_type = 'tutorial' AND is_active = true;