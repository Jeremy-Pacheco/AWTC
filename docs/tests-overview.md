# AWTC Tests Overview

This document summarizes the test suites and explains how to run them for both backend and frontend.

## Scope
- Backend: Unit-style tests covering models, relationships, JWT validation, aggregations, date filtering, and auth header checks.
- Frontend: Logic tests for fetching, auth token handling, CRUD request shapes, filtering, display name fallback, date formatting, file upload validation, and error handling.

## File Locations
- Backend tests: `backend/tests/backend.test.js`
- Frontend tests: `frontend/src/tests/frontend.test.tsx`

## Prerequisites
- Node.js 18+ (works on Windows)
- Dependencies installed per app (`npm install` in each folder)

## Backend: Run Tests
1. Install dev dependencies in backend (already configured in `package.json`):
```bash
cd backend
npm install
```
2. Run tests:
```bash
npm test
```
3. Optional modes:
```bash
npm run test:watch
npm run test:coverage
```

## Frontend: Run Tests
1. Install dev dependencies in frontend:
```bash
cd frontend
npm install
```
2. Run tests (Vitest):
```bash
npm test
```
3. Optional modes:
```bash
npm run test:watch
npm run test:coverage
```

## What’s Covered (Examples)
- Backend:
  - User/Review/Project/Message entity shapes
  - Review↔User association logic
  - JWT structure checks
  - Aggregations: review count per user, message count per sender
  - Date range filtering (last 7 days)
  - Auth header (`Bearer <token>`) format verification
- Frontend:
  - Fetch mocks for reviews/projects
  - Storing/decoding JWT from `localStorage`
  - POST/DELETE request shape checks for reviews
  - Filtering by `userId`
  - Display name fallback (`name` → email prefix → "User")
  - Locale-agnostic date formatting check
  - File object validation and image type detection
  - Graceful handling of network errors

## Notes
- Frontend uses Vitest with `jsdom` environment.
- Backend uses Jest with a simple matcher pattern.
- Date formatting test is locale-agnostic to avoid system locale failures.
- If Windows paths cause issues, prefer running commands from the app folder (`backend`/`frontend`).
