# LVS Portal Deployment Guide

## Production URLs

| Service | URL |
|---------|-----|
| Portal (Primary) | https://lvs-portal-prod.web.app |
| Portal (Alt) | https://lvs-portal-prod.firebaseapp.com |
| API | https://lvs-api-657638018776.us-central1.run.app |

---

## Deploying Frontend (Firebase)

```bash
# Authenticate if needed
npx firebase login --reauth

# Deploy
cd /Users/admin/lvs-investor-portal
npx firebase deploy --only hosting
```

---

## Deploying Backend (Cloud Run)

```bash
# Authenticate if needed
gcloud auth login

# Deploy
cd /Users/admin/lvs-investor-portal/backend
gcloud run deploy lvs-api --source . --region us-central1 --allow-unauthenticated
```

---

## Adding New Users

1. Edit `backend/database.py`
2. Add user to the `production_users` list in the appropriate section
3. Deploy backend (see above)
4. User password will be: `LVS2026{FirstName}`

---

## Common Issues

### "Failed to fetch" on login
- CORS issue - check `backend/config.py` CORS_ORIGINS includes Firebase domains
- Redeploy backend after fixing

### User can't login
- Verify user is in `backend/database.py` seed list
- Redeploy backend to regenerate user
- Check password format: `LVS2026{FirstName}` (case-sensitive)

### Firebase deploy fails
- Run `npx firebase login --reauth`
- Ensure you're in the project root directory

---

## File Structure

```
lvs-investor-portal/
├── backend/           # Python FastAPI backend
│   ├── database.py    # User seeding, DB operations
│   ├── config.py      # CORS, env config
│   └── main.py        # API routes
├── assets/
│   ├── presentations/ # Investor decks
│   └── documents/     # Pipeline docs, LOIs
├── docs/              # Documentation
├── js/                # Frontend JavaScript
└── *.html             # Portal pages
```
