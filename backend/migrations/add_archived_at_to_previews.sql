-- Migration: Add archived_at column to lovable_previews table
-- Purpose: Track when previews are archived for 30-day deletion workflow

ALTER TABLE lovable_previews ADD COLUMN archived_at DATETIME;

-- Verify the column was added
-- SELECT * FROM lovable_previews LIMIT 1;
