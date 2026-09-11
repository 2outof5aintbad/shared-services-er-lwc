# koRefreshAnalyticsDashboard — Setup & Deploy

## 1. Upload Chart.js as a Static Resource

Download Chart.js minified:
```
https://cdn.jsdelivr.net/npm/chart.js/dist/chart.umd.min.js
```

Upload to Salesforce:
- Setup → Static Resources → New
- Name: `chartjs` (exact, case-sensitive)
- File: `chart.umd.min.js`
- Cache Control: Public
- Save

## 2. Deploy

```bash
sf project deploy start --manifest manifest/package.xml --target-org coke-care
```

> Note: if the CLI shows "Finalizing..." and hangs, check status with:
> `sf project deploy report --job-id <ID>`
> Deploys succeed with 0 errors even when the display glitches.

## 3. Add to Lightning App Builder

1. Setup → Lightning App Builder → New (or edit existing)
2. Choose **App Page**
3. Drag **KO Refresh Analytics Dashboard** from the component panel onto the page
4. Save → Activate

## 4. Tabs

| Tab | Content |
|-----|---------|
| Executive Insights | KPI tiles, EOL clearance, logistics, ESG, NPS |
| Regional EOL Drilldown | US SVG map by region, top 10 bottlers, product trends |
| Exec Summary Brief | Q3 FY2024 scorecards, narrative bullets, mini-map |
| Illinois — Reyes Detail | IL SVG map by county intensity, Reyes top 10 locations |

All charts use Chart.js loaded from the `chartjs` static resource.
All maps are inline SVG — no external map libraries required.
