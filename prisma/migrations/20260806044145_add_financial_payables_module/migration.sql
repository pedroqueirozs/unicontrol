-- CreateEnum
CREATE TYPE "PayableInstallmentStatus" AS ENUM ('pendente', 'pago');

-- CreateTable
CREATE TABLE "PayableGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayableGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payable" (
    "id" TEXT NOT NULL,
    "payeeName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "issueDate" TIMESTAMP(3),
    "supplierId" TEXT,
    "createdByName" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayableInstallment" (
    "id" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "PayableInstallmentStatus" NOT NULL DEFAULT 'pendente',
    "paidAt" TIMESTAMP(3),
    "payableId" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayableInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PayableGroup_companyId_idx" ON "PayableGroup"("companyId");

-- CreateIndex
CREATE INDEX "PaymentMethod_companyId_idx" ON "PaymentMethod"("companyId");

-- CreateIndex
CREATE INDEX "Payable_companyId_idx" ON "Payable"("companyId");

-- CreateIndex
CREATE INDEX "Payable_groupId_idx" ON "Payable"("groupId");

-- CreateIndex
CREATE INDEX "Payable_supplierId_idx" ON "Payable"("supplierId");

-- CreateIndex
CREATE INDEX "PayableInstallment_companyId_status_dueDate_idx" ON "PayableInstallment"("companyId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "PayableInstallment_companyId_groupId_status_dueDate_idx" ON "PayableInstallment"("companyId", "groupId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "PayableInstallment_payableId_idx" ON "PayableInstallment"("payableId");

-- AddForeignKey
ALTER TABLE "PayableGroup" ADD CONSTRAINT "PayableGroup_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payable" ADD CONSTRAINT "Payable_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PayableGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payable" ADD CONSTRAINT "Payable_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayableInstallment" ADD CONSTRAINT "PayableInstallment_payableId_fkey" FOREIGN KEY ("payableId") REFERENCES "Payable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayableInstallment" ADD CONSTRAINT "PayableInstallment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayableInstallment" ADD CONSTRAINT "PayableInstallment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PayableGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayableInstallment" ADD CONSTRAINT "PayableInstallment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
