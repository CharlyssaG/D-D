# Deployment Checklist

## ✅ Files Ready to Push

All necessary files have been created:
- ✅ `src/app/layout.tsx` - Root layout (REQUIRED)
- ✅ `src/app/page.tsx` - Homepage
- ✅ `src/app/globals.css` - Storybook styling
- ✅ `package.json` - Updated to Next.js 14.2.18
- ✅ `tsconfig.json` - TypeScript config
- ✅ `next.config.js` - Next.js config
- ✅ `tailwind.config.js` - Tailwind theme
- ✅ `postcss.config.js` - PostCSS for Tailwind
- ✅ `.eslintrc.json` - ESLint config
- ✅ `.gitignore` - Git ignore rules
- ✅ `.env.example` - Environment template

## 🚀 Deploy Steps

### 1. Push to GitHub
```bash
# Check what files will be committed
git status

# Add all files
git add .

# Commit
git commit -m "Add Next.js app structure and fix dependencies"

# Push to main branch
git push origin main
```

### 2. Vercel Will Auto-Deploy
Once you push, Vercel detects the changes and builds automatically.

### 3. Set Environment Variables in Vercel
**CRITICAL**: Your build will succeed but the app won't work until you add these:

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://yourproject.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your_anon_key_here`
3. Get values from: https://app.supabase.com → Your Project → Settings → API
4. Redeploy after adding variables

## 🔧 Troubleshooting

### Build fails with "Couldn't find any pages or app directory"
**Cause**: The `src/app/` folder didn't get pushed to GitHub.
**Fix**: 
```bash
git add src/app/
git commit -m "Add app directory"
git push
```

### Build succeeds but app shows blank page
**Cause**: Missing environment variables.
**Fix**: Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel settings, then redeploy.

### Warning: "This version has a security vulnerability"
**Cause**: Old Next.js version cached.
**Fix**: Already fixed in package.json (14.2.18). Will resolve after push.

### Images not loading
**Cause**: Supabase domain not whitelisted.
**Fix**: Add your Supabase domain to `next.config.js`:
```js
images: {
  domains: [
    'yourproject.supabase.co',
  ],
}
```

## 📋 Post-Deployment Setup

### 1. Create Supabase Project
1. Go to: https://app.supabase.com
2. Create new project
3. Wait for database to provision (~2 minutes)

### 2. Run Database Migration
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

### 3. Test Your Site
Visit your Vercel URL and you should see:
- Parchment background
- "Welcome to Your Campaign" heading in decorative font
- Two cards showing Player and DM features
- Ornamental corner flourishes

## 🎨 Next Development Steps

Once deployed, you can start building:

1. **Authentication** - Add sign up/login pages
2. **Character Creation** - Build the wizard flow
3. **DM Dashboard** - Campaign management interface
4. **Combat Tracker** - Real-time initiative system
5. **Battle Maps** - Upload and token placement

## 📝 Quick Commands Reference

```bash
# Local development
npm run dev

# Build locally (test before deploy)
npm run build

# Run production build locally
npm run start

# Check for issues
npm run lint
```

## 🆘 Need Help?

If build still fails after pushing:
1. Check Vercel build logs for specific error
2. Verify all files committed: `git log --stat`
3. Check package.json on GitHub matches local
4. Clear Vercel build cache and redeploy
