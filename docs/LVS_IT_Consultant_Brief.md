# LVS IT Infrastructure Brief
## For Consultant Review

**Company:** Lola Vision Systems (LVS)
**Date:** February 2026
**Stage:** Pre-seed / Seed
**Contact:** Tayo Adesanya, CEO

---

## About LVS

Lola Vision Systems is developing edge AI chipsets for defense and autonomous systems. Our LVS-250 delivers 230 TOPS in a 25W, 35mm package using UCIe 2.0 chiplet architecture.

**Target Customers:** AFRL, DIU, defense primes, autonomous vehicle companies
**Current Team:** ~8-10 people (developers, business)
**Compliance Requirements:** CMMC 2.0, SOC2, ITAR (future)

---

## What We Need

We're building our IT infrastructure from scratch and want to do it right the first time. We have an opportunity to establish compliance foundations before technical debt accumulates.

### Immediate Goals
1. Procure 8-9 laptops for the team (~$20k budget)
2. Set up secure, compliant device management
3. Establish identity and access management
4. Create foundation for CMMC Level 1 self-assessment (required for DoD contracts)
5. Build toward SOC2 Type I readiness

### Future Goals (6-12 months)
- CMMC Level 2 certification (if contracts require CUI handling)
- SOC2 Type II audit
- ITAR compliance (when defense contracts require)
- Potential migration to Microsoft GCC High

---

## Our Proposed Strategy

### Hardware Procurement

**Channel:** Dell Small Business (not retail, not Federal)

| Role | Model | Specs | Qty | Est. Cost |
|------|-------|-------|-----|-----------|
| Developers | Dell Precision 3480/3490 | Core Ultra 7, 32GB RAM, 512GB | 4 | $8,000 |
| Business | Dell Latitude 5450/5550 | Core Ultra 5, 16GB RAM, 512GB | 5 | $8,000 |
| **Total** | | | **9** | **$16,000** |

**Remaining budget:** ~$4,000 for software, accessories, MFA keys

**Rationale:**
- Business-class hardware with proper invoicing and serial number documentation
- 3-year ProSupport warranty (US-based support)
- TPM 2.0 standard for encryption/attestation
- Clean Windows 11 Pro images
- Faster than Federal channels, more compliant than retail

### Software Stack (Proposed)

**Microsoft 365 Business Premium** (~$22/user/month)
- Azure AD for identity management
- Microsoft Intune for MDM/device management
- Microsoft Defender for Business for endpoint protection
- Exchange, Teams, SharePoint for productivity
- Conditional Access policies

**Additional:**
- BitLocker for full disk encryption (included in Windows Pro)
- YubiKey 5 NFC for hardware MFA (~$50 each, 2 per user)

**Monthly cost:** ~$220 for 10 users

### Day-One Configuration Plan

1. Document all hardware (serial numbers, assigned users, purchase records)
2. Enable BitLocker encryption before user setup
3. Enroll all devices in Intune MDM
4. Deploy Defender for Business
5. Enforce MFA for all accounts (Authenticator + YubiKey backup)
6. Configure password policies and conditional access
7. Establish baseline security policies

---

## Compliance Mapping

### CMMC Level 1 (17 Practices)
Required for all DoD contracts as of November 2025. Self-assessment in SPRS.

| Domain | Our Approach |
|--------|--------------|
| Access Control | Azure AD + Intune policies |
| Identification & Authentication | MFA (Authenticator + YubiKey) |
| Media Protection | BitLocker encryption |
| Physical Protection | Asset inventory, assigned devices |
| System & Info Protection | Defender for Business |

### SOC2 Trust Principles
Our setup addresses:

| Principle | Coverage |
|-----------|----------|
| Security | Defender, encryption, MFA, access controls |
| Availability | ProSupport, cloud-based services |
| Confidentiality | Encryption, access policies |
| Processing Integrity | Audit logs via M365 |
| Privacy | Policy-based (needs documentation) |

### Known Gaps
- No formal System Security Plan (SSP) yet
- Incident response plan needs creation
- Security awareness training program needed
- Audit logging retention policies undefined
- No current SIEM/log aggregation

---

## Questions for You

We'd appreciate your input on the following:

### Strategy
1. Does our proposed hardware/software stack align with SOC2 and CMMC requirements?
2. Are there better alternatives to M365 Business Premium for our stage/needs?
3. Should we start with Microsoft GCC (not High) given our defense focus?

### Implementation
4. What's the optimal order of operations for deploying this stack?
5. What Intune policies should be configured from day one?
6. How should we structure Azure AD (groups, roles, conditional access)?

### Compliance
7. What documentation should we create immediately for SOC2 evidence?
8. How do we structure our asset inventory for both SOC2 and CMMC?
9. What's the minimum viable SSP for CMMC Level 1?

### Cost/Effort
10. What's a realistic scope for contract-based implementation support?
11. Are there managed services we should consider vs. self-managing?
12. What should we defer until post-seed funding?

---

## Engagement Scope (Proposed)

We're interested in contract-based support for:

### Phase 1: Architecture Review (5-10 hours)
- Review our proposed strategy
- Identify gaps or improvements
- Recommend specific configurations
- Provide implementation checklist

### Phase 2: Implementation Support (20-40 hours)
- Remote configuration of M365/Intune/Defender
- Azure AD structure and policies
- Baseline security policy templates
- Documentation templates (SSP, policies)

### Phase 3: Ongoing Advisory (As needed)
- Quarterly compliance check-ins
- Incident response guidance
- Audit preparation support

---

## Timeline

| Week | Milestone |
|------|-----------|
| 1 | Hardware ordered, M365 tenant created |
| 2-3 | Devices deployed with baseline config |
| 4 | Policies refined, documentation started |
| 8 | CMMC Level 1 self-assessment complete |
| 12 | SOC2 Type I prep documentation ready |

---

## Attachments

We can provide these documents upon request:
- Detailed hardware specifications
- Full CMMC Level 2 control mapping
- Current team roster and roles
- Specific product/vendor research

---

## Contact

**Tayo Adesanya**
CEO, Lola Vision Systems
tayo@lolavisionsystems.com

---

*We're looking for a practical, startup-appropriate approach—not enterprise overkill. We want to build the right foundation now while staying lean until we close our seed round.*
