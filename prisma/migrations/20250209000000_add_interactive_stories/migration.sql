-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('CONTENT', 'DECISION', 'ENDING');

-- AlterTable: Add isInteractive to Story
ALTER TABLE "Story" ADD COLUMN IF NOT EXISTS "isInteractive" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: StoryNode
CREATE TABLE "StoryNode" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "nodeType" "NodeType" NOT NULL DEFAULT 'CONTENT',
    "position" INTEGER NOT NULL DEFAULT 0,
    "isStart" BOOLEAN NOT NULL DEFAULT false,
    "isEnding" BOOLEAN NOT NULL DEFAULT false,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Choice
CREATE TABLE "Choice" (
    "id" TEXT NOT NULL,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "emoji" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "timesChosen" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Choice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoryNode_storyId_idx" ON "StoryNode"("storyId");
CREATE INDEX "StoryNode_isStart_idx" ON "StoryNode"("isStart");

-- CreateIndex
CREATE INDEX "Choice_fromNodeId_idx" ON "Choice"("fromNodeId");
CREATE INDEX "Choice_toNodeId_idx" ON "Choice"("toNodeId");

-- AddForeignKey: StoryNode -> Story
ALTER TABLE "StoryNode" ADD CONSTRAINT "StoryNode_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Choice -> StoryNode (from)
ALTER TABLE "Choice" ADD CONSTRAINT "Choice_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "StoryNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Choice -> StoryNode (to)
ALTER TABLE "Choice" ADD CONSTRAINT "Choice_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "StoryNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
