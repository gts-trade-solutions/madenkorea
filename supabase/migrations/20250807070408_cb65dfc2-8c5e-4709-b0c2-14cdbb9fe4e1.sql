-- Update brand logos with new high-quality generated images
UPDATE brands SET logo_url = '/src/assets/brand-logos/anua-logo.png' WHERE LOWER(TRIM(name)) = 'anua';
UPDATE brands SET logo_url = '/src/assets/brand-logos/beauty-of-joseon-logo.png' WHERE LOWER(TRIM(name)) = 'beauty of joseon';
UPDATE brands SET logo_url = '/src/assets/brand-logos/etude-logo.png' WHERE LOWER(TRIM(name)) = 'etude';
UPDATE brands SET logo_url = '/src/assets/brand-logos/etude-house-logo.png' WHERE LOWER(TRIM(name)) = 'etude house';
UPDATE brands SET logo_url = '/src/assets/brand-logos/innisfree-logo.png' WHERE LOWER(TRIM(name)) = 'innisfree';
UPDATE brands SET logo_url = '/src/assets/brand-logos/laneige-logo.png' WHERE LOWER(TRIM(name)) = 'laneige';
UPDATE brands SET logo_url = '/src/assets/brand-logos/lilyfield-logo.png' WHERE LOWER(TRIM(name)) = 'lilyfield';
UPDATE brands SET logo_url = '/src/assets/brand-logos/mixsoon-logo.png' WHERE LOWER(TRIM(name)) = 'mixsoon';
UPDATE brands SET logo_url = '/src/assets/brand-logos/some-by-mi-logo.png' WHERE LOWER(TRIM(name)) = 'some by mi';