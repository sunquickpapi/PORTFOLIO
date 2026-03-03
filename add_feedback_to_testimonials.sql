-- Migration to add feedback column to testimonials table
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS feedback TEXT;
