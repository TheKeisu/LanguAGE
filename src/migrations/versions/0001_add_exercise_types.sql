-- Run once against the existing PostgreSQL database before starting this version
-- of the API. Existing exercises become free-text exercises with no options.
ALTER TABLE exercise
    ADD COLUMN IF NOT EXISTS exercise_type VARCHAR(30) NOT NULL DEFAULT 'TEXT';

ALTER TABLE exercise
    ADD COLUMN IF NOT EXISTS options JSONB;
