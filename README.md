# ISAAC • BLACK & WHITE SITE

- Next.js 14 + App Router + TypeScript
- TailwindCSS for styling
- Framer Motion for subtle animations
- Collapsible left sidebar that persists state and shifts content
- Pages: home, about, projects (+ dynamic case study), experience, photos, contact
- 100% black & white palette
- Static-friendly defaults for fast Vercel deploys
- Security headers, robots.txt, sitemap.xml

## Run locally
```bash
npm i            # or pnpm i / yarn
npm run dev      # http://localhost:3000
```

## Deploy on Vercel
1. Push to GitHub:
```bash
git init
git add -A
git commit -m "init"
gh repo create isaac-bw-site --private --source=. --push   # or create manually
git push -u origin main
```
2. In Vercel: **New Project → Import from Git** → Select repo → Framework: Next.js → build command `next build` (default) → output `.next` (auto).  
3. Set domain. Redeploy on pushes to `main`.

## Contact form
Uses https://formsubmit.co to forward submissions to your email with no backend.
Action is set to `https://formsubmit.co/isaaciseiler@gmail.com`. Replace if needed.

## Customize
- Update `metadataBase` in `app/layout.tsx` to your real domain.
- Replace placeholders in photos grid and projects.
- Adjust spacing and type scale to taste.
