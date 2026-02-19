# GitHub Pages Deployment Setup

This project is configured to deploy to GitHub Pages with automatic CI/CD using GitHub Actions.

## Changes Made for GitHub Pages Compatibility

1. **Vite Configuration** (`vite.config.ts`):
   - Added `base: '/logs/'` — change this to your repository name if different
   - This ensures all assets are loaded from the correct path

2. **Router Configuration** (`src/app/App.tsx`):
   - Switched from `BrowserRouter` to `HashRouter`
   - This enables client-side routing without relying on HTML5 History API
   - URLs will now use `#` format (e.g., `https://username.github.io/logs/#/dashboard/logs`)

3. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
   - Automatically builds and deploys on push to `main` branch
   - No manual deployment needed

## Setup Instructions

### Step 1: Update Repository Name in Config
If your repository name is NOT `logs`, update `vite.config.ts`:
```typescript
base: '/your-repo-name/',
```

### Step 2: Configure GitHub Pages Settings
1. Go to your repository on GitHub
2. Settings → Pages
3. Under "Build and deployment":
   - Source: select "GitHub Actions"
   - The workflow will automatically deploy

### Step 3: Push to Main Branch
```bash
git add .
git commit -m "Configure for GitHub Pages"
git push origin main
```

### Step 4: Monitor Deployment
1. Go to your repository
2. Click "Actions" tab
3. Watch the "Deploy to GitHub Pages" workflow
4. Once complete, your site will be live at: `https://username.github.io/logs/`

## Troubleshooting

- **Blank page**: Check that `base` in `vite.config.ts` matches your repository name
- **Asset 404 errors**: Confirm the base path is correct
- **Routes not working**: The app uses HashRouter, so routes use `#/` format
- **Styles not loading**: Clear browser cache and hard-reload (Ctrl+Shift+R or Cmd+Shift+R)

## Local Testing
```bash
npm run build
# Then serve the dist folder locally to test
npx http-server dist
# Visit http://localhost:8080/logs/ (adjust port if different)
```

## Reverting to BrowserRouter
If you later want to use a custom domain (not GitHub Pages), you can:
1. Change back to `BrowserRouter` in `App.tsx`
2. Remove the `base` property from `vite.config.ts`
3. Configure a 404.html redirect if needed
