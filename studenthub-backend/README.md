# StudentHub Backend

Node.js + Express + TypeScript + Prisma + PostgreSQL backend for StudentHub.

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Install dependencies: `npm install`
3. Generate Prisma client: `npm run prisma:generate`
4. Create/apply database migration: `npm run prisma:migrate -- --name init`
5. Seed demo data: `npm run prisma:seed`
6. Start development server: `npm run dev`

API base URL: `http://localhost:5000/api`

## Main endpoints

- `POST /auth/college/register`
- `POST /auth/college/login`
- `POST /auth/student/login`
- `GET /auth/me`
- `GET /students`
- `GET /students/count`
- `POST /students` (college)
- `GET /challenges`
- `POST /challenges` (college)
- `PATCH /challenges/:id/publish` (college)
- `PATCH /challenges/:id/close` (college)
- `GET /submissions` (college)
- `POST /submissions` (student)
- `PATCH /submissions/:id/review` (college)
- `PATCH /submissions/:id/evaluate` (college)
- `GET /skills`
- `POST /skills` (college)
- `GET /reports/dashboard` (college)
- `GET /reports/skills` (college)
- `GET /reports/submissions` (college)
- `GET /reports/students/:studentId/performance` (college)

## Important

The old Supabase RLS policies are intentionally not copied. Authorization belongs in this backend through JWT authentication and role checks.
