-- Add Intervention Fields to Character Table

-- Add personality JSON field
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "personality" JSONB;

-- Add voice and emotional fields
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "voiceTone" TEXT NOT NULL DEFAULT 'neutral';
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "emotionalRange" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add trigger fields
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "triggerTopics" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "triggerWords" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add intervention configuration
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "interventionEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "interventionStyle" TEXT NOT NULL DEFAULT 'suggestion';
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "interventionFrequency" TEXT NOT NULL DEFAULT 'medium';

-- Add history tracking
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "lastIntervention" TIMESTAMP(3);
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "totalInterventions" INTEGER NOT NULL DEFAULT 0;

