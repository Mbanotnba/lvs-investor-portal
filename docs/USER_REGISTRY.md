# LVS Portal User Registry
**Last Updated:** February 10, 2026
**Primary Portal:** https://lvs-portal-prod.web.app
**API Endpoint:** https://lvs-api-657638018776.us-central1.run.app

---

## Password Convention
All passwords follow the format: `LVS2026{FirstName}`

---

## FOUNDERS (4)

| Name | Email | Company | Password |
|------|-------|---------|----------|
| Tayo Adesanya | tayo@lolavisionsystems.com | LVS | LVS2026Tayo |
| Randy Hollines | randy@lolavisionsystems.com | LVS | LVS2026Randy |
| Joshua Bush | joshua@lolavisionsystems.com | LVS | LVS2026Joshua |
| Jordan Page | jordan@lolavisionsystems.com | LVS | LVS2026Jordan |

---

## INVESTORS (24)

| Name | Email | Company | Password |
|------|-------|---------|----------|
| Vincent Berry II | vincent.berry2@gmail.com | - | LVS2026Vincent |
| Paul Judge | paul@theopportunityfund.com | The Opportunity Fund | LVS2026Paul |
| Nancy Torres | nancy@theopportunityfund.com | The Opportunity Fund | LVS2026Nancy |
| Chad Harris | chad@theopportunityfund.com | The Opportunity Fund | LVS2026Chad |
| Aaron Pickard | apickard@mfvpartners.com | MFV Partners | LVS2026Aaron |
| Karthee Madasamy | karthee@mfvpartners.com | MFV Partners | LVS2026Karthee |
| Natalie Warther | natalie.warther@raymondjames.com | Raymond James | LVS2026Natalie |
| Sarah Istel | sistel@cerberus.com | Cerberus Ventures | LVS2026Sarah |
| Andrew Cote | andrew.cote00@gmail.com | - | LVS2026Andrew |
| Maynard Holliday | strategictechnologiesai@gmail.com | - | LVS2026Maynard |
| Jamie Roberts | Roberts.Jamie2014@gmail.com | - | LVS2026Jamie |
| Fred Lowrey | Fmarshalllowery@gmail.com | - | LVS2026Fred |
| Janeya Griffin | jg@equityspacealliance.com | Equity Space Alliance | LVS2026Janeya |
| Seema Alexander | seema@dcstartupweek.org | DC Startup Week | LVS2026Seema |
| Walter McMillian | rock@rocktechconsultants.com | Rock Tech Consultants | LVS2026Walter |
| Melissa Bradley | melissa@1863ventures.net | 1863 Ventures | LVS2026Melissa |
| Paige Soya | paige@kstreet.vc | K Street Capital | LVS2026Paige |
| Nicholas Duafala | nick@kstreet.vc | K Street Capital | LVS2026Nicholas |
| Chris K Street | chris@kstreet.vc | K Street Capital | LVS2026Chris |
| Joseph K Street | joseph@kstreet.vc | K Street Capital | LVS2026Joseph |
| Jay Johnson | jay@vltrn.agency | VLTRN Agency | LVS2026Jay |
| Donovan Moss | dono@outlander.vc | Outlander VC | LVS2026Donovan |
| Marlon Nichols | marlon@macventurecapital.com | MaC Venture Capital | LVS2026Marlon |
| Craig Cummings | craig@moonshotscapital.com | Moonshots Capital | LVS2026Craig |
| Brad Harrison | brad@scout.vc | Scout VC | LVS2026Brad |
| Mike Keane | mike@scout.vc | Scout VC | LVS2026Mike |
| Olivia Zetter | olivia@rsquaredvc.com | R Squared VC | LVS2026Olivia |
| Ben Harvey | ben@ailaboratory.ai | AI Laboratory | LVS2026Ben |
| Melissa Henderson | melissa.henderson@ubs.com | UBS | LVS2026Melissa |

---

## CUSTOMERS (6)

| Name | Email | Company | Portal | Password |
|------|-------|---------|--------|----------|
| Chaffra Affouda | caffouda@anduril.com | Anduril | anduril | LVS2026Chaffra |
| Kevin Damoa | kevin@glidtech.us | Glid Technologies | glid | LVS2026Kevin |
| Maxwell Maduka | maxwell@terrahaptix.com | Terrahaptix | terrahaptix | LVS2026Maxwell |
| Jos Sebastian | sebastian@koniku.com | Koniku | koniku | LVS2026Jos |
| Osh Agabi | agabi@koniku.com | Koniku | koniku | LVS2026Osh |
| Robert Hochstedler | roberthochstedler@machindustries.com | Mach Industries | mach | LVS2026Robert |

---

## Adding New Users

1. Edit `/backend/database.py` - add to the `production_users` list
2. Deploy: `gcloud run deploy lvs-api --source . --region us-central1 --allow-unauthenticated`
3. Verify: Test login via API or portal

---

## Architecture Notes

- **Frontend:** Firebase Hosting (lvs-portal-prod.web.app)
- **Backend API:** Google Cloud Run (lvs-api)
- **Database:** Turso (libsql://lvs-portal-mbanotnba.aws-us-east-1.turso.io)
- **User seeding:** Happens on Cloud Run startup via `seed_production_users()`

**Important:** The Cloud Run instance seeds users from `database.py` on each deployment. Turso is used as a sync target but Cloud Run maintains its own embedded replica.
