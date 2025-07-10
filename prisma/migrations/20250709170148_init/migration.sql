-- CreateTable
CREATE TABLE "History" (
    "id" SERIAL NOT NULL,
    "bust" DOUBLE PRECISION NOT NULL,
    "waist" DOUBLE PRECISION NOT NULL,
    "hips" DOUBLE PRECISION NOT NULL,
    "shoulders" DOUBLE PRECISION NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userEmail" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);
