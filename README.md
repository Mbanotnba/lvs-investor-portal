# LVS Investor & Customer Portal

**Last Updated:** January 28, 2026
**Status:** Mockup/Demo Phase
**Maintainer:** Engineering Team

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/Mbanotnba/lvs-investor-portal.git
cd lvs-investor-portal

# Open locally (no build required - static HTML)
open index.html           # Investor Portal login
open customer-portal-mockup.html  # Customer Portal (bypass auth for testing)

# Or serve with Python for proper video playback
python3 -m http.server 8000
# Then visit http://localhost:8000
```

**Live URLs:**
- Investor Portal: https://mbanotnba.github.io/lvs-investor-portal/
- Customer Portal Mockup: https://mbanotnba.github.io/lvs-investor-portal/customer-portal-mockup.html

**Investor Portal Password:** `LVS_2026`

---

## Screenshots

Current portal screenshots (auto-generated):

### Customer Portal (Anduril)
![Customer Portal](screenshots/customer-portal.png)

### Investor Login
![Investor Login](screenshots/investor-login.png)

### Investor Roadmap
![Investor Roadmap](screenshots/investor-roadmap.png)

**Regenerate screenshots:**
```bash
./scripts/screenshot.sh
```

---

## Project Overview

This repository contains two web portals for Lola Vision Systems:

### 1. Investor Portal (`index.html` → `roadmap.html`)
Password-protected dashboard for investors showing:
- LVS-100 to LVS-250 production roadmap
- Financing timeline ($515K raised, $5M seed target)
- Key milestones (DRC cutoff, silicon delivery, tapeout)
- MPW1443 shuttle wafer run details

### 2. Customer Portal (`customer-portal-mockup.html`)
NDA-customer dashboard (currently mockup) with:
- 6-stage engagement tracker
- Product information with hero video
- Technical specifications
- Development kit details
- SDK documentation
- Document library
- Support channels

---

## File Structure

```
lvs-investor-portal/
├── index.html                    # Investor login page (password protected)
├── roadmap.html                  # Investor dashboard (post-login)
├── customer-portal-mockup.html   # Customer portal (full mockup)
├── README.md                     # This file
├── ARCHITECTURE.md               # Technical architecture details
├── scripts/
│   └── screenshot.sh             # Auto-generate portal screenshots
├── screenshots/                  # Auto-generated screenshots
│   ├── customer-portal.png       # Customer portal dashboard
│   ├── investor-login.png        # Investor login page
│   └── investor-roadmap.png      # Investor roadmap dashboard
└── assets/
    ├── lvs-logo.png              # Company logo (white on transparent)
    ├── anduril-logo.png          # Anduril customer logo
    ├── lvs-chiplet-hero.mp4      # Product hero video (12MB)
    ├── LVS_Production_Roadmap.svg # Roadmap infographic
    └── LVS_Production_Roadmap.png # PNG export of roadmap
```

---

## Architecture Overview

### Authentication Model

```
┌─────────────────────────────────────────────────────────┐
│                    CURRENT STATE                         │
│                  (Client-Side Auth)                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   index.html                    roadmap.html             │
│   ┌──────────┐                 ┌──────────────┐         │
│   │ Password │ ──validates──▶  │ Session      │         │
│   │ Input    │    hash         │ Storage      │         │
│   └──────────┘                 │ Check        │         │
│        │                       └──────────────┘         │
│        ▼                              │                  │
│   simpleHash()                        ▼                  │
│   Compare to                    Show Dashboard           │
│   '790995832'                   or Redirect              │
│                                                          │
└─────────────────────────────────────────────────────────┘

NOTE: This is demo-grade security. Production will require
server-side authentication with proper session management.
```

### Customer Portal Tab Structure

```
┌─────────────────────────────────────────────────────────┐
│  LOLA VISION SYSTEMS              [Customer Portal] [X] │
├─────────────────────────────────────────────────────────┤
│ Dashboard │ Product │ Specs │ DevKit │ SDK │ Docs │ ?  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Tab Content Area                                        │
│  (Single-page app with JS tab switching)                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

| Tab | ID | Purpose |
|-----|----|---------|
| Dashboard | `#dashboard` | Engagement progress, milestones, contact |
| Product | `#product` | Hero video, executive summary, key specs |
| Specifications | `#specs` | Full technical specifications |
| Development Kit | `#devkit` | Hardware kit contents and specs |
| Software SDK | `#sdk` | SDK architecture, code samples |
| Documents | `#documents` | Shared legal/technical docs |
| Support | `#support` | Contact channels, knowledge base |

---

## Design System

### Color Palette

```css
/* Primary Colors */
--bg: #0b1021;           /* Dark background */
--panel: #141a30;        /* Card/panel background */
--panel-light: #1a2240;  /* Lighter panel variant */

/* Accent Colors */
--accent: #7c4dff;       /* Purple - LVS brand primary */
--accent-light: #9d7aff; /* Light purple */
--gold: #d4af37;         /* Gold - premium accent */

/* Text Colors */
--text: #e6e8f0;         /* Primary text */
--muted: #9aa3c2;        /* Secondary/muted text */

/* Status Colors */
--success: #10b981;      /* Green - complete/success */
--warn: #f97316;         /* Orange - warning/critical */
--info: #06b6d4;         /* Cyan - informational */
```

### Typography

- **Primary Font:** Inter, -apple-system, BlinkMacSystemFont, sans-serif
- **Code Font:** Monaco, Consolas, monospace
- **Headings:** 700-800 weight
- **Body:** 400-600 weight

### Component Patterns

1. **Panels** - Rounded cards with subtle border (`border-radius: 16px`)
2. **Tables** - Minimal with hover states
3. **Buttons** - Primary (white/purple), Secondary (transparent)
4. **Progress Indicators** - Dot-based stage tracker
5. **Badges** - Pill-shaped status indicators

---

## Key Features

### Video Player (Product Tab)
```html
<video id="heroVideo" autoplay muted loop playsinline>
    <source src="assets/lvs-chiplet-hero.mp4" type="video/mp4">
</video>
```
- **Autoplay:** Yes (muted by default for browser compliance)
- **Loop:** Yes (continuous playback)
- **Audio Toggle:** Bottom-right button
- **Playsinline:** Prevents fullscreen on mobile

### Tab Navigation
```javascript
// Tab switching - vanilla JS, no framework
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active from all
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        // Activate selected
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});
```

### Engagement Progress Tracker
6-stage visual tracker showing customer journey:
1. Discovery → 2. NDA Signed → 3. Evaluation → 4. IRAD Active → 5. Design Win → 6. Production

---

## Data Sources (Current State)

Currently, all data is **hardcoded in HTML**. This is intentional for the mockup phase.

### Future: Centralized Data Hub

A planned `lvs-data-hub` system will provide:
- Single JSON source of truth (`lvs_master_data.json`)
- Template-based HTML generation
- Auto-rebuild on data change
- Multiple access levels (Master/Founder/Company/External/Customer)

See: `/Users/admin/Lola_Vision_Systems/09_Internal_Operations/LVS_DATA_ARCHITECTURE_PLAN.md`

---

## Testing Locally

### Basic Testing
```bash
# Just open the files directly
open customer-portal-mockup.html
```

### With Video Playback (Recommended)
```bash
# Python 3 server
python3 -m http.server 8000

# Or Node.js
npx serve .

# Then visit http://localhost:8000
```

### Test Checklist
- [ ] All 7 tabs navigate correctly
- [ ] Video autoplays (muted)
- [ ] Mute/unmute button works
- [ ] Responsive on mobile (resize browser)
- [ ] Investor portal password works (`LVS_2026`)
- [ ] Session persists after login

---

## Making Changes

### Update Content
1. Edit HTML directly in the relevant section
2. Search for the section header comment (e.g., `<!-- ==================== PRODUCT TAB ====================`)
3. Modify text/values
4. Commit and push (auto-deploys to GitHub Pages)

### Update Styles
1. All CSS is in `<style>` block at top of each HTML file
2. Use CSS variables for colors (e.g., `var(--accent)`)
3. Test responsive behavior at 768px and 1000px breakpoints

### Add New Tab
1. Add button to `.tab-nav`: `<button class="tab-btn" data-tab="newtab">New Tab</button>`
2. Add content section: `<div id="newtab" class="tab-content">...</div>`
3. Tab switching JS handles it automatically

---

## Deployment

### GitHub Pages (Current)
- **Branch:** `main`
- **Path:** `/` (root)
- **Auto-deploy:** Yes (on push to main)
- **URL:** https://mbanotnba.github.io/lvs-investor-portal/

### Manual Deploy
```bash
git add -A
git commit -m "Description of changes"
git push origin main
# GitHub Pages rebuilds automatically (~1-2 min)
```

---

## Security Notes

### Current State (Demo)
- Client-side password hash comparison
- Session storage for auth state
- No server-side validation
- Password visible in source code (hashed)

### Production Requirements
- [ ] Server-side authentication
- [ ] HTTPS enforcement
- [ ] Rate limiting on login attempts
- [ ] Proper session management
- [ ] Per-customer unique credentials
- [ ] Audit logging

---

## Related Documents

| Document | Location | Description |
|----------|----------|-------------|
| Data Architecture Plan | `09_Internal_Operations/LVS_DATA_ARCHITECTURE_PLAN.md` | Central data hub design |
| Production Roadmap SVG | `04_Technical_Documentation/Foundry/LVS_100_MPW1443/` | Source roadmap files |
| Pipeline Tracker | `06_Customer_Partner_Materials/` | Customer pipeline data |

---

## Contact

- **Engineering:** engineering@lolavisionsystems.com
- **Issues:** https://github.com/Mbanotnba/lvs-investor-portal/issues

---

## Changelog

### 2026-01-28
- Added Customer Portal mockup with 7 tabs
- Added hero video with mute controls
- Separated Specifications into own tab
- Updated data architecture plan
- Added comprehensive documentation

### 2026-01-27
- Initial investor portal with password protection
- Production roadmap SVG integration
- GitHub Pages deployment
