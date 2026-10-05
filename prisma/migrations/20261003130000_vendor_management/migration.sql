-- ============================================================
-- BAARAATH VENDOR MANAGEMENT MIGRATION
-- 20261003130000_vendor_management
-- ============================================================

-- ------------------------------------------------------------
-- Vendor enums
-- ------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'VendorStatus'
    ) THEN
        CREATE TYPE "VendorStatus" AS ENUM (
            'PENDING',
            'UNDER_REVIEW',
            'APPROVED',
            'REJECTED',
            'SUSPENDED',
            'INACTIVE'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'VendorRegistrationStatus'
    ) THEN
        CREATE TYPE "VendorRegistrationStatus" AS ENUM (
            'DRAFT',
            'SUBMITTED',
            'UNDER_REVIEW',
            'APPROVED',
            'REJECTED'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'VendorDocumentType'
    ) THEN
        CREATE TYPE "VendorDocumentType" AS ENUM (
            'PAN',
            'GST',
            'BUSINESS_REGISTRATION',
            'ID_PROOF',
            'ADDRESS_PROOF',
            'BANK_PROOF',
            'LICENSE',
            'OTHER'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'VendorDocumentStatus'
    ) THEN
        CREATE TYPE "VendorDocumentStatus" AS ENUM (
            'PENDING',
            'VERIFIED',
            'REJECTED'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'VendorMemberRole'
    ) THEN
        CREATE TYPE "VendorMemberRole" AS ENUM (
            'OWNER',
            'MANAGER',
            'STAFF'
        );
    END IF;
END
$$;


-- ------------------------------------------------------------
-- Vendor additional fields
-- ------------------------------------------------------------

ALTER TABLE "Vendor"
ADD COLUMN IF NOT EXISTS "businessName" TEXT,
ADD COLUMN IF NOT EXISTS "businessType" TEXT,
ADD COLUMN IF NOT EXISTS "registrationNo" TEXT,
ADD COLUMN IF NOT EXISTS "gstNumber" TEXT,
ADD COLUMN IF NOT EXISTS "panNumber" TEXT,
ADD COLUMN IF NOT EXISTS "website" TEXT,
ADD COLUMN IF NOT EXISTS "contactEmail" TEXT,
ADD COLUMN IF NOT EXISTS "contactPhone" TEXT,
ADD COLUMN IF NOT EXISTS "postalCode" TEXT,
ADD COLUMN IF NOT EXISTS "state" TEXT,
ADD COLUMN IF NOT EXISTS "country" TEXT DEFAULT 'India',
ADD COLUMN IF NOT EXISTS "approvalNotes" TEXT,
ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "profileComplete" BOOLEAN NOT NULL DEFAULT false;


-- ------------------------------------------------------------
-- Vendor status
-- ------------------------------------------------------------

ALTER TABLE "Vendor"
ADD COLUMN IF NOT EXISTS "status" "VendorStatus" NOT NULL DEFAULT 'PENDING';


-- ------------------------------------------------------------
-- VendorRegistration
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "VendorRegistration" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,

    "personalFirstName" TEXT,
    "personalLastName" TEXT,
    "personalPhone" TEXT,
    "personalEmail" TEXT,

    "organizationName" TEXT,
    "organizationType" TEXT,
    "organizationDesc" TEXT,

    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT DEFAULT 'India',

    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,

    "status" "VendorRegistrationStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "VendorRegistration_pkey"
        PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VendorRegistration_vendorId_key"
ON "VendorRegistration"("vendorId");

CREATE INDEX IF NOT EXISTS "VendorRegistration_status_idx"
ON "VendorRegistration"("status");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'VendorRegistration_vendorId_fkey'
    ) THEN
        ALTER TABLE "VendorRegistration"
        ADD CONSTRAINT "VendorRegistration_vendorId_fkey"
        FOREIGN KEY ("vendorId")
        REFERENCES "Vendor"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
END
$$;


-- ------------------------------------------------------------
-- VendorBankAccount
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "VendorBankAccount" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,

    "accountHolderName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "branchName" TEXT,
    "accountType" TEXT,

    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorBankAccount_pkey"
        PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "VendorBankAccount_vendorId_idx"
ON "VendorBankAccount"("vendorId");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'VendorBankAccount_vendorId_fkey'
    ) THEN
        ALTER TABLE "VendorBankAccount"
        ADD CONSTRAINT "VendorBankAccount_vendorId_fkey"
        FOREIGN KEY ("vendorId")
        REFERENCES "Vendor"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
END
$$;


-- ------------------------------------------------------------
-- VendorDocument
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "VendorDocument" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,

    "documentType" "VendorDocumentType" NOT NULL,
    "documentName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileSize" INTEGER,

    "status" "VendorDocumentStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionNote" TEXT,

    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "VendorDocument_pkey"
        PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "VendorDocument_vendorId_idx"
ON "VendorDocument"("vendorId");

CREATE INDEX IF NOT EXISTS "VendorDocument_status_idx"
ON "VendorDocument"("status");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'VendorDocument_vendorId_fkey'
    ) THEN
        ALTER TABLE "VendorDocument"
        ADD CONSTRAINT "VendorDocument_vendorId_fkey"
        FOREIGN KEY ("vendorId")
        REFERENCES "Vendor"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
END
$$;


-- ------------------------------------------------------------
-- VendorMember
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "VendorMember" (
    "id" TEXT NOT NULL,

    "vendorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    "memberRole" "VendorMemberRole" NOT NULL DEFAULT 'STAFF',

    "canViewDashboard" BOOLEAN NOT NULL DEFAULT true,
    "canManageBookings" BOOLEAN NOT NULL DEFAULT false,
    "canManageServices" BOOLEAN NOT NULL DEFAULT false,
    "canManageStaff" BOOLEAN NOT NULL DEFAULT false,
    "canViewFinance" BOOLEAN NOT NULL DEFAULT false,
    "canManageDocuments" BOOLEAN NOT NULL DEFAULT false,
    "canEditVendor" BOOLEAN NOT NULL DEFAULT false,

    "active" BOOLEAN NOT NULL DEFAULT true,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorMember_pkey"
        PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VendorMember_vendorId_userId_key"
ON "VendorMember"("vendorId", "userId");

CREATE INDEX IF NOT EXISTS "VendorMember_vendorId_idx"
ON "VendorMember"("vendorId");

CREATE INDEX IF NOT EXISTS "VendorMember_userId_idx"
ON "VendorMember"("userId");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'VendorMember_vendorId_fkey'
    ) THEN
        ALTER TABLE "VendorMember"
        ADD CONSTRAINT "VendorMember_vendorId_fkey"
        FOREIGN KEY ("vendorId")
        REFERENCES "Vendor"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
END
$$;


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'VendorMember_userId_fkey'
    ) THEN
        ALTER TABLE "VendorMember"
        ADD CONSTRAINT "VendorMember_userId_fkey"
        FOREIGN KEY ("userId")
        REFERENCES "User"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
END
$$;


-- ------------------------------------------------------------
-- Vendor indexes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS "Vendor_status_idx"
ON "Vendor"("status");
