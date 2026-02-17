# LVS Startup Laptop Procurement: Action Plan

**Budget:** $20,000 for 8-9 laptops
**Timeline:** ASAP
**Target Compliance:** CMMC Level 2, SOC2, ITAR-ready
**Customers:** AFRL, DIU, Defense primes

---

## The Startup Reality Check

You're in a sweet spot: **clean slate advantage**. Most startups accumulate technical debt and then scramble to retrofit compliance. You can build it right from day one.

**Key Insight:** CMMC Phase 1 started November 10, 2025. All new DoD contracts (including SBIR/STTR) now require valid CMMC Level 1 or 2 self-assessment in SPRS. No assessment = no awards.

---

## Recommended Approach: Dell Small Business (Not Federal, Not Retail)

### Why This Middle Path?

| Channel | Speed | Compliance | Cost | Best For |
|---------|-------|------------|------|----------|
| Best Buy / Retail | Fast | ❌ Poor | Low | Never for defense |
| Dell Federal | Slow | ✅ Excellent | Higher | Large contracts, CUI |
| **Dell Small Business** | **Fast** | **✅ Good** | **Moderate** | **Startups like you** |

**Dell Small Business** gives you:
- Business-class hardware with proper invoicing
- ProSupport warranty (US-based support)
- Clean Windows Pro images (no bloatware)
- Asset tagging and serial number documentation
- Volume discounts at 5+ units
- Ships in days, not weeks

---

## Recommended Configuration

### For Developers (Randy's Team) - 4 units

**Dell Precision 3480 or 3490** (14" Workstation)
- Intel Core Ultra 7 or AMD Ryzen 9 PRO
- 32GB RAM (upgradeable to 64GB)
- 512GB NVMe SSD
- Windows 11 Pro
- 3-Year ProSupport

**Estimated Price:** ~$1,800-2,200 each
**Subtotal:** ~$7,200-8,800

*Note: For heavy local AI, consider 1-2 Precision 5690/7680 with 64GB RAM at ~$3,000 each*

### For Business/Executive (Tayo + others) - 4-5 units

**Dell Latitude 5450 or 5550**
- Intel Core Ultra 5/7
- 16GB RAM
- 512GB NVMe SSD
- Windows 11 Pro
- 3-Year ProSupport

**Estimated Price:** ~$1,400-1,800 each
**Subtotal:** ~$5,600-9,000

### Total Hardware Estimate

| Config | Units | Unit Price | Total |
|--------|-------|------------|-------|
| Precision 3480/3490 | 4 | $2,000 | $8,000 |
| Latitude 5450/5550 | 5 | $1,600 | $8,000 |
| **Hardware Total** | **9** | | **$16,000** |
| ProSupport 3-Year | included | | $0 |
| **Remaining Budget** | | | **$4,000** |

Use remaining $4,000 for:
- MDM licensing (~$500/year)
- Endpoint protection (~$400/year)
- USB security keys for MFA (~$400)
- Reserve for accessories/docks

---

## How to Order (This Week)

### Step 1: Contact Dell Small Business
**Phone:** 1-877-275-3355
**Online:** [dell.com/small-business](https://www.dell.com/en-us/shop/deals/business-pc-deals)

**Say This:**
> "We're a defense tech startup procuring 9 laptops for a team working with DoD customers. We need business-class machines with ProSupport, clean Windows Pro images, and documentation for compliance purposes. Can you provide asset tags and a quote for Precision and Latitude models?"

### Step 2: Request These Specifics
- [ ] Business invoice (not consumer receipt)
- [ ] Serial numbers on invoice
- [ ] Asset tagging if available
- [ ] Clean Windows 11 Pro image (no consumer bloatware)
- [ ] 3-Year ProSupport included
- [ ] TPM 2.0 confirmation (standard on all business models)

### Step 3: Payment
- Business credit card or purchase order
- Keep invoice for compliance documentation
- Net 30 terms may be available for established businesses

---

## Day-One Compliance Setup

### Before First Boot (Critical)

1. **Document Everything**
   - Create spreadsheet: Serial #, Model, Purchase Date, Assigned User
   - Save invoice as `LVS_Hardware_Invoice_2026-02.pdf`
   - This becomes your asset inventory for CMMC

2. **Enable BitLocker Before Setup**
   - Windows 11 Pro includes BitLocker
   - Enable during OOBE (Out of Box Experience)
   - Store recovery keys in secure location (not on the device)

3. **Create Local Admin, Not Microsoft Account**
   - First account should be local admin
   - User accounts come later via MDM/Azure AD

### Week One: Foundation

| Task | Tool | Cost | CMMC Control |
|------|------|------|--------------|
| MDM Enrollment | Microsoft Intune | ~$6/user/mo | 3.1.1, 3.1.2 |
| Endpoint Protection | Microsoft Defender for Business | ~$3/user/mo | 3.14.1-7 |
| MFA Setup | Microsoft Authenticator + YubiKeys | ~$50/key | 3.5.3 |
| Password Policy | Azure AD | Included | 3.5.7-10 |
| BitLocker Enforcement | Intune Policy | Included | 3.13.11 |

**Microsoft 365 Business Premium** ($22/user/month) includes:
- Intune MDM
- Defender for Business
- Azure AD Premium
- Exchange, Teams, SharePoint
- Conditional Access policies

**For 10 users:** ~$220/month = $2,640/year

---

## Compliance Checklist: What This Buys You

### CMMC Level 1 (17 practices) ✅
Self-assessment, required for all DoD contracts

| Practice | How You Meet It |
|----------|-----------------|
| Limit access | Azure AD + Intune policies |
| Authenticate users | MFA via Authenticator/YubiKey |
| Protect media | BitLocker encryption |
| Control physical access | Asset inventory, assigned devices |
| Protect systems | Defender for Business |

### CMMC Level 2 Foundation (110 practices) 🔄
Third-party assessment required for CUI

Most Level 2 controls are policy + technical:
- **Technical:** Intune + Defender + Azure AD covers ~60%
- **Policy:** You'll need SSP, incident response plan, training
- **Gap:** GCC High needed if handling CUI in cloud

### SOC 2 Foundation ✅
Your laptop setup supports SOC 2 Type I/II:
- Access control (Azure AD)
- Encryption (BitLocker)
- Endpoint protection (Defender)
- Asset management (documented inventory)
- Change management (Intune policies)

---

## What You're NOT Getting (And When You'll Need It)

### Now: Acceptable
- Dell Small Business channel (not Federal)
- Microsoft 365 Business Premium (not GCC High)
- Self-managed IT

### When CUI Arrives: Upgrade Required
- Microsoft 365 GCC High (~$35-55/user/month)
- ITAR-compliant MSP (Summit 7, E-N Computers)
- Formal CMMC Level 2 assessment

### Trigger Points
| Event | Action Required |
|-------|-----------------|
| Contract mentions "CUI" | Begin GCC High migration |
| SBIR Phase II with ITAR | Engage ITAR MSP |
| AFRL/DIU production contract | Full CMMC Level 2 assessment |
| SOC 2 Type II audit | 6-12 months of evidence collection |

---

## 90-Day Roadmap

### Week 1-2: Procurement
- [ ] Contact Dell Small Business
- [ ] Order 9 laptops (Precision + Latitude mix)
- [ ] Order YubiKeys (2 per user = backup)
- [ ] Set up Microsoft 365 Business Premium tenant

### Week 3-4: Deployment
- [ ] Document serial numbers and asset inventory
- [ ] Enable BitLocker on all devices
- [ ] Enroll in Intune MDM
- [ ] Deploy Defender for Business
- [ ] Configure MFA for all users

### Month 2: Policy Foundation
- [ ] Create basic System Security Plan (SSP)
- [ ] Establish password policy (Azure AD)
- [ ] Create acceptable use policy
- [ ] Document incident response basics
- [ ] CMMC Level 1 self-assessment in SPRS

### Month 3: Validation
- [ ] Run Defender vulnerability scan
- [ ] Review Intune compliance reports
- [ ] Test BitLocker recovery process
- [ ] Conduct basic security awareness training
- [ ] Document everything for future audits

---

## Budget Summary

### One-Time (From $20k Budget)
| Item | Cost |
|------|------|
| 4x Precision 3480 workstations | $8,000 |
| 5x Latitude 5450 laptops | $8,000 |
| 10x YubiKey 5 NFC | $500 |
| Docking stations (5x) | $1,000 |
| Misc (cables, bags) | $500 |
| **Total One-Time** | **$18,000** |
| **Remaining** | **$2,000** (reserve) |

### Monthly Recurring
| Service | Cost |
|---------|------|
| Microsoft 365 Business Premium (10 users) | $220 |
| **Monthly Total** | **$220** |
| **Annual** | **$2,640** |

---

## Key Contacts

### Dell Small Business
- **Phone:** 1-877-275-3355
- **Web:** [dell.com/small-business](https://www.dell.com/en-us/shop/scc/sc/laptops)
- **Hours:** M-F 7am-9pm CT

### Microsoft 365 Business
- **Sign up:** [microsoft.com/microsoft-365/business](https://www.microsoft.com/en-us/microsoft-365/business)
- **Admin:** [admin.microsoft.com](https://admin.microsoft.com)

### YubiKey (Hardware MFA)
- **Store:** [yubico.com/store](https://www.yubico.com/store/)
- **Model:** YubiKey 5 NFC ($50 each)

### Future Compliance Partners
- **Summit 7:** [summit7.us](https://www.summit7.us) - When you need GCC High
- **E-N Computers:** [encomputers.com](https://www.encomputers.com) - CMMC consulting

---

## TL;DR

1. **Order from Dell Small Business** (not Best Buy, not Federal yet)
2. **Get Precision for devs, Latitude for business** (~$16k for 9 units)
3. **Set up Microsoft 365 Business Premium** day one ($220/mo)
4. **Enable BitLocker + Intune + Defender + MFA** immediately
5. **Document everything** in asset inventory
6. **Complete CMMC Level 1 self-assessment** within 90 days
7. **Upgrade to GCC High** when contracts require CUI handling

This gives you a **compliant foundation** that can scale to full CMMC Level 2 / ITAR when your contracts demand it, without over-engineering for day one.

---

*Created for LVS - February 2026*
