# LabBounty Deployment Guide

This guide will help you make the repository public and deploy LabBounty to production.

## 1. Make Repository Public

### On GitHub:
1. Go to your repository: https://github.com/raimp001/123
2. Click **Settings** (top right)
3. Scroll down to the **Danger Zone**
4. Click **Change visibility**
5. Select **Make public**
6. Confirm by typing the repository name

## 2. Deploy to Vercel (Recommended)

Vercel is the best platform for Next.js applications and offers:
- Automatic deployments from GitHub
- Free SSL certificates
- Global CDN
- Serverless functions
- Free tier for personal projects

### Quick Deploy:

#### Option A: Deploy with Vercel CLI (Fastest)
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard
1. Go to https://vercel.com/new
2. Click **Import Project**
3. Select your GitHub repository: **raimp001/123**
4. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install --legacy-peer-deps`
   - **Output Directory**: `.next`
5. Click **Deploy**

Your site will be live at: `https://your-project.vercel.app`

### Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Click **Settings** → **Domains**
3. Add your custom domain (e.g., `labbounty.com`)
4. Follow DNS configuration instructions

## 3. Alternative Deployment Options

### Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Railway
1. Go to https://railway.app
2. Click **New Project** → **Deploy from GitHub**
3. Select your repository
4. Railway will auto-detect Next.js

### DigitalOcean App Platform
1. Go to https://cloud.digitalocean.com/apps
2. Click **Create App**
3. Select your GitHub repository
4. Choose the Next.js preset

## 4. Environment Variables (If Needed)

If you add features that require environment variables:

```env
# .env.local (for local development)
NEXT_PUBLIC_API_URL=https://api.labbounty.com
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
```

In Vercel:
1. Go to **Settings** → **Environment Variables**
2. Add each variable
3. Redeploy

## 5. Post-Deployment Checklist

- [ ] Repository is public
- [ ] Site is live and accessible
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Styling is correct (Claude-inspired warm colors)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate is active (should be automatic)

## 6. Monitoring & Analytics (Optional)

### Add Vercel Analytics
```bash
npm install @vercel/analytics
```

Update `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

// Add in body:
<Analytics />
```

## Troubleshooting

### Build Fails
- Ensure `npm install --legacy-peer-deps` is used (date-fns peer dependency)
- Check build logs in Vercel dashboard

### Blank Page
- Clear browser cache (Ctrl+Shift+R)
- Check browser console for errors (F12)
- Verify environment variables are set

### Fonts Not Loading
- The app now uses system fonts (fixed Google Fonts network issues)
- Should work offline and in all deployment environments

## Support

For deployment issues:
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs/deployment

---

**Ready to deploy?** Run `vercel --prod` or visit https://vercel.com/new
