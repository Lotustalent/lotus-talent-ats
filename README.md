# Lotus Talent Consultancy — ATS & CRM

## Deploy to Vercel (no laptop needed)

1. Upload ALL files from this folder to your GitHub repository (lotus-talent-ats)
   - index.html
   - package.json  
   - vite.config.js
   - src/ folder with all .jsx and .js files

2. Vercel will automatically detect package.json and build it

3. In Vercel dashboard → your project → Settings → Build & Output Settings:
   - Build Command: npm run build
   - Output Directory: dist
   - Install Command: npm install
