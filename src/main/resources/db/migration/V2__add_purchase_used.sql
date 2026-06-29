-- Add used/usedAt columns to purchases table for inventory tracking
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS used BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS used_at TIMESTAMP;
