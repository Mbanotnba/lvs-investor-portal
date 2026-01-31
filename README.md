# LVS Investor & Customer Portal System

**Last Updated:** January 28, 2026
**Version:** 2.0
**Maintainers:** Tayo Adesanya, Randy Hollines
**Status:** Active Development

---

## Quick Start for Developers

```bash
# Clone the repo
git clone https://github.com/Mbanotnba/lvs-investor-portal.git
cd lvs-investor-portal

# Serve locally (required for proper functionality)
python3 -m http.server 8000
# Visit: http://localhost:8000/login.html

# Or use Node.js
npx serve .
```

### Access

Access credentials are managed internally. Contact Tayo Adesanya for access.

**Live Site:** https://mbanotnba.github.io/lvs-investor-portal/

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LVS PORTAL SYSTEM ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐                                                          │
│   │  login.html  │  ◄── Unified entry point with role selection             │
│   │              │      Team Demo Mode available                            │
│   └──────┬───────┘                                                          │
│          │                                                                   │
│          ├─────────────────┬─────────────────┬─────────────────┐           │
│          ▼                 ▼                 ▼                 ▼           │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   │
│   │  INVESTOR   │   │   FOUNDER   │   │  CUSTOMER   │   │   LEGACY    │   │
│   │  dashboard  │   │   founder-  │   │  *-portal   │   │  index.html │   │
│   │    .html    │   │  portal.html│   │    .html    │   │  (redirect) │   │
│   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   │
│          │                 │                 │                              │
│          │                 │                 └── Customer-specific portals  │
│          │                 │                     (Anduril, Koniku, etc.)    │
│          │                 │                                                │
│          │                 └── Full access to all portals                   │
│          │                                                                   │
│          └── Can view investor dashboard + customer portals                 │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│   DATA LAYER (JSON)                                                          │
│   ┌────────────────────┐    ┌────────────────────────┐                      │
│   │ data/customers.json│    │ data/financial-model.json│                    │
│   │ - 21 customers     │    │ - Revenue projections    │                    │
│   │ - Pipeline data    │    │ - 2026/2027/2028 weighted│                    │
│   │ - Gov engagements  │    │ - Breakdown by source    │                    │
│   └────────────────────┘    └────────────────────────┘                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
lvs-investor-portal/
│
├── 🔐 ACCESS CONTROL
│   ├── login.html              # Unified login (Investor/Customer/Founder)
│   ├── index.html              # Legacy investor login (redirects work)
│   └── founder-login.html      # Legacy founder login
│
├── 📊 INVESTOR PORTAL
│   ├── dashboard.html          # Main investor dashboard (metrics, highlights)
│   ├── pipeline.html           # Customer pipeline by tier
│   ├── financials.html         # Financial model & projections
│   ├── seed-round.html         # Seed round details & SAFE terms
│   └── roadmap.html            # Production timeline
│
├── 👔 FOUNDER PORTAL
│   └── founder-portal.html     # Customer management dashboard
│
├── 🏢 CUSTOMER PORTALS
│   ├── customer-portal-mockup.html  # Anduril Industries
│   ├── koniku-portal.html           # Koniku (MOU Proposed)
│   ├── glid-portal.html             # Glid Technologies
│   ├── mach-portal.html             # Mach Industries (Stalled)
│   └── terrahaptix-portal.html      # Terrahaptix
│
├── 📁 DATA
│   └── data/
│       ├── customers.json           # All customer data + gov engagements
│       └── financial-model.json     # Revenue projections
│
├── 🎨 ASSETS
│   └── assets/
│       ├── lvs-logo.png             # Company logo
│       ├── demos/                   # Demo videos
│       └── testimonials/            # Testimonial videos
│
├── 📖 DOCUMENTATION
│   ├── README.md                    # This file
│   ├── ARCHITECTURE.md              # Technical deep-dive
│   └── DEVELOPER_GUIDE.md           # How to make changes
│
└── 🛠️ SCRIPTS
    └── scripts/
        └── screenshot.sh            # Generate screenshots
```

---

## Access Control System

### Session Storage Keys

```javascript
// Set on login - check these to determine access level
sessionStorage.getItem('lvs_auth')              // 'true' = logged in
sessionStorage.getItem('lvs_role')              // 'investor' | 'customer' | 'founder'
sessionStorage.getItem('lvs_can_view_customers') // 'true' = can browse all customer portals
sessionStorage.getItem('lvs_founder_auth')       // 'true' = founder access
sessionStorage.getItem('lvs_team_mode')          // 'true' = team demo mode
sessionStorage.getItem('lvs_customer')           // Customer ID (e.g., 'anduril')
```

### Access Matrix

| Feature | Investor | Customer | Founder |
|---------|----------|----------|---------|
| Investor Dashboard | ✅ | ❌ | ✅ |
| Pipeline Details | ✅ | ❌ | ✅ |
| Financial Model | ✅ | ❌ | ✅ |
| Seed Round Info | ✅ | ❌ | ✅ |
| Own Customer Portal | ✅ | ✅ | ✅ |
| All Customer Portals | ✅ | ❌ | ✅ |
| Founder Dashboard | ❌ | ❌ | ✅ |

---

## Data Architecture

### customers.json Structure

```json
{
  "customers": [
    {
      "id": "anduril",                    // Unique identifier
      "name": "Anduril Industries",       // Display name
      "industry": "Defense Tech",         // Industry category
      "tier": 1,                          // 1, 2, or 3
      "product": "LVS-250",               // Target product
      "currentStage": 3,                  // 1-6 engagement stage
      "stages": [...],                    // Stage progression
      "milestones": [...],                // Key milestones
      "summary": {
        "status": "IRAD Proposed",        // Current status
        "totalValue": "$15,000,000",      // Deal value
        "probability": "60%",             // Win probability
        "weightedValue": "$9,000,000",    // value × probability
        "primaryContact": "Name"          // Main contact
      },
      "nextActions": [...]                // Pending tasks
    }
  ],
  "governmentEngagements": [
    {
      "id": "army-iews",
      "name": "US Army IEW&S / C5ISR",
      "strategy": "OEM Partner Positioning",
      "oem_partners": [...],
      "potentialImpact": {...}
    }
  ]
}
```

### financial-model.json Structure

```json
{
  "lastUpdated": "January 28, 2026",
  "weightedRevenue": {
    "2026": { "amount": "$1,200,000", "value": 1200000, "breakdown": {...} },
    "2027": { "amount": "$12,400,000", "value": 12400000, "breakdown": {...} },
    "2028": { "amount": "$28,000,000", "value": 28000000, "breakdown": {...} }
  },
  "cumulativeWeighted": {
    "threeYear": "$41,600,000"
  }
}
```

---

## Common Tasks

### Add a New Customer Portal

1. **Copy template:**
   ```bash
   cp koniku-portal.html newcustomer-portal.html
   ```

2. **Find & replace:**
   - `Koniku` → `New Customer`
   - `koniku` → `newcustomer`
   - Update all customer-specific data (stage, value, milestones)

3. **Add to customers.json:**
   ```json
   {
     "id": "newcustomer",
     "name": "New Customer Inc",
     ...
   }
   ```

4. **Add to founder-portal.html:**
   ```javascript
   const customersWithPortals = ['anduril', 'terrahaptix', 'koniku', 'glid', 'mach', 'newcustomer'];
   ```
   And add the portal link logic.

5. **Add to login.html** (customer dropdown):
   ```html
   <option value="newcustomer">New Customer Inc</option>
   ```

6. **Add to dashboard.html** (Customer Portals section)

### Update Pipeline Metrics

1. **Edit dashboard.html** - Top metrics grid
2. **Edit pipeline.html** - Tier tables and totals
3. **Edit data/customers.json** - Source of truth

### Update Financial Projections

1. **Edit data/financial-model.json** - Update values
2. **Dashboard auto-updates** from the card display
3. **financials.html auto-loads** from JSON

### Change Access Passwords

Password management is handled internally. Contact the development team for credential updates.

---

## Design System

### Colors (CSS Variables)

```css
:root {
    --bg: #0a0a0f;           /* Page background */
    --panel: #12121a;        /* Card background */
    --panel-light: #1a1a24;  /* Lighter panels */
    --text: #f5f5f7;         /* Primary text */
    --muted: #6b7280;        /* Secondary text */
    --accent: #7c4dff;       /* Purple - primary brand */
    --gold: #d4af37;         /* Gold - premium/founder */
    --success: #10b981;      /* Green - complete/good */
    --warn: #f59e0b;         /* Orange - warning */
}
```

### Status Badge Classes

```css
.stage-badge.negotiation  /* Green */
.stage-badge.evaluation   /* Purple */
.stage-badge.opportunity  /* Orange */
.stage-badge.discovery    /* Gray */
.stage-badge.proposed     /* Cyan */
.stage-badge.stalled      /* Yellow */
```

---

## Deployment

### Automatic (GitHub Pages)

```bash
git add -A
git commit -m "Description of changes"
git push origin main
# Auto-deploys in ~1-2 minutes
```

### Verify Deployment

1. Visit: https://mbanotnba.github.io/lvs-investor-portal/
2. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
3. Check GitHub Actions if issues

---

## Troubleshooting

### "Changes not showing on live site"
- Wait 1-2 minutes for GitHub Pages rebuild
- Hard refresh browser (`Cmd+Shift+R`)
- Check git push succeeded: `git log --oneline -1`

### "Login not working"
- Check sessionStorage in browser dev tools
- Verify password hash matches in login.html
- Clear sessionStorage: `sessionStorage.clear()`

### "Customer portal not loading"
- Check file exists and naming matches
- Verify added to customersWithPortals array
- Check browser console for errors

### "Videos not playing"
- Must serve via HTTP server (not file://)
- Check assets/demos/ and assets/testimonials/ folders
- Verify video format is MP4

---

## Team

| Name | Role | Focus Areas |
|------|------|-------------|
| Tayo Adesanya | Founder & CEO | Strategy, Customer Relations |
| Randy Hollines | VP Software Engineering | Architecture, Code Quality |
| Jordan Page | Principal Systems Engineer | Hardware Integration |
| Joshua Bush | Director Strategic Ops | Partnerships, Operations |

---

## Contact & Support

- **Code Issues:** Create GitHub issue or ping Randy
- **Content Updates:** Coordinate with Tayo
- **Deployment Help:** Check this README first

---

## Changelog

### 2026-01-28 (v2.0)
- Added unified login system with role selection
- Added 5 customer portals (Anduril, Koniku, Glid, Mach, Terrahaptix)
- Added Founder Portal with customer management
- Added Team section to investor dashboard
- Added Government Engagements tracking (US Army IEW&S)
- Added Financial Model with 3-year projections
- Added Seed Round details page
- Implemented role-based access control
- Added Team Demo Mode for persona switching

### 2026-01-27 (v1.0)
- Initial investor portal with password protection
- Production roadmap integration
- GitHub Pages deployment
