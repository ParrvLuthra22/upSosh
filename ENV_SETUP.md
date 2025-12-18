# Environment Configuration Guide

## Overview
This project uses environment variables to configure URLs for different environments (development, production).

## Frontend URLs
- **Development**: http://localhost:3000
- **Production**: https://www.upsosh.app

## Backend URLs
- **Development**: http://localhost:4000
- **Production**: https://upsosh-production.up.railway.app

## Frontend Environment Files

### `.env.development` (Local Development)
Used automatically when running `npm run dev`
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

### `.env.production` (Production Build)
Used automatically when running `npm run build`
```bash
NEXT_PUBLIC_BACKEND_URL=https://upsosh-production.up.railway.app
NEXT_PUBLIC_FRONTEND_URL=https://www.upsosh.app
```

### `.env.example`
Template file showing all available environment variables with production values as defaults.

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with:

```bash
DATABASE_URL="your-database-url"
JWT_SECRET="your-jwt-secret"
FRONTEND_URL=https://www.upsosh.app  # or http://localhost:3000 for dev
PORT=4000
NODE_ENV=production  # or development
```

## Deployment

### Railway (Backend)
Set these environment variables in your Railway dashboard:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string
- `FRONTEND_URL`: https://www.upsosh.app
- `NODE_ENV`: production

### Vercel/Netlify (Frontend)
Environment variables are automatically loaded from `.env.production` during build.
No additional configuration needed if using the default files.

## Local Development

1. **Backend**: Create `backend/.env` with development values
   ```bash
   DATABASE_URL="postgresql://..."
   JWT_SECRET="dev-secret"
   FRONTEND_URL=http://localhost:3000
   PORT=4000
   NODE_ENV=development
   ```

2. **Frontend**: The `.env.development` file is already configured for local development

3. Run:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Notes

- Never commit `.env`, `.env.local`, or `.env.*.local` files (they're in .gitignore)
- Always use `NEXT_PUBLIC_` prefix for client-side environment variables in Next.js
- Backend environment variables don't need the prefix
- Restart your dev servers after changing environment variables
