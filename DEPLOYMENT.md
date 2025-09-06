# Vercel Deployment Guide

## Prerequisites
1. Ensure your code is pushed to a GitHub repository
2. Have a Vercel account (sign up at vercel.com)
3. Have your database set up (appears to be PostgreSQL/Neon based on your drizzle config)

## Deployment Steps

### 1. Prepare Environment Variables
In your Vercel dashboard, you'll need to add these environment variables:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NODE_ENV` - Set to "production"

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your GitHub repository (`bambooo`)
4. Vercel will auto-detect it as a Vite project
5. In "Build & Development Settings":
   - Framework Preset: Vite
   - Build Command: `npm run vercel-build` (or leave default)
   - Output Directory: `dist/public`
   - Install Command: `npm install`
6. Add your environment variables in the "Environment Variables" section
7. Click "Deploy"

### 3. Database Setup
Make sure your database is accessible from Vercel. If using Neon or another cloud PostgreSQL provider:
1. Add your database URL to Vercel environment variables
2. Run migrations if needed: `npm run db:push`

### 4. Test Deployment
After deployment:
- Test frontend functionality at your Vercel domain
- Test API endpoints at `https://your-domain.vercel.app/api/employees`

## Project Structure for Vercel
- Frontend (React/Vite) builds to `dist/public/`
- Backend API routes are handled by `api/index.js` as serverless functions
- All `/api/*` requests are routed to the serverless function
- Static files are served from the build directory

## Troubleshooting
1. Check Vercel function logs for API errors
2. Ensure all environment variables are set correctly
3. Verify database connectivity from Vercel
4. Check that file imports use correct paths (some may need adjustment for serverless environment)
