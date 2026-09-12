-- Migration: 001_add_risk_fields_to_suppliers.sql
-- Description: Add risk_score (0-100) and risk_reason (1-sentence LLM justification) columns to suppliers table

-- For PostgreSQL / Supabase:
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS risk_score FLOAT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS risk_reason TEXT DEFAULT NULL;

-- Create index on risk_score for performant sorting/filtering
CREATE INDEX IF NOT EXISTS idx_suppliers_risk_score ON suppliers(risk_score DESC);
