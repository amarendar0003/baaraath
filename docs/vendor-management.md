# Vendor Management System

## Overview

Baaraath's vendor-management module allows a vendor owner to operate the business independently through a dedicated dashboard. The system is designed around the following operating model:

- Admin governs the platform and approves/monitors vendor onboarding.
- Vendor Owner runs day-to-day business operations.
- Managers support assigned operational tasks.
- Staff maintain internal operational records.
- External Providers perform assigned services.
- Customers browse and book approved offerings.

This module covers database structure, security, booking workflows, vendor onboarding, KYC, and operational controls.

## Core roles and responsibilities

### Platform Admin

- Register or authorize vendors
- Review verification status
- Suspend or reactivate accounts
- Inspect audit activity
- Review booking and business health metrics

### Vendor Owner

- Manage business profile and address details
- Create and manage halls and gallery content
- Add and maintain services and pricing
- Manage providers and assignments
- Review and manage bookings
- Maintain PAN/GST, KYC, and bank details
- Manage manager and staff records
- Activate or deactivate resources as needed

### Vendor Manager

- Access only the tasks assigned by the vendor owner
- Manage bookings, hall availability, assigned services, reports, and provider operations within their granted permissions
- Never receive access to bank data or ownership-documents unless explicitly allowed

### Vendor Staff

- Maintain employee records
- Work with login disabled or enabled according to the vendor owner control
- Use role-based limits on dashboard access

### External Provider

- View assigned work
- Update availability and booking-related status
- Accept or reject assigned work requests

## Registration and verification flow

1. A vendor account is created or approved by the admin.
2. Vendor profile details are captured, including owner identity and business information.
3. Required government and business documents are uploaded.
4. Verification review checks document validity and business compliance.
5. The vendor status moves through the lifecycle: Draft → Pending → Under Review → Approved/Rejected.
6. Active business resources become available to the public only after approval.

## Dashboard modules

The vendor management dashboard includes the following sections:

- Overview
- Business Profile
- Function Halls
- Hall Gallery
- Services and Pricing
- External Providers
- Provider Availability
- Booking Management
- Calendar
- Customers
- Managers
- Staff
- Documents and KYC
- Bank and Payout Details
- Reports
- Notifications
- Audit History
- Settings

Each menu item is constrained by permissions and role checks.

## Functional requirements

### Hall management

- Create multiple halls under one vendor account
- Track capacity, facilities, address, and hall-specific policies
- Upload gallery media with cover image and ordering
- Mark halls active or inactive without deleting history

### Service and pricing management

- Create services across categories
- Link service to a hall where relevant
- Set pricing rules and service duration
- Support fixed pricing, package pricing, or quantity-based charges
- Preserve confirmed booking pricing after a quote is locked

### Provider management

- Add external providers and assign services
- Set provider-specific prices and availability
- Route booking work requests to providers
- Track provider acceptance, rejection, and completion states

### Booking management

- Receive booking requests from customers
- Review, confirm, reject, or cancel requests
- Prevent double booking by validating hall and slot availability
- Keep auditable booking history with timestamps and actors

### Contact sharing and privacy

- Expose customer and vendor contact information only when allowed by booking status and privacy rules
- Prevent sensitive documents like PAN, bank account numbers, and internal audit data from reaching customers
- Restrict provider access to only necessary customer details

### Manager and staff management

- Create manager accounts with permission sets
- Track staff records with optional login capability
- Enforce least-privilege access for sensitive permissions

### Document and bank management

- Upload and track KYC and tax documents
- Maintain bank-account records with masked display values
- Require verification before considering documents or payments valid
- Enforce private storage and access restrictions

## Security and audit requirements

The implementation must enforce:

- Role-based access control on every protected route
- Server-side authorization rather than UI-only checks
- Secure sessions and password hashing
- Input validation and output encoding
- Vendor-level data isolation
- Private document storage
- Audit logging for critical changes
- Masked bank details in the UI
- No cross-vendor data leakage

## Data model summary

The data model includes these main entities:

- User
- Vendor
- VendorRegistration
- FunctionHall
- Category
- Service
- VendorProvider
- ProviderService
- ProviderAvailability
- VendorManager
- VendorManagerPermission
- VendorStaff
- VendorDocument
- VendorBankAccount
- VendorGallery
- VendorAvailability
- Booking
- BookingItem
- Review
- Notification
- AuditLog

## Acceptance criteria

The vendor management system is accepted when:

1. A vendor can register and securely access the dashboard.
2. The vendor can manage multiple halls and gallery media.
3. The vendor can create and update services and pricing without admin intervention.
4. Providers can be added, assigned, and managed.
5. Bookings can be reviewed and confirmed without double-booking.
6. Contact-sharing rules honor privacy and status rules.
7. Managers and staff are limited by their permissions.
8. Documents and bank details are protected and verified.
9. Data remains isolated across vendors.
10. Existing Baaraath customer accounts and bookings continue to function after migration.

## Implementation status in this repository

The application currently implements vendor registration, profile and service
management, booking views, and a basic admin provider directory. The directory
supports pending/review/approve/reject actions, plus suspension and reactivation.
Only approved providers' active services are shown in public discovery and
detail views, and the booking API independently enforces the approval check.

These flows use explicit Prisma selections for the vendor fields they need.
This is important because the live database may not yet contain every optional
column in the expanded Prisma schema. The selected target for document and
gallery storage is an S3-compatible private bucket, but those features are not
implemented yet.

The Prisma schema also describes halls, gallery media, external provider
assignments and availability, managers, staff, KYC documents, bank accounts,
notifications, audit logs, and reviews. Those models do not by themselves
provide working application features: the corresponding operational APIs and
user interfaces are not implemented.

Before implementing those modules, reconcile the existing
`20261003130000_vendor_management` migration with the current Prisma schema. The
migration defines a plaintext `VendorBankAccount.accountNumber` while the
schema expects `accountNumberEncrypted`, and its `VendorDocument.storagePath`
and `VendorDocumentStatus` fields/types do not match the current model. The
configured database was unreachable during this audit, so its migration history
could not be verified. No migration was applied.

## Remaining implementation work

1. Reconcile and validate the vendor migration without dropping existing data
   or enum values; then implement halls, gallery, and S3-compatible media
   workflows.
2. Implement external-provider assignments, work requests, and availability.
3. Add manager permissions and staff account controls with server-side
   authorization and vendor-level isolation.
4. Implement KYC document verification and payout details with private storage,
   encryption, masking, and strict access rules.
5. Add audit history, notifications, and reporting dashboards.
6. Add end-to-end tests for approval transitions, data isolation, and booking
   conflicts.
