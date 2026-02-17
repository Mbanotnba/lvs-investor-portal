# LVS ITAR-Compliant IT Infrastructure Plan

**Created:** February 13, 2026
**Purpose:** Secure laptop/workstation procurement and IT services strategy for ITAR compliance transition

---

## Executive Summary

As LVS transitions to handling ITAR-controlled data, the company needs a comprehensive IT infrastructure strategy that addresses:
1. Secure hardware procurement (not retail)
2. AMD workstations for AI/NPU workloads (Randy's developers)
3. Mac ecosystem for executive use (Tayo)
4. CMMC/NIST 800-171 compliance foundation
5. Managed IT services with US-person requirements

**Key Finding:** Retail procurement (Best Buy, local shops) is NOT recommended for ITAR work. Enterprise channels with chain of custody documentation are required.

---

## Part 1: Why NOT Best Buy / Retail Procurement

### The Problem with Retail Hardware

For companies handling ITAR data, retail procurement introduces several compliance risks:

| Risk | Description |
|------|-------------|
| **No Chain of Custody** | Cannot verify hardware hasn't been tampered with |
| **No Traceability** | Cannot prove hardware origin for audits |
| **No Enterprise Support** | Consumer warranties, not business SLAs |
| **No Configuration Management** | Devices arrive with consumer bloatware |
| **Supply Chain Gaps** | Cannot verify components meet DFARS requirements |

### CMMC Requirements

The CMMC Final Rule (effective November 10, 2025) requires:
- Hardware asset inventory with serial numbers and procurement sources
- Integrity verification records
- Traceability throughout the supply chain
- Verification that all suppliers meet appropriate CMMC levels

> "A supply chain is only as strong as its weakest link. Foreign adversaries can target government and industry via contractors and suppliers at all tiers."
> — CISA ICT Supply Chain Security

---

## Part 2: Recommended Procurement Channels

### Tier 1: Federal/Defense-Grade (Recommended)

#### Dell Federal
- **Why:** 20+ years serving federal government, defense-in-depth supply chain security
- **Benefits:**
  - North America-designed hardware
  - Secure supply chain with verified chain of custody
  - Compliant with GSA BPA requirements
  - Dedicated federal services team
- **Products:** Latitude Rugged, Precision Workstations, OptiPlex
- **Website:** [Dell Federal](https://www.dell.com/en-us/lp/dt/industry-federal-government-it)

#### HP Federal
- **Why:** GSA-approved vendor, ITAR-compliant manufacturing options
- **Products:** ZBook workstations, EliteBook series
- **Access via:** GSA Advantage or direct federal sales

#### Lenovo (with caution)
- **Consideration:** Verify manufacturing origin and supply chain
- **Products:** ThinkPad, ThinkStation
- **Note:** Available via GSA BPAs with compliance documentation

### Tier 2: GSA Government-wide Strategic Solutions (GSS)

The GSS BPAs provide:
- FAR-compliant, pre-competed procurement
- Available to federal, state, local, and tribal agencies
- Brand-name configurations from Dell, HP, Lenovo, Microsoft
- Standard security configurations

**How to Access:**
1. Register at SAM.gov
2. Access GSA Advantage at [gsaadvantage.gov](https://www.gsaadvantage.gov)
3. Use GSS Desktop/Laptop BPAs

### Tier 3: Authorized Resellers

If not using federal channels directly:
- **Carahsoft** - Dell Technologies government solutions
- **Insight** - Dell government partner
- **CDW-G** - Government/education specialized

---

## Part 3: AMD Workstations for Developers (Randy's Team)

### 2026 AMD NPU-Enabled Options

Based on CES 2026 announcements, the following are optimal for local AI model development:

#### Top Picks: AMD Ryzen AI Max+ Series

| Processor | NPU TOPS | Max Memory | Use Case |
|-----------|----------|------------|----------|
| Ryzen AI Max+ 392 | 60+ TOPS | 128GB unified | Up to 128B parameter models |
| Ryzen AI Max+ 388 | 55 TOPS | 96GB unified | Up to 70B parameter models |
| Ryzen AI PRO 400 | 60 TOPS | 64GB | Enterprise laptops, moderate AI |

#### Recommended Configurations

**Developer Workstation (Desktop)**
- AMD Ryzen AI Max+ 392
- 128GB unified memory (critical for large models)
- 2TB NVMe + 4TB secondary
- Available Q2 2026 from: Dell, HP, Lenovo, ASUS

**Developer Laptop (Mobile)**
- AMD Ryzen AI PRO 400 Series
- 64GB RAM
- 1TB NVMe
- Enterprise features: TPM, secure boot, vPro-like manageability
- Available Q1 2026 from major OEMs

#### Enterprise Requirements Checklist
- [ ] TPM 2.0 attestation
- [ ] Secure boot enabled
- [ ] FIPS 140-2/3 capable storage encryption
- [ ] Enterprise driver baseline policies
- [ ] Manageable update channels

### Procurement Sources for AMD Workstations

| Vendor | Product Line | Federal Option |
|--------|--------------|----------------|
| Dell | Precision 7875/5875 | Dell Federal |
| HP | Z8 Fury, ZBook Fury | HP Federal |
| Lenovo | ThinkStation P8 | GSA Schedule |

### Cost Estimates (2026)

| Configuration | Price Range | Notes |
|---------------|-------------|-------|
| AMD AI Workstation (desktop) | $3,500 - $5,500 | 50-80 TOPS, enterprise features |
| AMD AI Laptop (mobile) | $2,500 - $4,000 | Ryzen AI PRO 400 |
| High-end (128GB unified) | $5,000 - $7,000 | For 128B+ models |

---

## Part 4: Mac Ecosystem Strategy (Tayo)

### Current Setup
- MacBook Air (personal/mobile)
- Purchased from local shop in San Jose

### Recommended Future Setup

#### Mac Mini M4 Pro/Max (Desktop/Server)
- **Use case:** Local file storage, always-on desktop
- **Configuration:**
  - M4 Pro or M4 Max
  - 64GB unified memory
  - 2TB+ internal SSD
  - Connect external RAID for file storage

#### Security Features (Built-in)
- Secure Enclave
- Hardware-verified secure boot
- Encrypted storage (FileVault)
- System Integrity Protection (SIP)

### ITAR Compliance Considerations for Mac

**Challenges:**
- Apple does not manufacture in the US
- No specific ITAR certification program from Apple
- Limited federal procurement channels

**Mitigations:**
1. **Apple Business Manager (ABM)** for zero-touch deployment
2. **Jamf MDM** for enterprise management and compliance
3. **macOS Security Compliance Project (mSCP)** alignment with NIST 800-171
4. **Government customers** including NASA, DISA, Los Alamos use Macs successfully

### Recommended MDM Solution: Jamf

- NIST 800-171 / CIS Benchmark enforcement
- Zero-touch deployment via ABM
- Remote wipe and device lock
- Compliance reporting and audit trails
- Used by defense organizations

**Jamf Pro Pricing:** ~$8-12/device/month for enterprise

### Mac Procurement for Business

**Options:**
1. **Apple Business** - Direct enterprise purchasing, volume discounts
2. **Authorized Resellers** - CDW, Insight, etc. with business invoicing
3. **Apple Business Manager** - Automated enrollment, ownership verification

**NOT Recommended:** Consumer purchases from Apple Store or third-party retailers for ITAR work

---

## Part 5: CMMC/NIST 800-171 Device Requirements

All laptops/workstations handling CUI must meet these baseline requirements:

### Hardware Requirements

| Control | Requirement |
|---------|-------------|
| TPM | 2.0 required for attestation |
| Secure Boot | UEFI secure boot enabled |
| Storage Encryption | FIPS 140-2 validated (BitLocker, FileVault) |
| BIOS Password | Admin password required |

### Software Requirements

| Control | Implementation |
|---------|----------------|
| OS Hardening | DISA STIGs or CIS Benchmarks |
| Endpoint Protection | EDR solution (CrowdStrike, Microsoft Defender) |
| Full Disk Encryption | BitLocker (Windows), FileVault (Mac) |
| Patch Management | Automated, within 30 days of release |
| MFA | Required for all accounts |

### Configuration Management

- Limit unsuccessful logon attempts (3-5 attempts, then lockout)
- Automatic session termination (15-30 minutes idle)
- Controlled remote access via managed access points
- User-installed software restrictions
- CUI encryption at rest

### Audit Requirements

- Maintain hardware asset inventory
- Document procurement source and chain of custody
- Serial number tracking
- Retain records for 5 years

---

## Part 6: Managed IT Services / MSP Selection

### Why You Need an ITAR-Aware MSP

ITAR imposes strict requirements on anyone accessing your network:
- **All personnel must be US persons** (citizens or green card holders)
- Many large MSPs use offshore labor for help desk/monitoring
- Non-compliant MSP = export control violations

### Recommended ITAR/CMMC MSPs

| Provider | Specialty | Notes |
|----------|-----------|-------|
| **Summit 7** | CMMC, Microsoft GCC High | 100% US-based, 1,200+ DIB clients, Azure Expert MSP |
| **E-N Computers** | Federal contractors, ITAR | Registered Practitioner Organization, CMMC consulting |
| **CyberSheath** | Federal Enclave | First CMMC enclave, turnkey compliance |
| **C3 Integrated Solutions** | DIB MSP/MSSP | Two CMMC Level 2 certifications, 10+ years in DIB |
| **Agile IT** | Federal frameworks | NIST 800-171, DFARS, CMMC, ITAR experience |

### What to Ask Potential MSPs

1. Are ALL staff US persons (citizens or permanent residents)?
2. Do you use any offshore or outsourced support?
3. Are you CMMC certified or working toward certification?
4. Can you provide Microsoft GCC High implementation?
5. What is your experience with ITAR-specific requirements?
6. Can you provide compliance documentation and audit support?

### Microsoft GCC High

For ITAR compliance, standard Microsoft 365 is NOT sufficient:

| Product | ITAR Suitable? | Notes |
|---------|---------------|-------|
| Microsoft 365 Commercial | ❌ No | Data centers may be outside US |
| Microsoft 365 GCC | ⚠️ Limited | Government cloud, but not ITAR-specific |
| Microsoft 365 GCC High | ✅ Yes | ITAR-compliant, US-only data centers, US persons only |

**GCC High Pricing:** ~$35-55/user/month (varies by license tier)

---

## Part 7: Implementation Roadmap

### Phase 1: Assessment (Week 1-2)

- [ ] Inventory current hardware and procurement sources
- [ ] Identify all personnel who will access ITAR data
- [ ] Assess current IT infrastructure gaps
- [ ] Interview potential MSPs

### Phase 2: MSP Selection (Week 3-4)

- [ ] RFP to qualified ITAR MSPs
- [ ] Verify US person staffing
- [ ] Review compliance certifications
- [ ] Select MSP partner

### Phase 3: Hardware Procurement (Week 4-6)

**For Randy's Team (AMD Workstations):**
- [ ] Spec out configurations with AMD Ryzen AI Max+
- [ ] Procure via Dell Federal or HP Federal
- [ ] Ensure enterprise features enabled

**For Tayo (Mac):**
- [ ] Procure Mac Mini via Apple Business
- [ ] Enroll in Apple Business Manager
- [ ] Deploy with Jamf MDM

### Phase 4: Environment Setup (Week 6-8)

- [ ] Implement Microsoft GCC High tenant
- [ ] Configure MDM policies (Intune + Jamf)
- [ ] Deploy endpoint protection
- [ ] Enable full disk encryption
- [ ] Configure network segmentation

### Phase 5: Compliance Validation (Week 8-10)

- [ ] Run NIST 800-171 gap assessment
- [ ] Document all controls
- [ ] Create System Security Plan (SSP)
- [ ] Prepare for CMMC assessment

---

## Part 8: Cost Summary

### One-Time Costs

| Item | Quantity | Unit Cost | Total |
|------|----------|-----------|-------|
| AMD AI Workstations (desktop) | 4 | $5,000 | $20,000 |
| AMD AI Laptops | 2 | $3,500 | $7,000 |
| Mac Mini M4 Pro | 1 | $2,500 | $2,500 |
| MacBook replacement (if needed) | 1 | $2,500 | $2,500 |
| **Hardware Subtotal** | | | **$32,000** |

### Monthly Recurring Costs

| Service | Unit Cost | Users/Devices | Monthly |
|---------|-----------|---------------|---------|
| Microsoft GCC High | $45/user | 10 | $450 |
| Jamf Pro | $10/device | 3 Macs | $30 |
| MSP Services | $150/user | 10 | $1,500 |
| Endpoint Protection | $8/device | 10 | $80 |
| **Monthly Subtotal** | | | **~$2,060** |

### Annual Total

- Year 1: $32,000 (hardware) + $24,720 (services) = **~$56,720**
- Year 2+: **~$24,720/year** (services only)

---

## Part 9: Key Takeaways

### Do's ✅

1. **Procure from enterprise/federal channels** (Dell Federal, HP Federal, GSA)
2. **Use ITAR-compliant MSP** with 100% US person staff
3. **Implement Microsoft GCC High** for cloud services
4. **Deploy MDM** for all devices (Intune for Windows, Jamf for Mac)
5. **Document everything** - chain of custody, serial numbers, configurations
6. **Train all personnel** on ITAR handling requirements

### Don'ts ❌

1. **DON'T buy from Best Buy** or retail channels for ITAR work
2. **DON'T use consumer Microsoft 365** for ITAR data
3. **DON'T hire MSPs** that outsource to non-US persons
4. **DON'T skip compliance documentation** - it will cost you in audits
5. **DON'T commingle** ITAR and non-ITAR systems without proper controls

---

## Resources & Links

### Government Resources
- [DDTC - Getting and Staying ITAR Compliant](https://www.pmddtc.state.gov/ddtc_public?id=ddtc_kb_article_page&sys_id=4f06583fdb78d300d0a370131f961913)
- [CISA ICT Supply Chain Security](https://www.cisa.gov/topics/information-communications-technology-supply-chain-security)
- [DoD CMMC Information](https://dodcio.defense.gov/Portals/0/Documents/CMMC/ModelOverview_V2.0_FINAL2_20211202_508.pdf)

### Procurement
- [Dell Federal](https://www.dell.com/en-us/lp/dt/industry-federal-government-it)
- [GSA Laptops and Desktops BPA](https://www.gsa.gov/technology/it-contract-vehicles-and-purchasing-programs/multiple-award-schedule-it/laptops-and-desktops-bpa)

### Compliance Guidance
- [NIST 800-171 Overview](https://www.cmu.edu/iso/compliance/800-171/index.html)
- [CMMC and NIST Alignment](https://dodcio.defense.gov/Portals/0/Documents/CMMC/CMMC-AlignmentNIST-Standards.pdf)
- [Concentric AI - ITAR Guide 2026](https://concentric.ai/itar-compliance-what-every-cio-and-cso-needs-to-know/)

### MSP Providers
- [Summit 7](https://www.summit7.us/)
- [E-N Computers](https://www.encomputers.com/it-defense-contractors/)
- [CyberSheath Federal Enclave](https://cybersheath.com/services-solutions/managed-services/federal-enclave/)
- [C3 Integrated Solutions](https://c3isit.com/it-services/)

### AMD Hardware
- [AMD CES 2026 Announcements](https://www.amd.com/en/newsroom/press-releases/2026-1-5-amd-expands-ai-leadership-across-client-graphics-.html)
- [AMD Ryzen AI for Enterprise](https://ir.amd.com/news-events/press-releases/detail/1270/amd-expands-ai-leadership-across-client-graphics-and-software-with-new-ryzen-ryzen-ai-and-amd-rocm-announcements-at-ces-2026)

### Mac Enterprise
- [Jamf Solutions](https://www.jamf.com/solutions/)
- [macOS Security Compliance Project](https://www.jamf.com/blog/mac-security-threats-enterprise-defense-strategies/)

---

## Next Steps

1. **Immediate:** Schedule calls with Summit 7 and E-N Computers
2. **This Week:** Begin hardware specification for AMD workstations
3. **Next Week:** Initiate Apple Business account for Mac procurement
4. **30 Days:** MSP selected and onboarding initiated

---

*Document created by Claude Code for LVS internal planning. Not legal advice - consult with ITAR compliance counsel before implementation.*
