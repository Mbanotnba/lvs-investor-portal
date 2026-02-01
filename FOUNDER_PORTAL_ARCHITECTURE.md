# LVS Founder Portal - Architecture Plan

## Overview

A unified access point for LVS founders to:
1. View and manage all customer relationships
2. Access investor materials
3. Post team updates
4. (Future) Slack integration

---

## Authentication Flow

### Current Implementation (Completed)
```
Step 1: Email Submission
    ↓
Step 2: Password Verification (Argon2)
    ↓
Step 3: TOTP Code (Google Authenticator)
    ↓
JWT Token Issued → Founder Dashboard
```

**Implementation Details:**
- Self-hosted TOTP using `pyotp` library
- Argon2 password hashing via `argon2-cffi`
- JWT tokens with 30-minute TTL
- Database-backed sessions with JTI tracking
- Account lockout after 5 failed attempts

---

## Portal Structure

```
┌─────────────────────────────────────────────────────────────┐
│  FOUNDER PORTAL                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  CUSTOMERS  │  │  INVESTORS  │  │    TEAM     │          │
│  │   (CRM)     │  │  (Portal)   │  │  (Updates)  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Customer Management Module

### Customer List View
- Grid/List of all 20 customers from pipeline
- Quick status indicators (stage, next action due)
- Search/filter by tier, stage, product
- Mobile: Card-based scrollable list

### Individual Customer View
```
┌─────────────────────────────────────────────────────────────┐
│  [Company Logo]  ANDURIL INDUSTRIES           [Edit] [Back] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ENGAGEMENT PROGRESS                                         │
│  ○───○───●───○───○───○                                       │
│  Discovery → NDA → IRAD Proposed → Eval → Integration → Prod│
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  MILESTONES                          │  PARTNERSHIP SUMMARY  │
│  ✓ NDA Executed (Aug 2025)           │  Status: Under Review │
│  ✓ LOI Signed (Jan 2026)             │  Product: LVS-250     │
│  ● IRAD Proposal Under Review        │  Value: $15M          │
│  ○ Technical Evaluation              │  Probability: 60%     │
│  ○ Integration Testing               │  Contact: Chaffra J.  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  NEXT ACTIONS                                                │
│  [ ] Follow up on IRAD proposal - Due: Feb 15, 2026         │
│  [ ] Schedule technical deep-dive - Due: Feb 28, 2026       │
│  [ ] Prepare demo environment - Due: Mar 10, 2026           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  ACTIVITY LOG                                                │
│  Jan 28 - Updated proposal status to "Under Review"         │
│  Jan 15 - Submitted IRAD proposal ($650K)                   │
│  Jan 10 - LOI signed                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Structure (customers.json)
```json
{
  "customers": [
    {
      "id": "anduril",
      "name": "Anduril Industries",
      "logo": "assets/customers/anduril-logo.png",
      "industry": "Defense Tech - ISR/C-UAS",
      "tier": 1,
      "product": "LVS-250",
      "stage": 3,
      "stages": [
        {"name": "Discovery", "date": "Jun 2025", "complete": true},
        {"name": "NDA Signed", "date": "Aug 2025", "complete": true},
        {"name": "IRAD Proposed", "date": "Jan 2026", "complete": false, "current": true},
        {"name": "Evaluation", "date": "TBD", "complete": false},
        {"name": "Integration", "date": "TBD", "complete": false},
        {"name": "Production", "date": "Q2 2027", "complete": false}
      ],
      "milestones": [
        {"title": "NDA Executed", "date": "Aug 15, 2025", "status": "complete"},
        {"title": "LOI Signed", "date": "Jan 2026", "status": "complete"},
        {"title": "IRAD Proposal Under Review", "date": "Pending", "status": "in-progress"},
        {"title": "Technical Evaluation", "date": "TBD", "status": "pending"}
      ],
      "summary": {
        "status": "Under Review",
        "product": "LVS-250",
        "totalValue": "$15,000,000",
        "nearTermValue": "$650,000",
        "probability": "60%",
        "weightedValue": "$9,000,000",
        "expectedClose": "Q2 2026",
        "primaryContact": "Chaffra Joseph",
        "contactRole": "Technical Lead"
      },
      "nextActions": [
        {"task": "Follow up on IRAD proposal", "due": "2026-02-15", "assigned": "Tayo"},
        {"task": "Schedule technical deep-dive", "due": "2026-02-28", "assigned": "Randy"},
        {"task": "Prepare demo environment", "due": "2026-03-10", "assigned": "Jordan"}
      ],
      "activityLog": [
        {"date": "2026-01-28", "note": "Updated proposal status to Under Review"},
        {"date": "2026-01-15", "note": "Submitted IRAD proposal ($650K)"},
        {"date": "2026-01-10", "note": "LOI signed"}
      ]
    }
  ]
}
```

---

## Investor Portal Access

Direct links to existing investor portal pages:
- Dashboard → `/dashboard.html`
- Pipeline → `/pipeline.html`
- Roadmap → `/roadmap.html`
- Financial Model → `/financials.html` (coming soon)

---

## Team Updates Module

### Post Update
- Title + Body text
- Tag customers mentioned
- Visibility: All / Specific team members
- (Future) Auto-post to Slack channel

### View Updates
- Chronological feed
- Filter by customer, author, date
- Search functionality

### Data Structure (updates.json)
```json
{
  "updates": [
    {
      "id": "update-001",
      "author": "Tayo Adesanya",
      "date": "2026-01-28T10:30:00Z",
      "title": "Anduril IRAD Update",
      "body": "Just got off the phone with Chaffra...",
      "customers": ["anduril"],
      "visibility": "all"
    }
  ]
}
```

---

## Slack Integration (Future)

### Planned Features
1. **Post updates to Slack** when created in portal
2. **Receive Slack notifications** for customer milestones
3. **Slash commands** to query customer status
4. **/lvs anduril** → Returns quick status summary

### Implementation
- Slack App with OAuth
- Webhook for outgoing messages
- Bot for incoming commands
- Channel: #lvs-crm or #customer-updates

---

## Technical Implementation

### Files to Create
```
lvs-investor-portal/
├── founder-login.html      # 2FA login page
├── founder-portal.html     # Main dashboard
├── founder-customers.html  # Customer list view
├── founder-customer.html   # Individual customer view
├── founder-updates.html    # Team updates feed
├── data/
│   ├── customers.json      # Customer data
│   └── updates.json        # Team updates
└── js/
    └── founder-auth.js     # Auth logic (2FA ready)
```

### Mobile Responsiveness
- All views must work on iPhone/Android
- Customer list: Card-based layout on mobile
- Customer detail: Stacked sections
- Bottom navigation for quick switching

---

## Implementation Phases

### Phase 1: MVP (Completed)
- [x] Create founder-portal.html with full authentication
- [x] Create customers.json with all 20+ customers
- [x] Build customer list view with filtering
- [x] Build individual customer view
- [x] Link to existing investor portal
- [x] NDA management interface

### Phase 2: Team Features (Completed)
- [x] Activity logging (session tracking)
- [x] Account notes via LVSComments
- [ ] Next actions management

### Phase 3: Authentication (Completed)
- [x] Implement 2FA with Google Authenticator (TOTP)
- [x] Domain-based portal routing
- [x] Session management with JTI tracking
- [x] JWT tokens with expiration
- [x] Cloud Armor rate limiting

### Phase 4: Integrations (Planned)
- [ ] Slack integration
- [ ] Email notifications
- [ ] Calendar sync for due dates

---

## Security Considerations (Implemented)

1. **Server-side data validation** - All sensitive operations via API
2. **2FA required** - TOTP via Google Authenticator ✓
3. **Domain-based routing** - Portal type determined by email domain ✓
4. **Session timeout** - 30-minute JWT expiration ✓
5. **Audit log** - Sessions table tracks all access ✓
6. **Rate limiting** - Cloud Armor at edge (10 req/min auth) ✓
7. **Security headers** - HSTS, CSP, X-Frame-Options ✓
8. **Password security** - Argon2 hashing, lockout after failures ✓

---

## Next Steps

1. Review this architecture with team
2. Decide on auth provider (Firebase recommended)
3. Build Phase 1 MVP
4. Test on mobile devices
5. Iterate based on feedback
