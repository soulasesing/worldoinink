-- CreateEnum
CREATE TYPE "ExampleType" AS ENUM ('NARRATIVE_VOICE', 'DESCRIPTIVE', 'DIALOGUE', 'EMOTIONAL', 'SIGNATURE_STYLE', 'OPENING', 'TRANSITION');

-- CreateTable
CREATE TABLE "WritingStyle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "narrativeVoice" TEXT NOT NULL DEFAULT 'third-person',
    "preferredTense" TEXT NOT NULL DEFAULT 'past',
    "avgSentenceLength" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgParagraphLength" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vocabularyLevel" TEXT NOT NULL DEFAULT 'intermediate',
    "dominantTones" TEXT[],
    "writingPace" TEXT NOT NULL DEFAULT 'moderate',
    "descriptiveDensity" TEXT NOT NULL DEFAULT 'moderate',
    "signaturePhrases" JSONB NOT NULL DEFAULT '{}',
    "favoriteWords" JSONB NOT NULL DEFAULT '{}',
    "avoidedWords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dialogueStyle" TEXT NOT NULL DEFAULT 'natural',
    "dialogueFrequency" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "similarAuthors" JSONB NOT NULL DEFAULT '[]',
    "literaryMovement" TEXT,
    "analyzedStories" INTEGER NOT NULL DEFAULT 0,
    "totalWordsAnalyzed" INTEGER NOT NULL DEFAULT 0,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastAnalyzed" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WritingStyle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StyleExample" (
    "id" TEXT NOT NULL,
    "styleId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "context" TEXT,
    "storyTitle" TEXT,
    "exampleType" "ExampleType" NOT NULL,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StyleExample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WritingStyle_userId_key" ON "WritingStyle"("userId");

-- CreateIndex
CREATE INDEX "WritingStyle_userId_idx" ON "WritingStyle"("userId");

-- CreateIndex
CREATE INDEX "StyleExample_styleId_idx" ON "StyleExample"("styleId");

-- CreateIndex
CREATE INDEX "StyleExample_exampleType_idx" ON "StyleExample"("exampleType");

-- AddForeignKey
ALTER TABLE "WritingStyle" ADD CONSTRAINT "WritingStyle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleExample" ADD CONSTRAINT "StyleExample_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "WritingStyle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

