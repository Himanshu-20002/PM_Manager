# Deployment Guide — PM_Manager

This document shows the steps to prepare and deploy PM_Manager to Vercel and the recommended production environment configuration.

## Summary
- Host: Vercel (recommended for Next.js App Router)
- Database: MongoDB Atlas (use production `MONGODB_URI`)
- Secrets: Store in Vercel Environment Variables (do NOT commit secrets to repo)

## Required Environment Variables (Vercel dashboard)
Set these in your Vercel project Settings → Environment Variables (Production):

- `MONGODB_URI` — Your production MongoDB connection string (use `mongodb+srv://` from Atlas or the standard replica set URI). Example:
  - `mongodb+srv://<user>:<password>@cluster0.mongodb.net/pm_manager?retryWrites=true&w=majority`
- `JWT_SECRET` — A long random string used to sign JWTs (do not share)
- `NODE_ENV` — `production`
- `NEXT_PUBLIC_APP_URL` — Your production site URL, e.g. `https://pm-manager.example.com`

Optional (monitoring / analytics):
- `SENTRY_DSN` or other observability DSNs

## Local environment (`.env.local`) — Development only
Keep your development variables here. Example:

```
MONGODB_URI="mongodb://<user>:<pass>@host1:27017,host2:27017,host3:27017/pm_manager?replicaSet=...&authSource=admin"
JWT_SECRET=super-secret-key-himanshu-12345
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> NOTE: Do not push `.env.local` to the repository. Use Vercel's Environment Variables for production.

## Vercel Deployment Steps
1. Push code to Git (GitHub/GitLab/Bitbucket)
2. Sign in to Vercel and import the repository
3. During import, Vercel will detect Next.js. If asked, confirm the Build Command: `next build` and Output Directory: (leave blank)
4. In Vercel Project Settings → Environment Variables, add the variables from "Required Environment Variables" above (use production values)
5. Deploy the project — Vercel will run `npm install` and `npm run build` automatically
6. After deployment, set `NEXT_PUBLIC_APP_URL` to the Vercel-provided domain or your custom domain

## Additional Production Recommendations
- Use a strong `JWT_SECRET` (32+ characters). Rotate if leaked.
- Use MongoDB Atlas backups and enable IP access control. For production, prefer allowing Atlas to accept connections from the Vercel IP ranges or allow access from anywhere combined with proper user/password and firewall rules.
- Use HTTPS (Vercel handles TLS for you)
- Monitor logs and errors in Vercel dashboard
- Enable automatic environment variable updates for staging/preview

## Verification Checklist (after deploy)
- [ ] Visit `NEXT_PUBLIC_APP_URL` and confirm the app loads
- [ ] Login as admin and create a project
- [ ] Create tasks – ensure tasks persist and appear in the dashboard
- [ ] Test delete project (admin only) — confirm tasks are removed
- [ ] Check server logs for errors in Vercel dashboard

## Troubleshooting
- `MONGODB` connection errors: verify `MONGODB_URI`, network access rules in Atlas, and correct credentials
- `JWT` errors: verify `JWT_SECRET` is set in production

## Quick Commands (local)
```bash
npm install
npm run dev       # development
npm run build      # build for production
npm start          # run production build locally (requires build step)
```

---

If you want, I can:
- Add a `VERCEL.md` with step-by-step screenshots you can follow
- Create a simple `vercel.json` with redirects or headers if you need custom routing
- Prepare a minimal health-check endpoint for uptime monitoring

