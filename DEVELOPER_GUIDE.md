# LVS Portal Developer Guide

**For:** Randy Hollines, VP Software Engineering
**Updated:** January 28, 2026

This guide covers everything you need to jump in and make changes to the LVS portal system.

---

## Table of Contents

1. [Architecture At a Glance](#architecture-at-a-glance)
2. [Tech Stack](#tech-stack)
3. [File Organization](#file-organization)
4. [How Authentication Works](#how-authentication-works)
5. [Data Flow](#data-flow)
6. [Making Common Changes](#making-common-changes)
7. [Code Patterns](#code-patterns)
8. [Deployment Workflow](#deployment-workflow)
9. [Future Improvements](#future-improvements)

---

## Architecture At a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ENTRY                               │
│                                                                  │
│   login.html ────┬──► Investor ──► dashboard.html               │
│   (unified)      │                      │                        │
│                  ├──► Founder ──► founder-portal.html           │
│                  │                      │                        │
│                  └──► Customer ──► [customer]-portal.html       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                         DATA LAYER                               │
│                                                                  │
│   data/customers.json      ◄── Source of truth for pipeline     │
│   data/financial-model.json ◄── Revenue projections             │
│                                                                  │
│   Note: Most data is still hardcoded in HTML for speed.         │
│   JSON files are used where dynamic loading makes sense.        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                         STORAGE                                  │
│                                                                  │
│   sessionStorage ◄── Auth state, role, permissions              │
│   (browser)         Cleared on tab close                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

**Frontend:** Pure HTML/CSS/JS (no frameworks)
- Why: Fast iteration, no build step, easy for anyone to edit
- Trade-off: Some code duplication across files

**Hosting:** GitHub Pages
- Auto-deploys on push to `main`
- Free, reliable, HTTPS included

**Data:** Static JSON files
- `data/customers.json` - Customer pipeline
- `data/financial-model.json` - Financial projections

**Auth:** Client-side sessionStorage
- Demo-grade security (password hash visible in source)
- Production would need server-side auth

---

## File Organization

### Portal Files (Main UI)

| File | Purpose | Auth Required |
|------|---------|---------------|
| `login.html` | Unified login with role selection | No |
| `dashboard.html` | Investor metrics, highlights, team | Investor/Founder |
| `pipeline.html` | Customer pipeline by tier | Investor/Founder |
| `financials.html` | Revenue projections (loads JSON) | Investor/Founder |
| `seed-round.html` | Seed round terms, SAFE details | Investor/Founder |
| `roadmap.html` | Production timeline | Investor/Founder |
| `founder-portal.html` | Customer management for founders | Founder only |
| `*-portal.html` | Individual customer portals | Varies |

### Data Files

```
data/
├── customers.json         # 21 customers + government engagements
└── financial-model.json   # 2026-2028 revenue projections
```

### Assets

```
assets/
├── lvs-logo.png           # Main logo (used everywhere)
├── demos/
│   ├── demo-1.mp4         # Day detection demo
│   └── demo-2.mp4         # Night detection demo
└── testimonials/
    └── *.mp4              # Expert testimonial videos
```

---

## How Authentication Works

### Login Flow (login.html)

```javascript
// 1. User selects role (investor/customer/founder)
// 2. User enters credentials
// 3. Password is hashed client-side

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return String(Math.abs(hash));
}

// 4. Hash compared against stored hash
// 5. On success, set sessionStorage flags:

sessionStorage.setItem('lvs_auth', 'true');
sessionStorage.setItem('lvs_role', 'investor'); // or 'customer' or 'founder'
sessionStorage.setItem('lvs_can_view_customers', 'true'); // for investor/founder

// 6. Redirect to appropriate portal
```

### Auth Check (on protected pages)

```javascript
// At top of each protected page:
<script>
    if (sessionStorage.getItem('lvs_auth') !== 'true') {
        window.location.href = 'index.html';
    }
</script>
```

### Session Storage Keys

| Key | Values | Purpose |
|-----|--------|---------|
| `lvs_auth` | 'true' | User is logged in |
| `lvs_role` | 'investor'/'customer'/'founder' | User's role |
| `lvs_can_view_customers` | 'true' | Can view all customer portals |
| `lvs_founder_auth` | 'true' | Has founder-level access |
| `lvs_founder_email` | email | Founder's email |
| `lvs_customer` | 'anduril'/'koniku'/etc | Customer's company ID |
| `lvs_team_mode` | 'true' | Team demo mode active |

---

## Data Flow

### Customer Data (customers.json → HTML)

```
┌──────────────────┐     ┌────────────────┐     ┌─────────────┐
│ customers.json   │────►│ founder-portal │────►│ Display in  │
│                  │     │ .html (fetch)  │     │ customer    │
│ {                │     │                │     │ cards       │
│   "customers":[],│     │ JavaScript     │     │             │
│   "govEngage":[] │     │ parses JSON    │     │             │
│ }                │     │                │     │             │
└──────────────────┘     └────────────────┘     └─────────────┘
```

### Financial Data (financial-model.json → HTML)

```
┌──────────────────┐     ┌────────────────┐     ┌─────────────┐
│ financial-model  │────►│ financials.html│────►│ Charts &    │
│ .json            │     │ (async fetch)  │     │ metrics     │
│                  │     │                │     │ rendered    │
│ {                │     │ loadFinancial  │     │             │
│   "2026": {...}, │     │ Data()         │     │             │
│   "2027": {...}  │     │                │     │             │
│ }                │     │                │     │             │
└──────────────────┘     └────────────────┘     └─────────────┘
```

### Static Data (hardcoded in HTML)

Most dashboard metrics are still hardcoded directly in HTML:
- Faster page load (no fetch)
- Easier to edit for quick updates
- Trade-off: Must update multiple files for some changes

---

## Making Common Changes

### 1. Update a Customer's Status

**Files to edit:**
- `data/customers.json` - Source of truth
- `pipeline.html` - Pipeline table (if Tier 1-3)
- `dashboard.html` - Key Highlights section (if featured)
- `[customer]-portal.html` - Customer's own portal

**Example: Change Koniku from "MOU Proposed" to "MOU Signed"**

```bash
# 1. Edit customers.json
# Find "id": "koniku" and update:
"status": "MOU Signed"

# 2. Edit pipeline.html
# Find Koniku row, change badge:
<span class="stage-badge signed">MOU Signed</span>

# 3. Edit dashboard.html (Key Highlights)
# Update the Koniku card

# 4. Edit koniku-portal.html
# Update stage tracker and milestones
```

### 2. Add a New Team Member

**File:** `dashboard.html`

Find the Team section (search for `<!-- Team Section -->`):

```html
<!-- Add to Full-Time or Part-Time div -->
<div style="background: var(--panel-light); padding: 14px 16px; border-radius: 10px; display: flex; align-items: center; gap: 14px;">
    <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #COLOR1, #COLOR2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">XX</div>
    <div>
        <div style="font-size: 14px; font-weight: 600;">Name Here</div>
        <div style="font-size: 12px; color: var(--muted);">Title Here</div>
    </div>
</div>
```

Don't forget to update the team count stats!

### 3. Update Pipeline Totals

**Files:** `dashboard.html`, `pipeline.html`

```bash
# dashboard.html - Top metrics
Search: "Total Pipeline"
Update: <div class="metric-value gold">$XXX</div>

Search: "Weighted Pipeline"
Update: <div class="metric-value accent">$XXX</div>

# pipeline.html - Tier totals
Search: "tier-total"
Update: <span class="tier-total">X customers | $XXXM total | $XXM weighted</span>
```

### 4. Add a New Customer Portal

```bash
# 1. Copy template
cp koniku-portal.html newcustomer-portal.html

# 2. Global find/replace in new file:
#    "Koniku" → "New Customer"
#    "koniku" → "newcustomer"
#    "KONIKU" → "NEWCUSTOMER"

# 3. Update customer-specific details:
#    - Stage tracker dates
#    - Milestones
#    - Partnership summary values
#    - Next actions

# 4. Add to founder-portal.html:
const customersWithPortals = ['anduril', 'terrahaptix', 'koniku', 'glid', 'mach', 'newcustomer'];

# And add to portal link logic:
} else if (customer.id === 'newcustomer') {
    portalLink.href = 'newcustomer-portal.html';
    portalLink.onclick = null;
    portalLink.style.opacity = '1';
}

# 5. Add to customers.json
# 6. Add to login.html customer dropdown
# 7. Add to dashboard.html Customer Portals section (for investors)
```

### 5. Update Financial Projections

**File:** `data/financial-model.json`

```json
{
  "weightedRevenue": {
    "2027": {
      "amount": "$12,400,000",    // Display string
      "value": 12400000,          // Numeric for calculations
      "notes": "Description",
      "breakdown": {
        "koniku": "$7,400,000",
        "otherProduction": "$3,500,000",
        "irad": "$1,500,000"
      }
    }
  }
}
```

Also update:
- `dashboard.html` - Financial Model card stats
- `cumulativeWeighted.threeYear` in the JSON

---

## Code Patterns

### CSS Variables (use these!)

```css
/* Always use variables for consistency */
color: var(--text);           /* Not #f5f5f7 */
background: var(--panel);     /* Not #12121a */
border-color: var(--accent);  /* Not #7c4dff */
```

### Status Badge Pattern

```html
<span class="stage-badge negotiation">Negotiation</span>
<span class="stage-badge evaluation">Evaluation</span>
<span class="stage-badge proposed">MOU Proposed</span>
<span class="stage-badge stalled">Stalled</span>
```

### Panel Card Pattern

```html
<div class="funding-section" style="border-left: 3px solid var(--accent);">
    <h3 style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 20px;">EMOJI</span> Section Title
    </h3>
    <!-- Content -->
</div>
```

### Metric Card Pattern

```html
<div class="metric-card">
    <div class="metric-label">Label</div>
    <div class="metric-value gold">$XXX</div>
    <div class="metric-sub">Subtitle</div>
</div>
```

### Tab Navigation (customer portals)

```javascript
// All tabs use this pattern - it's automatic
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});
```

---

## Deployment Workflow

### Standard Deploy

```bash
# Make changes
git add -A
git commit -m "Clear description of changes

- Bullet point details
- What was added/changed/fixed

Co-Authored-By: Your Name <email>"

git push origin main
# Wait 1-2 min, then verify at live URL
```

### Quick Check Before Push

```bash
# See what's changed
git status
git diff

# Check for common issues
grep -r "TODO" *.html       # Unfinished work
grep -r "console.log" *.html # Debug statements left in
```

### Rollback If Needed

```bash
# See recent commits
git log --oneline -10

# Revert to previous commit (creates new commit)
git revert HEAD

# Or reset to specific commit (destructive!)
git reset --hard COMMIT_HASH
git push --force origin main  # Only if absolutely necessary
```

---

## Future Improvements

### Short-term (Easy Wins)
- [ ] Add loading spinners for JSON fetches
- [ ] Add error handling for failed data loads
- [ ] Consolidate duplicate CSS into shared stylesheet

### Medium-term (Recommended)
- [ ] Move all data to JSON files (single source of truth)
- [ ] Add build step to inject data into HTML templates
- [ ] Add unit tests for critical paths

### Long-term (Production-Ready)
- [ ] Server-side authentication (Auth0 or custom)
- [ ] Database backend (PostgreSQL/Supabase)
- [ ] API layer for data operations
- [ ] Audit logging for compliance
- [ ] Multi-tenant customer portal system

---

## Quick Reference

### File → Purpose

| If you need to... | Edit this file |
|-------------------|----------------|
| Change login behavior | `login.html` |
| Update investor metrics | `dashboard.html` |
| Update pipeline table | `pipeline.html` |
| Update financial projections | `data/financial-model.json` + `dashboard.html` |
| Update seed round terms | `seed-round.html` |
| Add customer portal | Create `[name]-portal.html` + update 5 files |
| Update customer data | `data/customers.json` |
| Change team members | `dashboard.html` (Team section) |

### Common CSS Variables

| Variable | Color | Use For |
|----------|-------|---------|
| `--accent` | Purple #7c4dff | Primary brand, links |
| `--gold` | Gold #d4af37 | Premium, founder, money |
| `--success` | Green #10b981 | Complete, positive |
| `--warn` | Orange #f59e0b | Warning, attention |
| `--muted` | Gray #6b7280 | Secondary text |

---

## Need Help?

1. **Check this guide first** - Most answers are here
2. **Search the codebase** - `grep -r "keyword" .`
3. **Check browser console** - F12 → Console tab
4. **Ask Tayo** - For business logic questions
5. **Create GitHub issue** - For bugs or feature requests

---

*Last updated: January 28, 2026 by Engineering Team*
