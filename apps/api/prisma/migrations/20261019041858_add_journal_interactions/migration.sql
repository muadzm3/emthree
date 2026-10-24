-- CreateTable
CREATE TABLE "JournalLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalComment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalBookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JournalLike_journalId_idx" ON "JournalLike"("journalId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalLike_userId_journalId_key" ON "JournalLike"("userId", "journalId");

-- CreateIndex
CREATE INDEX "JournalComment_journalId_createdAt_idx" ON "JournalComment"("journalId", "createdAt");

-- CreateIndex
CREATE INDEX "JournalComment_userId_idx" ON "JournalComment"("userId");

-- CreateIndex
CREATE INDEX "JournalBookmark_userId_createdAt_idx" ON "JournalBookmark"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "JournalBookmark_userId_journalId_key" ON "JournalBookmark"("userId", "journalId");

-- AddForeignKey
ALTER TABLE "JournalLike" ADD CONSTRAINT "JournalLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalLike" ADD CONSTRAINT "JournalLike_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalComment" ADD CONSTRAINT "JournalComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalComment" ADD CONSTRAINT "JournalComment_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalBookmark" ADD CONSTRAINT "JournalBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalBookmark" ADD CONSTRAINT "JournalBookmark_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
