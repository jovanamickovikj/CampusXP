-- Allow shop items to be created without an image
ALTER TABLE shop_items ALTER COLUMN image_url DROP NOT NULL;
ALTER TABLE shop_items ALTER COLUMN description DROP NOT NULL;
