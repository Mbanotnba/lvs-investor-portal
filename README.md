# LVS Investor & Customer Portal System

**Last Updated:** January 31, 2026
**Version:** 3.0
**Maintainers:** Tayo Adesanya, Randy Hollines
**Status:** Production

---

## Live URLs

| Environment | URL |
|-------------|-----|
| **Portal (Frontend)** | https://lvs-portal-657638018776.us-central1.run.app |
| **API (Backend)** | https://lvs-api-657638018776.us-central1.run.app |
| **API Docs** | https://lvs-api-657638018776.us-central1.run.app/docs |
| **GitHub Pages** | https://mbanotnba.github.io/lvs-investor-portal/ |

---

## Quick Start for Developers

```bash
# Clone the repo
git clone https://github.com/Mbanotnba/lvs-investor-portal.git
cd lvs-investor-portal

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8080

# Frontend (new terminal)
cd ..
python3 -m http.server 8000

# Visit: http://localhost:8000/login.html
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GOOGLE CLOUD ARMOR                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Rate Limiting Policy (lvs-rate-limit-policy)                       │    │
│  │  • /auth/* endpoints: 10 requests/min per IP                        │    │
│  │  • All other endpoints: 100 requests/min per IP                     │    │
│  │  • Exceeds limit → HTTP 429 (Too Many Requests)                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│      CLOUD RUN: Frontend      │   │      CLOUD RUN: Backend       │
│  ┌─────────────────────────┐  │   │  ┌─────────────────────────┐  │
│  │      nginx:alpine       │  │   │  │   Python 3.11 + FastAPI │  │
│  │  • Static file serving  │  │   │  │   • JWT Authentication  │  │
│  │  • Security headers     │  │   │  │   • TOTP 2FA (Google    │  │
│  │  • SPA routing          │  │   │  │     Authenticator)      │  │
│  └─────────────────────────┘  │   │  │   • Session management  │  │
│                               │   │  │   • NDA gating          │  │
│  lvs-portal-657638018776...   │   │  └─────────────────────────┘  │
└───────────────────────────────┘   │                               │
                                    │  lvs-api-657638018776...      │
                                    └───────────────┬───────────────┘
                                                    │
                                                    ▼
                                    ┌───────────────────────────────┐
                                    │         SQLite Database       │
                                    │  • Users & credentials        │
                                    │  • Sessions (JTI tracking)    │
                                    │  • Audit logs                 │
                                    │  • Pending auth states        │
                                    └───────────────────────────────┘
```

---

## Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Email   │────▶│ Password │────▶│   2FA    │────▶│  Token   │
│  Step    │     │   Step   │     │   Step   │     │  Issued  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     ▼                ▼                ▼                ▼
 Determines      Validates        Validates        JWT + JTI
 portal type     Argon2 hash      TOTP code        30 min TTL
```

### Security Features

| Feature | Implementation |
|---------|----------------|
| **Password Hashing** | Argon2 (Password Hashing Competition winner) |
| **2FA** | TOTP-based (Google Authenticator compatible) |
| **Sessions** | Database-tracked with JTI for revocation |
| **Rate Limiting** | Cloud Armor at edge (10 req/min for auth) |
| **Account Lockout** | 5 failed attempts → 15 minute lockout |
| **NDA Gating** | Customers/partners require approval |
| **Security Headers** | HSTS, X-Frame-Options, CSP, etc. |

---

## User Types & Portal Access

| User Type | Portal | NDA Required | Example Domain |
|-----------|--------|--------------|----------------|
| **Founder** | founder-portal.html | No | lolavisionsystems.com |
| **Investor** | dashboard.html | No | Any unrecognized domain |
| **Customer** | {company}-portal.html | Yes | koniku.co, anduril.com |
| **Partner** | partner-portal.html | Yes | amd.com |

---

## Project Structure

```
lvs-investor-portal/
│
├── backend/                        # FastAPI Backend
│   ├── main.py                     # App entry, middleware, security headers
│   ├── auth.py                     # Authentication routes (email/password/2fa)
│   ├── database.py                 # SQLite operations, session management
│   ├── security.py                 # Argon2, JWT, TOTP utilities
│   ├── config.py                   # Environment configuration
│   ├── models.py                   # Pydantic request/response models
│   ├── requirements.txt            # Python dependencies
│   └── Dockerfile                  # Backend container
│
├── js/                             # Frontend JavaScript
│   ├── config.js                   # Environment detection (dev/prod URLs)
│   └── security.js                 # Session management, token validation
│
├── login.html                      # Multi-step login (email→password→2FA)
├── founder-portal.html             # Founder dashboard + NDA management
├── dashboard.html                  # Investor dashboard
├── nda-pending.html                # NDA pending notification page
├── *-portal.html                   # Customer/partner specific portals
│
├── data/                           # Static data files
│   ├── customers.json              # Customer pipeline data
│   └── financial-model.json        # Revenue projections
│
├── assets/                         # Images, videos, logos
├── Dockerfile                      # Frontend container (nginx)
└── README.md                       # This file
```

---

## Recent Upgrades (January 2026)

### v3.0 - Security Hardening & Cloud Deployment

| Upgrade | Before | After |
|---------|--------|-------|
| **Pending Auth** | In-memory dict (lost on restart) | SQLite table with TTL |
| **Rate Limiting** | None | Cloud Armor (10/100 req/min) |
| **Redirects** | Server-provided URL | Whitelist-only on frontend |
| **Credentials** | Hardcoded in source | Environment variables |
| **CORS Headers** | `allow_headers=["*"]` | Explicit list |
| **Security Headers** | None | Full suite (HSTS, CSP, etc.) |
| **Hosting** | GitHub Pages only | Cloud Run + Load Balancer |

### Security Headers Added
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/email` | Step 1: Submit email, get portal type |
| POST | `/auth/password` | Step 2: Verify password |
| POST | `/auth/2fa` | Step 3: Verify TOTP code |
| POST | `/auth/validate-token` | Validate JWT token |
| POST | `/auth/logout` | Revoke current session |
| GET | `/auth/me` | Get current user info |

### 2FA Setup
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/setup-2fa` | Generate QR code for authenticator |
| POST | `/auth/verify-2fa-setup` | Confirm 2FA setup |

### NDA Management (Founder Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/nda/users` | List users with NDA status |
| POST | `/auth/nda/approve/{id}` | Approve user's NDA |
| POST | `/auth/nda/revoke/{id}` | Revoke user's NDA |
| POST | `/auth/nda/extend/{id}` | Extend NDA expiration |

---

## GCP Infrastructure

| Resource | Name | Purpose |
|----------|------|---------|
| Cloud Run | lvs-portal | Frontend container (nginx) |
| Cloud Run | lvs-api | Backend container (FastAPI) |
| Cloud Armor | lvs-rate-limit-policy | Rate limiting at edge |
| Backend Service | lvs-api-backend | Load balancer target |
| Static IP | lvs-api-ip | 34.49.225.82 |
| SSL Certificate | lvs-api-cert | For api.lolavisionsystems.com |

---

## Environment Variables

### Backend (.env)
```bash
SECRET_KEY=              # JWT signing key (auto-generated if not set)
SEED_DEMO_USERS=false    # Set "true" to create demo users on startup
DEMO_FOUNDER_PASSWORD=   # Required if SEED_DEMO_USERS=true
DEMO_INVESTOR_PASSWORD=  # Required if SEED_DEMO_USERS=true
DEMO_CUSTOMER_PASSWORD=  # Required if SEED_DEMO_USERS=true
DEMO_PARTNER_PASSWORD=   # Required if SEED_DEMO_USERS=true
```

---

## Deployment

### Deploy to Cloud Run
```bash
# Backend
cd backend
gcloud run deploy lvs-api \
    --source . \
    --region us-central1 \
    --allow-unauthenticated \
    --project=lvs-portal-prod

# Frontend
cd ..
gcloud run deploy lvs-portal \
    --source . \
    --region us-central1 \
    --allow-unauthenticated \
    --project=lvs-portal-prod
```

### Deploy to GitHub Pages
```bash
git add -A
git commit -m "Description"
git push origin main
# Auto-deploys in ~2 minutes
```

---

## Access Control

### Session Storage Keys
```javascript
sessionStorage.getItem('lvs_auth')              // 'true' = logged in
sessionStorage.getItem('lvs_token')             // JWT token
sessionStorage.getItem('lvs_role')              // 'investor'|'customer'|'founder'|'partner'
sessionStorage.getItem('lvs_nda_allowed')       // 'true' = NDA approved
sessionStorage.getItem('lvs_founder_auth')      // 'true' = founder access
```

### Access Matrix

| Feature | Investor | Customer | Partner | Founder |
|---------|----------|----------|---------|---------|
| Investor Dashboard | ✅ | ❌ | ❌ | ✅ |
| Own Portal | N/A | ✅ | ✅ | ✅ |
| All Customer Portals | ✅ | ❌ | ❌ | ✅ |
| NDA Management | ❌ | ❌ | ❌ | ✅ |

---

## Troubleshooting

### "Login not working"
1. Check API is running: https://lvs-api-657638018776.us-central1.run.app/health
2. Check browser console for CORS errors
3. Verify user exists in database

### "2FA code rejected"
1. Ensure phone time is synced (Settings → Date/Time → Automatic)
2. TOTP has 30-second window with ±1 period tolerance

### "Rate limited (429)"
- Auth endpoints: 10 requests/minute per IP
- Wait 60 seconds and retry
- Check if behind shared IP (office NAT)

### "NDA pending"
- Customer/partner accounts need founder approval
- Founder: Go to founder-portal.html → NDA Management

---

## Team

| Name | Role | Focus |
|------|------|-------|
| Tayo Adesanya | Founder & CEO | Strategy, Customer Relations |
| Randy Hollines | VP Software Engineering | Architecture, Code Quality |
| Jordan Page | Principal Systems Engineer | Hardware Integration |
| Joshua Bush | Director Strategic Ops | Partnerships, Operations |

---

## Changelog

### 2026-01-31 (v3.0) - Security & Cloud
- Deployed to Google Cloud Run (frontend + backend)
- Added Cloud Armor rate limiting (10 req/min auth, 100 req/min general)
- Added security headers (HSTS, X-Frame-Options, CSP, etc.)
- Implemented database-backed pending auth (replaces in-memory)
- Added whitelist-based redirects (prevents open redirect attacks)
- Moved demo credentials to environment variables
- Tightened CORS to explicit headers only
- Added comprehensive API documentation at /docs

### 2026-01-28 (v2.0) - Portal System
- Added unified login with multi-step auth (email → password → 2FA)
- Added FastAPI backend with JWT + TOTP
- Added NDA gating for customers/partners
- Added 5 customer portals (Anduril, Koniku, Glid, Mach, Terrahaptix)
- Added Founder Portal with customer/NDA management
- Added session management with revocation support

### 2026-01-27 (v1.0) - Initial Release
- Static investor portal with password protection
- GitHub Pages deployment
