-- 1. Remove MANAGER role: convert existing MANAGER accounts to USER
UPDATE users SET role = 'USER' WHERE role = 'MANAGER';

-- 2. Add account type and verification status to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type VARCHAR(50) NOT NULL DEFAULT 'USER';
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50);

-- 3. Add product ownership and stock analytics to shop_items
ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS created_by_id BIGINT REFERENCES users(id);
ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS initial_quantity INT NOT NULL DEFAULT 0;
ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS purchase_count  INT NOT NULL DEFAULT 0;

-- 4. Back-fill purchase_count and initial_quantity for existing shop items
UPDATE shop_items si
SET    purchase_count  = (SELECT COUNT(*) FROM purchases p WHERE p.shop_item_id = si.id),
       initial_quantity = si.quantity + (SELECT COUNT(*) FROM purchases p WHERE p.shop_item_id = si.id)
WHERE  initial_quantity = 0;
