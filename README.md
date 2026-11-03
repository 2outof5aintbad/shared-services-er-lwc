# CCBSS ER Case Search — Salesforce LWC Demo

A Lightning Web Component demo for Coke Southwest (CCBSS) showing how HR and Employee Relations teams can search, analyze, and act on ER cases inside Salesforce — with optional Einstein AI-powered summaries.

---

## What's included

### 1. CCBSS ER Case Search (`erCaseSearch`, `erCaseSimilarity`, `erCaseSummary`)

A three-panel ER case intelligence interface:

- **Search panel** — keyword search, AI similarity matching, or direct case # lookup; filterable by date range, owner, status, location, category, and corrective action level
- **Similarity panel** — surfaces related cases based on the selected result
- **Summary panel** — rule-based insight summary that upgrades to an Einstein-generated analysis if the org is licensed for Einstein for Service

**Custom Case fields included:**
- `Level_of_Corrective_Action__c` — Verbal Warning → Written Warning → Final Warning → Termination
- `Date_Action_Issued__c`, `ER_Notes_Comments__c`
- `Affected_Associate_Job_Title__c`, `_Location__c`, `_Market_Unit__c`, `_Status__c`
- `Bottler_Category__c` + Sub-Category 1–4 (CCBSS taxonomy)
- `Status_Reason__c`

**Also deployed:**
- `CCBSS_ER` Lightning App
- `CCBSS_ER_Search` FlexiPage
- `CCBSS_ER_Access` Permission Set
- `ERCaseController` + `ERCaseDataSeeder` Apex classes

---

## Setup

See **[DEPLOY.md](DEPLOY.md)** for a step-by-step guide using Salesforce Workbench (no CLI required, ~15 minutes).

**Quick version (SF CLI):**
```bash
sf project deploy start --manifest manifest/package-ccbss-er.xml --target-org <your-alias>
```

---

## Repo structure

```
force-app/main/default/
├── lwc/
│   ├── erCaseSearch/          # Main search + filter UI
│   ├── erCaseSimilarity/      # Related cases panel
│   └── erCaseSummary/         # AI summary panel
├── classes/
│   ├── ERCaseController.cls   # Search, similarity, Einstein integration
│   └── ERCaseDataSeeder.cls   # Seed script for demo data
├── objects/Case/fields/       # Custom ER fields
├── applications/CCBSS_ER.app-meta.xml
├── flexiPages/CCBSS_ER_Search.flexipage-meta.xml
└── permissionsets/CCBSS_ER_Access.permissionset-meta.xml

manifest/
└── package-ccbss-er.xml       # Full deployment manifest
```

---

## Requirements

- Salesforce org (sandbox or scratch) with Lightning Experience enabled
- API version 59.0+
- Einstein for Service license — **optional**; the demo works without it using rule-based summaries

---

## Notes

- Demo data can be seeded using `ERCaseDataSeeder` via Anonymous Apex in the Developer Console
- The Einstein summary upgrade (`getEinsteinInsight`) fails silently if the org isn't licensed — the rule-based summary stays
- CCBSS branding (logos, color scheme) is included in static resources; swap them for your org's assets as needed
