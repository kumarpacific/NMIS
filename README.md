
  # Login and Dashboard Pages

  This is a code bundle for Login and Dashboard Pages. The original project is available at https://www.figma.com/design/zuYPOYDsEyUtsNVgnDeG9o/Login-and-Dashboard-Pages.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  


  # 1. Initialize or update git remote
cd /Users/prax/Downloads/logs

# 2. Check if git repo already exists
git status

# If NOT a git repo, initialize it:
git init

# 3. Add the NMIS repository as origin
git remote add origin https://github.com/kumarpacific/NMIS.git

# Or if it already exists, update the remote:
git remote set-url origin https://github.com/kumarpacific/NMIS.git

# 4. Verify the remote is correct
git remote -v

# 5. Fetch latest from remote (creates tracking branches)
git fetch origin

# 6. Set local main to track origin/main
git branch --set-upstream-to=origin/main main

# 7. Pull latest changes
git pull origin main

# 8. Stage all changes
git add .

# 9. Commit your changes
git commit -m "Update for GitHub Pages deployment: HashRouter + base path /NMIS/"

# 10. Push to main branch
git push origin main

# 11. Deploy to GitHub Pages using gh-pages
npm run deploy