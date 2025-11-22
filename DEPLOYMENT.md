# Deployment Guide

This guide will help you deploy your Next.js portfolio to Vercel (recommended) or other platforms.

## Prerequisites

1. ✅ Build test passed (already verified)
2. OpenAI API key for the chat feature
3. Git repository (local or remote)

## Quick Deploy to Vercel (Recommended)

### Option 1: Deploy via Vercel CLI (Fastest)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - It will ask for project settings (accept defaults or customize)
   - For production: `vercel --prod`

### Option 2: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub/GitLab/Bitbucket**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

3. **Import your repository**:
   - Click "Add New Project"
   - Select your repository
   - Vercel will auto-detect Next.js settings

4. **Configure Environment Variables**:
   - In project settings, go to "Environment Variables"
   - Add: `OPENAI_API_KEY` = `your-openai-api-key-here`
   - Make sure to add it for all environments (Production, Preview, Development)

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at `your-project.vercel.app`

## Environment Variables Required

### Required for Chat Feature:
- `OPENAI_API_KEY`: Your OpenAI API key
  - Get it from: https://platform.openai.com/api-keys
  - Required for the `/api/chat` endpoint

### Setting Environment Variables:

**On Vercel:**
- Project Settings → Environment Variables
- Add variable name: `OPENAI_API_KEY`
- Add value: `sk-...` (your key)
- Select all environments (Production, Preview, Development)
- Click "Save"

**For local development:**
Create a `.env.local` file:
```env
OPENAI_API_KEY=sk-your-key-here
```

## Deployment Checklist

- [x] Build test passed
- [ ] Code committed to git
- [ ] Repository pushed to GitHub/GitLab (if using dashboard)
- [ ] Environment variables configured
- [ ] Vercel account created
- [ ] Project deployed
- [ ] Test chat functionality after deployment

## Other Deployment Options

### Netlify

1. Push code to Git
2. Go to [netlify.com](https://netlify.com)
3. Import repository
4. Build command: `npm run build`
5. Publish directory: `.next`
6. Add environment variable: `OPENAI_API_KEY`

### Self-hosted (VPS/Server)

1. Build the project: `npm run build`
2. Start production server: `npm start`
3. Set environment variable: `export OPENAI_API_KEY=your-key`
4. Use PM2 or similar for process management

## Troubleshooting

### Chat feature not working after deployment:
- ✅ Verify `OPENAI_API_KEY` is set in environment variables
- ✅ Check that the variable is available in the runtime (not just build time)
- ✅ Verify API key has credits/quota available
- ✅ Check Vercel function logs for errors

### Build fails:
- Check for TypeScript errors: `npm run build`
- Verify all dependencies are in `package.json`
- Check Node.js version compatibility (Vercel uses Node 18+ by default)

## Post-Deployment

1. Test all pages work correctly
2. Test chat functionality
3. Verify mobile responsiveness
4. Check performance (Vercel provides analytics)
5. Set up custom domain (optional in Vercel settings)

## Important Notes

- **API Key Security**: Never commit `.env` files or API keys to git
- **Rate Limits**: Monitor OpenAI API usage to avoid unexpected costs
- **Session Storage**: Chat history uses browser sessionStorage (clears on tab close)
- **Question Limit**: Chat is limited to 15 questions per session
- **Message Length**: Messages limited to 500 characters (hard limit)

