# LVS Portal Technical Architecture

**Document Version:** 2.0
**Last Updated:** February 1, 2026
**Audience:** Engineering Leadership, VP Software, Principal Engineers

---

## Executive Summary

This document describes the technical architecture of the LVS web portal system, including the current implementation, planned improvements, and integration points with other LVS systems.

**Current State:** Full-stack application on Google Cloud Run with Turso database
**Target State:** Enhanced with real-time features and expanded integrations

---

## System Context

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LVS DIGITAL ECOSYSTEM                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Investor   │    │   Customer   │    │   Internal   │          │
│  │    Portal    │    │    Portal    │    │  Dashboards  │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                   │                   │                   │
│         └───────────────────┼───────────────────┘                   │
│                             │                                        │
│                             ▼                                        │
│                 ┌──────────────────────┐                            │
│                 │   lvs_master_data    │  ◀── PLANNED               │
│                 │       .json          │                            │
│                 └──────────────────────┘                            │
│                             │                                        │
│         ┌───────────────────┼───────────────────┐                   │
│         ▼                   ▼                   ▼                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Pipeline   │    │  Financial   │    │   Roadmap    │          │
│  │   Tracker    │    │    Model     │    │    Data      │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Current Implementation

### Technology Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Hosting | Google Cloud Run | Auto-scaling containers |
| Frontend | Vanilla HTML/CSS/JS + nginx | Static files with security headers |
| Backend | FastAPI + Python 3.11 | JWT auth, TOTP 2FA, RESTful API |
| Database | Turso (libsql) | Cloud SQLite with embedded sync |
| Security | Cloud Armor | Rate limiting at edge |
| Video | HTML5 `<video>` | MP4 format, ~12MB |
| Styling | CSS3 with variables | Dark theme, responsive |

### File Architecture

```
lvs-investor-portal/
│
├── index.html                      [ENTRY POINT - Investor Login]
│   ├── Password input form
│   ├── simpleHash() function
│   └── Redirect to roadmap.html on success
│
├── roadmap.html                    [INVESTOR DASHBOARD]
│   ├── Session check (redirects if not authenticated)
│   ├── Financing timeline
│   ├── Key dates cards
│   ├── Embedded SVG roadmap
│   └── Summary cards
│
├── customer-portal-mockup.html     [CUSTOMER PORTAL - 7 TABS]
│   │
│   ├── <style> block               [~500 lines CSS]
│   │   ├── CSS Variables (colors, spacing)
│   │   ├── Navigation styles
│   │   ├── Tab system styles
│   │   ├── Component styles (panels, tables, cards)
│   │   ├── Video player styles
│   │   └── Responsive breakpoints
│   │
│   ├── <nav> element               [Top navigation bar]
│   │   ├── Logo
│   │   ├── Brand name
│   │   └── User controls
│   │
│   ├── .tab-nav                    [Tab button bar]
│   │   └── 7 tab buttons with data-tab attributes
│   │
│   ├── #dashboard                  [TAB 1: Dashboard]
│   │   ├── Welcome header
│   │   ├── 6-stage progress tracker
│   │   ├── Milestone checklist
│   │   └── Contact card
│   │
│   ├── #product                    [TAB 2: Product]
│   │   ├── Hero video (autoplay, muted, loop)
│   │   ├── Executive summary
│   │   └── Key specs table
│   │
│   ├── #specs                      [TAB 3: Specifications]
│   │   ├── Compute architecture
│   │   ├── Chiplet architecture
│   │   ├── Memory specs
│   │   ├── I/O specs
│   │   └── Physical specs
│   │
│   ├── #devkit                     [TAB 4: Development Kit]
│   │   ├── Feature cards
│   │   ├── Kit contents table
│   │   └── Board specifications
│   │
│   ├── #sdk                        [TAB 5: Software SDK]
│   │   ├── Architecture diagram
│   │   ├── Component cards
│   │   ├── Code sample
│   │   └── Documentation links
│   │
│   ├── #documents                  [TAB 6: Documents]
│   │   ├── Legal documents
│   │   ├── Technical documents
│   │   └── Meeting notes
│   │
│   ├── #support                    [TAB 7: Support]
│   │   ├── Support channels
│   │   ├── Contact card
│   │   └── Knowledge base
│   │
│   └── <script> block              [~40 lines JS]
│       ├── Tab switching logic
│       └── Video mute/unmute control
│
└── assets/
    ├── lvs-logo.png                [Logo - white on transparent]
    ├── lvs-chiplet-hero.mp4        [Product video - 12MB]
    ├── LVS_Production_Roadmap.svg  [Investor roadmap graphic]
    └── *.png                       [Preview screenshots]
```

---

## Component Deep Dive

### 1. Tab System

**Implementation:** Pure CSS + vanilla JavaScript

```javascript
// Tab switching mechanism
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // 1. Deactivate all tabs and content
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // 2. Activate clicked tab and its content
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});
```

**Key Points:**
- No framework dependency (React, Vue, etc.)
- Tab content identified by `data-tab` attribute matching content `id`
- CSS handles show/hide via `.active` class
- URL does not change (no deep linking currently)

**Future Enhancement:** Add URL hash support for deep linking to specific tabs.

### 2. Video Player

**HTML Structure:**
```html
<div class="hero-video-container">
    <video id="heroVideo" autoplay muted loop playsinline>
        <source src="assets/lvs-chiplet-hero.mp4" type="video/mp4">
    </video>
    <div class="video-controls">
        <button id="muteBtn" class="video-btn muted">🔇</button>
    </div>
    <div class="video-overlay">
        <h2>LVS-250</h2>
        <p>Next-Generation Neural Compute Engine</p>
    </div>
</div>
```

**Attributes Explained:**
| Attribute | Purpose |
|-----------|---------|
| `autoplay` | Start playing immediately |
| `muted` | Required for autoplay in modern browsers |
| `loop` | Restart when finished |
| `playsinline` | Prevent fullscreen on iOS |

**Audio Toggle Logic:**
```javascript
muteBtn.addEventListener('click', () => {
    heroVideo.muted = !heroVideo.muted;
    muteBtn.innerHTML = heroVideo.muted ? '🔇' : '🔊';
    muteBtn.classList.toggle('muted');
});
```

### 3. Progress Tracker

**Visual Design:**
```
    ✓────────✓────────✓────────④────────○────────○
Discovery  NDA    Evaluation  IRAD   Design   Production
                              Active   Win
```

**CSS Implementation:**
- Uses `::before` and `::after` pseudo-elements for track line
- Gradient fill shows progress percentage
- Dots positioned with flexbox `justify-content: space-between`

### 4. Authentication (Production)

**Current Flow:**
```
Step 1: Email Submission
        │
        ▼
    /auth/email → Determines portal type, stores pending auth
        │
        ▼
Step 2: Password Verification
        │
        ▼
    /auth/password → Validates Argon2 hash, checks lockout
        │
        ▼
Step 3: 2FA Verification
        │
        ▼
    /auth/2fa → Validates TOTP code (Google Authenticator)
        │
        ▼
    JWT Token Issued (30 min TTL, JTI tracked in DB)
```

**Security Features:**
- Argon2 password hashing (PHC winner)
- TOTP-based 2FA (RFC 6238)
- Database-backed sessions with JTI revocation
- Account lockout after 5 failed attempts (15 min)
- Cloud Armor rate limiting (10 req/min auth endpoints)
- NDA gating for customer/partner access

### 5. LVSComments (Account Notes)

**Purpose:** Persistent, Slack-like notes for each customer/partner account.

**Architecture:**
```
Frontend (js/comments.js)     Backend (/api/comments)     Database
        │                              │                      │
        ├── POST comment ──────────────►├── Validate token ────►│ INSERT
        │                              │                      │
        ├── GET comments ◄─────────────├◄─ Query by account ──│ SELECT
        │                              │                      │
        └── Render in container        └── Return JSON        └── Turso
```

**Usage in portals:**
```javascript
// Initialize with account ID
LVSComments.init('koniku', '#accountCommentsContainer');
```

---

## Planned Architecture (Data Hub)

### Overview

Replace hardcoded HTML with template-driven generation from centralized JSON.

```
┌─────────────────────────────────────────────────────────────────┐
│                      lvs-data-hub/                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  data/                                                           │
│  └── lvs_master_data.json     ◀── Single source of truth        │
│                                                                  │
│  templates/                                                      │
│  ├── investor_portal/         ◀── Jinja2 HTML templates         │
│  ├── customer_portal/                                            │
│  └── widgets/                                                    │
│                                                                  │
│  builders/                                                       │
│  ├── build_all.py             ◀── Master build script           │
│  ├── build_investor_portal.py                                    │
│  └── build_customer_portal.py                                    │
│                                                                  │
│  output/                      ◀── Generated static files         │
│  └── (git-ignored, deployed separately)                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Schema (Planned)

```json
{
  "meta": {
    "version": "1.0.0",
    "last_updated": "2026-01-28T12:00:00Z"
  },
  "company": {
    "name": "Lola Vision Systems",
    "tagline": "Next-Generation Neural Compute"
  },
  "products": {
    "LVS-100": { /* validation silicon specs */ },
    "LVS-250": { /* production silicon specs */ }
  },
  "financing": {
    "pre_seed": [ /* investment records */ ],
    "seed": { /* current round */ }
  },
  "milestones": [ /* roadmap milestones */ ],
  "customers": {
    "anduril": { /* customer-specific data */ }
  }
}
```

### Build Process (Planned)

```bash
# Edit data
vim data/lvs_master_data.json

# Validate schema
python builders/validate.py

# Build all outputs
python builders/build_all.py

# Outputs generated:
# - output/investor-portal/index.html
# - output/investor-portal/roadmap.html
# - output/customer-portal/anduril/index.html
# - output/exports/roadmap.png
# - output/exports/financing.png

# Deploy
git add output/ && git commit -m "Rebuild" && git push
```

---

## Access Control Matrix

### Portal Types

| Portal | Audience | Auth Method | Data Access |
|--------|----------|-------------|-------------|
| Investor | External investors | Shared password | Roadmap, financing summary |
| Customer | NDA partners | Per-customer password | Their engagement + product specs |
| Founder | Co-founders, board | Individual login | Full data |
| Internal | All employees | SSO (future) | Operational data |

### Customer Data Visibility

Each customer portal shows:
- Their engagement stage and history
- Product specs for their target product
- Documents shared with them
- Their LVS contact

Customers **cannot** see:
- Other customers' data
- Internal financials
- Pipeline details

---

## Integration Points

### Current Integrations
- **GitHub Pages:** Automatic deployment on push
- **GitHub Repo:** Version control for all assets

### Planned Integrations
- **lvs-data-hub:** Central data source
- **CRM (Salesforce/HubSpot):** Customer stage sync
- **Financial Model:** Revenue projections
- **CI/CD Pipeline:** Automated builds and tests

---

## Performance Considerations

### Current Metrics
| Metric | Value | Notes |
|--------|-------|-------|
| Page load | ~2s | Mostly video download |
| Video size | 12MB | Could compress further |
| Total assets | ~15MB | Acceptable for broadband |
| Lighthouse score | ~85 | Room for optimization |

### Optimization Opportunities
1. **Video compression:** Convert to WebM, add multiple resolutions
2. **Image optimization:** Convert PNGs to WebP
3. **CSS/JS minification:** Not critical for current scale
4. **Lazy loading:** Load tabs on demand

---

## Security Roadmap

### Phase 1: Demo (Completed)
- [x] Client-side password hash
- [x] Session storage for state
- [x] HTTPS via GitHub Pages

### Phase 2: Production (Current - Completed)
- [x] Server-hosted on Cloud Run
- [x] Server-side Argon2 password validation
- [x] JWT tokens with JTI tracking
- [x] TOTP-based 2FA (Google Authenticator)
- [x] Cloud Armor rate limiting
- [x] Database-backed sessions (Turso)
- [x] NDA gating for customer/partner access
- [x] Security headers (HSTS, CSP, X-Frame-Options)

### Phase 3: Enterprise (Planned)
- [ ] SSO integration (Okta, Auth0)
- [ ] Hardware key support (WebAuthn)
- [ ] IP allowlisting option
- [ ] Enhanced audit logging dashboard

---

## Development Workflow

### Making Changes

1. **Clone repo locally**
   ```bash
   git clone https://github.com/Mbanotnba/lvs-investor-portal.git
   ```

2. **Start local server**
   ```bash
   python3 -m http.server 8000
   ```

3. **Edit files** (HTML/CSS/JS are in single files for simplicity)

4. **Test in browser** at `http://localhost:8000`

5. **Commit and push**
   ```bash
   git add -A
   git commit -m "Description"
   git push origin main
   ```

6. **Verify deployment** at https://mbanotnba.github.io/lvs-investor-portal/

### Code Organization

Each HTML file follows this structure:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>...</title>
    <style>
        /* ======================== */
        /* CSS VARIABLES            */
        /* ======================== */
        :root { ... }

        /* ======================== */
        /* LAYOUT                   */
        /* ======================== */
        .nav { ... }
        .container { ... }

        /* ======================== */
        /* COMPONENTS               */
        /* ======================== */
        .panel { ... }
        .card { ... }

        /* ======================== */
        /* RESPONSIVE               */
        /* ======================== */
        @media (max-width: 768px) { ... }
    </style>
</head>
<body>
    <!-- ==================== SECTION NAME ==================== -->
    <div>...</div>

    <script>
        // JavaScript at bottom
    </script>
</body>
</html>
```

---

## Appendix: LVS-250 Specifications Reference

For technical accuracy, here are the official LVS-250 specifications used in the portal:

| Category | Specification |
|----------|---------------|
| Performance | ~230 TOPS (INT8), ~115 TFLOPS (FP16) |
| Package | 35 x 35 x 3.2mm BGA |
| Architecture | 5-Chiplet UCIe 2.0 |
| NPU | 64K MAC Array |
| CPU | 8-core ARM Cortex-A78AE @ 2.0GHz |
| DSP | Quad-core VDSP |
| Memory | LPDDR5, up to 32GB, 102.4 GB/s |
| Security | tRoot HSM |
| Process | GlobalFoundries 12LP+ |
| TDP | <25W typical, 35W max |
| Operating Temp | -40C to +85C |

---

## Questions?

Contact engineering@lolavisionsystems.com or open an issue on the GitHub repo.
