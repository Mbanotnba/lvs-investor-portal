# LVS Portal - Deployment Configuration

## Architecture

| Component | Service | URL |
|-----------|---------|-----|
| Frontend | Firebase Hosting | https://[PROJECT-ID].web.app |
| Backend API | Cloud Run | https://lvs-api-657638018776.us-central1.run.app |

## Safeguards in Place

### 1. Configuration Lock (firebase.json)

The `firebase.json` file controls what gets deployed. Changes to this file are:
- Tracked in git (requires commit + push)
- Verified by checksum in `deploy.sh`

**To intentionally modify hosting config:**
1. Edit `firebase.json`
2. Run `shasum -a 256 firebase.json` to get new checksum
3. Update `EXPECTED_CHECKSUM` in `deploy.sh`
4. Commit both files together with clear commit message

### 2. Deployment Script (deploy.sh)

All production deployments must go through `deploy.sh` which:
- Requires typing "deploy" to confirm
- Verifies firebase.json hasn't been tampered with
- Logs all deployments to `deployments.log`
- Shows files before deploying

**Never run `firebase deploy` directly.**

### 3. Git Protection

Critical files that should require PR review:
- `firebase.json` - hosting configuration
- `deploy.sh` - deployment script
- `js/config.js` - API endpoints
- `backend/.env` - secrets (should not be in git)

Consider enabling branch protection rules on GitHub:
```
Settings > Branches > Add rule > main
- Require pull request reviews
- Require status checks
```

### 4. Files Excluded from Deployment

The following are never deployed (configured in firebase.json):
- `backend/` - API code (deployed separately to Cloud Run)
- `venv/` - Python virtual environment
- `node_modules/` - Node dependencies
- `*.md` - Documentation
- `.env`, `.firebaserc` - Configuration files

## Deployment Process

### First-Time Setup

```bash
# 1. Login to Firebase
npx firebase login

# 2. Create or select project
npx firebase projects:list
npx firebase use YOUR_PROJECT_ID

# 3. Lock the configuration
shasum -a 256 firebase.json
# Update EXPECTED_CHECKSUM in deploy.sh with the output

# 4. Commit the setup
git add firebase.json .firebaserc deploy.sh DEPLOYMENT.md
git commit -m "Configure Firebase Hosting with deployment safeguards"
```

### Regular Deployments

```bash
# Always use the deploy script
./deploy.sh
```

### Emergency Rollback

```bash
# List recent deployments
npx firebase hosting:channel:list

# Rollback to previous version
npx firebase hosting:rollback
```

## Security Headers

Configured in `firebase.json`:
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS filter
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer

## Caching Policy

- HTML files: No cache (always fresh)
- JS/CSS files: 1 year cache (versioned by content)
- Assets: Default CDN caching

## Monitoring

View deployment status and analytics:
- Firebase Console: https://console.firebase.google.com
- Hosting tab shows traffic, bandwidth, and deployment history

## Troubleshooting

**"firebase.json has been modified" error:**
- If intentional: Update checksum in deploy.sh
- If unintentional: Run `git checkout firebase.json`

**Deployment shows old content:**
- Clear browser cache or use incognito
- Check deployment completed in Firebase Console
- Verify the correct project is selected (`npx firebase projects:list`)
