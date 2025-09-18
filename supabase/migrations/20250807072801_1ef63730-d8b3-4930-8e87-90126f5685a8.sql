-- Check current videos and their types
SELECT title, video_type, video_url, is_active FROM videos WHERE is_active = true ORDER BY video_type, position;