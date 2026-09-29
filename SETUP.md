# Baaraath - Setup Guide

This document explains how to install, configure, and run the Baaraath application locally, including how to populate it with dummy data for development and demonstration purposes.

---

## 1. Prerequisites

Ensure the following tools are installed on your machine before proceeding:

- **Node.js** >= 20.9 (LTS recommended)
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** >= 14 (local or remote)
- **Git**

Optional:
- **Docker** and **Docker Compose** (if using containerized database)

---

## 2. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/baaraath.git
cd baaraath

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## 3. Environment Configuration

Create a `.env` file inside `frontend/` based on the following template:

```env
# Database
DATABASE_URL="postgres://USER:PASSWORD@HOST:5432/baaraath"
SHADOW_DATABASE_URL="postgres://USER:PASSWORD@HOST:5432/baaraath_shadow"

# NextAuth
AUTH_SECRET="replace-with-a-long-random-string"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Security note:** Do not commit real secrets to version control. Use a `.env` file locally and store production secrets in your hosting provider's secret manager.

---

## 3.1 Generate Prisma Client

This project uses **Prisma 7**. After installing dependencies, generate the Prisma Client before running the app:

```bash
cd frontend
npx prisma generate
```

> **Note for new developers:** If you see `Module not found: Can't resolve '@/generated/prisma/client'`, it means the Prisma Client has not been generated yet. Run `npx prisma generate` and then retry.

---

## 5. Database Setup

Before running migrations or seeds, generate the Prisma Client:

```bash
cd frontend
npx prisma generate
```

### Option A: Local PostgreSQL

```bash
# Create database
psql -U postgres -c "CREATE DATABASE baaraath;"

# Run migrations
cd frontend
npx prisma migrate deploy
```

### Option B: Reset and Seed (Development)

```bash
cd frontend

# Generate Prisma Client if needed
npx prisma generate

# Reset database, apply migrations, and run seed
npx prisma migrate reset --force
npx tsx prisma/seed.ts
```

> **Warning:** `migrate reset` deletes all data in the target database. Only use this on development databases.

---

## 6. Dummy Data

The seed script (`frontend/prisma/seed.ts`) creates demo accounts and sample listings.

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer.demo@baaraath.test` | `Customer@123` |
| Provider | `provider.demo@baaraath.test` | `Provider@123` |

### Seeded Data

- Vendor: **Royal Garden Events**
- Categories:
  - Banquet Halls
  - Catering
  - Music Band
  - Hotels
  - Dancing
  - Priests
  - Event Management
- Sample services:
  - Royal Garden Banquet Hall
  - Celebration Catering Package
  - Harmony Music Band
  - Luxury Hotel Venue
  - Classical Dance Performance
  - Traditional Pooja Services
  - Elite Event Planners

### Re-run Seed Only

If migrations are already applied and you only want to refresh dummy data:

```bash
cd frontend
npx tsx prisma/seed.ts
```

---

## 7. Run the Application

```bash
cd frontend

# If you haven't already generated the Prisma Client:
npx prisma generate

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 8. Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run lint` | Run ESLint |
| `npx prisma migrate reset --force` | Reset database and apply migrations |
| `npx tsx prisma/seed.ts` | Seed dummy data |
| `npx prisma studio` | Open Prisma database browser |

---

## 9. Project Structure

```
frontend/
  prisma/
    schema.prisma          # Database schema
    migrations/            # Migration history
    seed.ts                # Dummy data script
  src/
    app/                   # Next.js App Router pages
    components/            # Reusable UI components
    lib/                   # Utilities and Prisma client
    hooks/                 # Custom React hooks
    generated/prisma/      # Generated Prisma client
```

---

## 11. Troubleshooting

### `Module not found: Can't resolve '@/generated/prisma/client'`

Run `npx prisma generate` inside `frontend/`.

### `Error: Prisma schema validation - error: Argument "url" is missing in data source block "db"`

This happens when using an older clone or branch. Ensure `prisma/schema.prisma` does **not** contain `url = env("DATABASE_URL")` under `datasource db`. In this project, the datasource URL is configured in `prisma7.config.ts`, not in `schema.prisma`.

### Database connection errors

Verify `DATABASE_URL` in `frontend/.env` and ensure the database server is reachable.

### Port already in use

Change the dev port with `npm run dev -- -p 3001`, or stop the existing process using port 3000.

## 12. Next Steps

- Configure email, SMS, and payment providers in `.env`
- Replace placeholder content with real service data
- Set up CI/CD and hosting
- Review `prisma/schema.prisma` for schema changes
