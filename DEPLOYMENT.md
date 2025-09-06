# Vercel Deployment Guide for Demo Project

## Prerequisites
1. Ensure your code is pushed to a GitHub repository
2. Have a Vercel account (sign up at vercel.com)
3. Your project uses file-based storage (storage.json) - perfect for demos!

## Deployment Steps

### 1. No Database Setup Needed! 🎉
Since you're using `storage.json` for data storage, there's no database to configure. Your demo data will be included in the deployment.

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
6. **No environment variables needed for demo!**
7. Click "Deploy"

### 3. How It Works
- Your existing `data/storage.json` file will be bundled with the deployment
- Frontend builds to `dist/public/` and serves your React app
- Backend API routes work as serverless functions
- All your demo data is preserved and accessible

### 4. Test Deployment
After deployment:
- Test frontend functionality at your Vercel domain
- Test API endpoints at `https://your-domain.vercel.app/api/employees`
- All your existing demo employee data should be visible

### 5. Important Notes for Demo
- **Data persistence**: In serverless environment, any new data added during demo sessions won't persist between visits. This is perfect for demos as it resets to your original demo data.
- **Performance**: First load might be slightly slower (cold start), but subsequent requests will be fast.
- **Demo reset**: Every new visitor gets the original demo data, making it perfect for showcasing.

## Project Structure for Vercel
- Frontend (React/Vite) builds to `dist/public/`
- Backend API routes are handled by `api/index.js` as serverless functions
- Your `data/storage.json` is included in the deployment
- All `/api/*` requests are routed to the serverless function
- Static files are served from the build directory

## Troubleshooting
1. Check Vercel function logs for API errors
2. Verify that your `data/storage.json` file is properly formatted
3. Test API endpoints directly to ensure they're working
4. For any file system errors, they're expected in serverless environment

## Perfect for Demos Because:
✅ No database setup required  
✅ All demo data included  
✅ Automatically resets for each visitor  
✅ Fast deployment  
✅ No environment variables needed  
✅ Works exactly like your local version
