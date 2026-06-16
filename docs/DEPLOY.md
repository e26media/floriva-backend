# Floriva — deploy to production

Use this after pushing code to GitHub.

---

## Part 1 — Backend API (VPS / SSH)

**Where:** Server that runs `api.florivagifts.com`  
**Who runs it:** You, in SSH (PuTTY, Terminal, or host “Console”)

### Steps

1. Connect to your VPS:
   ```text
   ssh YOUR_USER@YOUR_SERVER_IP
   ```

2. Go to the backend folder (adjust path if different):
   ```bash
   cd /var/www/floriva-backend
   ```
   Not sure of the path? Run `pm2 list` then `pm2 show floriva-api` and check **exec cwd**.

3. Pull latest code and restart:
   ```bash
   git pull origin main
   npm ci --omit=dev
   mkdir -p uploads/products uploads/categories uploads/site-content uploads/vendors
   pm2 restart all
   ```

   Or run the script from the repo:
   ```bash
   bash scripts/update-vps-backend.sh
   ```

4. **Verify:**
   ```bash
   curl -s https://api.florivagifts.com/api/categoryview | head -c 200
   ```
   You should see JSON, not an error page.

---

## Part 2 — Admin panel (Windows PowerShell)

**Where:** Your PC, then upload to `admin.florivagifts.com`  
**Who runs it:** You, in PowerShell

### Steps

1. Open PowerShell:
   ```powershell
   cd E:\Floriva
   .\scripts\build-admin.ps1
   ```

2. Upload **everything inside** `E:\Floriva\Admin\dist\` to your admin web root:
   - **cPanel:** File Manager → `public_html` (or admin subdomain folder) → upload / replace files
   - **FTP:** Upload `dist` contents to the same folder
   - **Same VPS as API:** copy `dist/*` to your admin nginx/apache path

3. **Verify:** Open https://admin.florivagifts.com → log in → Add Product → you should see **Sub Categories** multi-select.

---

## Part 3 — Frontend website (optional)

Only if you changed the public site (`Frontend/`).

**On VPS:**
```bash
cd /var/www/floriva-frontend
git pull origin main
npm ci
npm run build
pm2 restart all
```

---

## Checklist after deploy

| Check | URL / action |
|-------|----------------|
| API responds | https://api.florivagifts.com/api/productview |
| Admin loads | https://admin.florivagifts.com |
| Add product works | Admin → Products → Add Product → save |
| Multi sub-category | Select 2+ categories → pick multiple sub categories |

---

## GitHub repos (push before deploy)

| Project | Repository |
|---------|------------|
| Backend | https://github.com/e26media/floriva-backend |
| Admin | https://github.com/e26media/floriva-admin |
| Frontend | https://github.com/e26media/floriva-frontend |

```powershell
cd E:\Floriva\Backend
git push origin main

cd E:\Floriva\Admin
git push origin main
```

---

## Auto-deploy (optional, one-time setup)

In each GitHub repo → **Settings → Secrets → Actions**, add:

| Secret | Example |
|--------|---------|
| `DEPLOY_HOST` | Your server IP or hostname |
| `DEPLOY_USER` | `root` or `deploy` |
| `DEPLOY_SSH_KEY` | Private SSH key (full PEM) |
| `DEPLOY_BACKEND_PATH` | `/var/www/floriva-backend` |
| `DEPLOY_ADMIN_PATH` | `/var/www/admin` |
| `DEPLOY_FRONTEND_PATH` | `/var/www/floriva-frontend` |

Then every `git push` to `main` can deploy automatically (workflows are in each repo under `.github/workflows/`).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| “Error creating product” | Backend not updated — do Part 1 again |
| No sub-category multi-select | Admin not rebuilt/uploaded — do Part 2 again |
| `git pull` asks for login | On VPS: `git remote -v` and use SSH URL or personal access token |
| `pm2: command not found` | Install Node/pm2 on VPS or use host panel to restart Node app |
