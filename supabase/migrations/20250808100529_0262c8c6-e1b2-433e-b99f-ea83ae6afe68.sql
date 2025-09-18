-- Clear recently created product media links that are incorrectly assigned
-- Only remove links created in the last 2 hours to avoid affecting older, correct assignments
DELETE FROM product_media WHERE created_at > now() - interval '2 hours';