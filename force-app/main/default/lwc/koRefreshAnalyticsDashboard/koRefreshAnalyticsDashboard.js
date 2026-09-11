import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import chartjs       from '@salesforce/resourceUrl/chartjs';
import d3url         from '@salesforce/resourceUrl/d3min';
import topojsonurl   from '@salesforce/resourceUrl/topojsonmin';
import usstatesurl   from '@salesforce/resourceUrl/usstates10m';
import cokeLogoWhite from '@salesforce/resourceUrl/coke_logo_white';
import cokeTruck    from '@salesforce/resourceUrl/coke_truck';
import cokeCrate    from '@salesforce/resourceUrl/coke_crate';
import ccunitedLogo from '@salesforce/resourceUrl/ccunited_logo';
import arcaLogo     from '@salesforce/resourceUrl/arca_logo';
import KO_DASHBOARD_DATA from './koRefreshData';

const TABS = [
    { id: 'eol',       label: 'EOL Clearance' },
    { id: 'truck',     label: 'Truck Optimization' },
    { id: 'loyalty',   label: 'Customer Loyalty' },
    { id: 'inventory', label: 'Inventory Balance' }
];
const REGIONS = ['All', 'South', 'Midwest', 'Northeast', 'West'];

const REGION_FACTORS = {
    All:       { recovery: 84, margin: 1594000, days: 20, shrink: 35400, load: 91, cpd: 1.08, drops: 15.4, co2: -18, adoption: 61, nps: 74, retention: 95,
                 invValue: 28400000, invDays: 21, overstock: 1820000, pending: 4100000,
                 invMix: { csd: 52, water: 18, energy: 16, juice: 14 },
                 invDaysHistory: [24, 23, 22, 22, 21, 21] },
    South:     { recovery: 88, margin:  568000, days: 16, shrink: 14700, load: 95, cpd: 0.98, drops: 17.2, co2: -22, adoption: 72, nps: 79, retention: 97,
                 invValue:  8200000, invDays: 17, overstock:  310000, pending: 1420000,
                 invMix: { csd: 55, water: 16, energy: 17, juice: 12 },
                 invDaysHistory: [20, 19, 19, 18, 17, 17] },
    Midwest:   { recovery: 86, margin:  318000, days: 18, shrink:  6800, load: 93, cpd: 1.04, drops: 15.9, co2: -20, adoption: 65, nps: 76, retention: 96,
                 invValue:  6100000, invDays: 20, overstock:  290000, pending:  880000,
                 invMix: { csd: 54, water: 17, energy: 15, juice: 14 },
                 invDaysHistory: [23, 22, 22, 21, 20, 20] },
    Northeast: { recovery: 82, margin:  341000, days: 21, shrink:  6400, load: 90, cpd: 1.11, drops: 14.9, co2: -16, adoption: 57, nps: 72, retention: 94,
                 invValue:  7300000, invDays: 23, overstock:  680000, pending:  940000,
                 invMix: { csd: 49, water: 20, energy: 16, juice: 15 },
                 invDaysHistory: [27, 26, 25, 24, 23, 23] },
    West:      { recovery: 78, margin:  367000, days: 24, shrink:  7500, load: 87, cpd: 1.20, drops: 13.4, co2: -13, adoption: 50, nps: 68, retention: 92,
                 invValue:  6800000, invDays: 26, overstock:  540000, pending:  860000,
                 invMix: { csd: 48, water: 22, energy: 17, juice: 13 },
                 invDaysHistory: [30, 29, 28, 27, 26, 26] }
};

const BOTTLERS = [
    { id: 'reyes',      name: 'Reyes Coca-Cola Bottling',         territory: 'IL, WI, MN, IA, MI, IN, MO', region: 'Midwest',
      recovery: 87, margin: 198000, days: 17, shrink: 5100, load: 94, cpd: 1.01, drops: 16.3, co2: -21, adoption: 68, nps: 77, retention: 96,
      invValue: 3800000, invDays: 19, overstock: 180000, pending: 520000, invMix: { csd: 55, water: 16, energy: 15, juice: 14 }, invDaysHistory: [22,21,21,20,19,19] },
    { id: 'ccunited',   name: 'Coca-Cola United',                 territory: 'AL, TN, MS, LA, AR, KY',     region: 'South',
      recovery: 91, margin: 223000, days: 15, shrink: 4600, load: 96, cpd: 0.94, drops: 17.8, co2: -24, adoption: 74, nps: 81, retention: 98,
      invValue: 2900000, invDays: 14, overstock:  82000, pending: 610000, invMix: { csd: 57, water: 15, energy: 16, juice: 12 }, invDaysHistory: [17,16,16,15,14,14] },
    { id: 'arca',       name: 'Arca Continental',                 territory: 'TX, OK, NM',                 region: 'South',
      recovery: 88, margin: 189000, days: 16, shrink: 4800, load: 95, cpd: 0.98, drops: 17.2, co2: -22, adoption: 72, nps: 79, retention: 97,
      invValue: 2700000, invDays: 16, overstock: 120000, pending: 490000, invMix: { csd: 54, water: 17, energy: 17, juice: 12 }, invDaysHistory: [19,18,18,17,16,16] },
    { id: 'ccswb',      name: 'Coca-Cola Southwest Beverages',    territory: 'GA, FL, SC, NC',             region: 'South',
      recovery: 86, margin: 156000, days: 17, shrink: 5300, load: 93, cpd: 1.02, drops: 16.7, co2: -20, adoption: 69, nps: 77, retention: 96,
      invValue: 2600000, invDays: 19, overstock: 108000, pending: 320000, invMix: { csd: 53, water: 17, energy: 17, juice: 13 }, invDaysHistory: [22,21,21,20,19,19] },
    { id: 'liberty',    name: 'Liberty Coca-Cola Beverages',      territory: 'NY, NJ, DE, MD, PA, OH, VA, WV', region: 'Northeast',
      recovery: 83, margin: 172000, days: 20, shrink: 3200, load: 91, cpd: 1.09, drops: 15.1, co2: -17, adoption: 59, nps: 73, retention: 94,
      invValue: 3900000, invDays: 22, overstock: 390000, pending: 510000, invMix: { csd: 50, water: 20, energy: 16, juice: 14 }, invDaysHistory: [26,25,25,24,22,22] },
    { id: 'ccne',       name: 'Coca-Cola Bottling Co. Northeast', territory: 'ME, NH, VT, MA, RI, CT',     region: 'Northeast',
      recovery: 81, margin: 169000, days: 21, shrink: 3200, load: 89, cpd: 1.13, drops: 14.7, co2: -15, adoption: 55, nps: 71, retention: 93,
      invValue: 3400000, invDays: 25, overstock: 290000, pending: 430000, invMix: { csd: 48, water: 21, energy: 16, juice: 15 }, invDaysHistory: [29,28,27,26,25,25] },
    { id: 'greatplains',name: 'Great Plains Coca-Cola',           territory: 'KS, NE, SD, ND, WY, MT',     region: 'Midwest',
      recovery: 84, margin: 120000, days: 19, shrink: 1700, load: 92, cpd: 1.06, drops: 15.4, co2: -18, adoption: 61, nps: 74, retention: 95,
      invValue: 2300000, invDays: 22, overstock: 110000, pending: 360000, invMix: { csd: 53, water: 18, energy: 15, juice: 14 }, invDaysHistory: [25,24,24,23,22,22] },
    { id: 'peninsula',  name: 'Peninsula Coca-Cola',              territory: 'CA, NV, AZ',                 region: 'West',
      recovery: 80, margin: 134000, days: 23, shrink: 2800, load: 87, cpd: 1.21, drops: 13.2, co2: -13, adoption: 49, nps: 68, retention: 92,
      invValue: 2500000, invDays: 27, overstock: 220000, pending: 290000, invMix: { csd: 49, water: 22, energy: 16, juice: 13 }, invDaysHistory: [31,30,29,28,27,27] },
    { id: 'pacific',    name: 'Pacific Coca-Cola',                territory: 'OR, WA, ID',                 region: 'West',
      recovery: 78, margin: 135000, days: 24, shrink: 2800, load: 88, cpd: 1.17, drops: 14.2, co2: -15, adoption: 53, nps: 70, retention: 93,
      invValue: 2200000, invDays: 25, overstock: 190000, pending: 310000, invMix: { csd: 47, water: 23, energy: 18, juice: 12 }, invDaysHistory: [29,28,27,26,25,25] },
    { id: 'highcountry',name: 'High Country Coca-Cola',           territory: 'CO, UT, AK, HI',             region: 'West',
      recovery: 77, margin:  98000, days: 25, shrink: 1900, load: 86, cpd: 1.23, drops: 12.9, co2: -12, adoption: 47, nps: 67, retention: 91,
      invValue: 2100000, invDays: 28, overstock: 130000, pending: 260000, invMix: { csd: 48, water: 21, energy: 18, juice: 13 }, invDaysHistory: [32,31,30,29,28,28] }
];

// State names for display
const FIPS_NAME = {
    '01':'Alabama','02':'Alaska','04':'Arizona','05':'Arkansas','06':'California',
    '08':'Colorado','09':'Connecticut','10':'Delaware','12':'Florida','13':'Georgia',
    '15':'Hawaii','16':'Idaho','17':'Illinois','18':'Indiana','19':'Iowa',
    '20':'Kansas','21':'Kentucky','22':'Louisiana','23':'Maine','24':'Maryland',
    '25':'Massachusetts','26':'Michigan','27':'Minnesota','28':'Mississippi',
    '29':'Missouri','30':'Montana','31':'Nebraska','32':'Nevada','33':'New Hampshire',
    '34':'New Jersey','35':'New Mexico','36':'New York','37':'North Carolina',
    '38':'North Dakota','39':'Ohio','40':'Oklahoma','41':'Oregon','42':'Pennsylvania',
    '44':'Rhode Island','45':'South Carolina','46':'South Dakota','47':'Tennessee',
    '48':'Texas','49':'Utah','50':'Vermont','51':'Virginia','53':'Washington',
    '54':'West Virginia','55':'Wisconsin','56':'Wyoming'
};

// Which FIPS codes belong to each UI region
const REGION_FIPS = {
    South:     ['01','47','28','22','05','21','48','40','35','13','12','45','37'],
    Midwest:   ['17','55','27','19','26','18','29','20','31','46','38','56','30'],
    Northeast: ['36','34','10','24','42','39','51','54','23','33','50','25','44','09'],
    West:      ['06','32','04','41','53','16','08','49','02','15']
};

// Per-state metrics — seeded from bottler baselines with per-state variance
const STATE_DATA = (() => {
    const seed = {
        '17':{ recovery:88, load:95, retention:97, nps:78, cpd:0.99, drops:16.6 },
        '55':{ recovery:86, load:93, retention:96, nps:76, cpd:1.03, drops:16.0 },
        '27':{ recovery:87, load:94, retention:96, nps:77, cpd:1.02, drops:16.2 },
        '19':{ recovery:85, load:92, retention:95, nps:75, cpd:1.04, drops:15.8 },
        '26':{ recovery:88, load:94, retention:96, nps:78, cpd:0.99, drops:16.5 },
        '18':{ recovery:86, load:93, retention:95, nps:76, cpd:1.03, drops:16.1 },
        '29':{ recovery:87, load:93, retention:96, nps:77, cpd:1.01, drops:16.3 },
        '01':{ recovery:92, load:97, retention:98, nps:82, cpd:0.92, drops:18.1 },
        '47':{ recovery:91, load:96, retention:98, nps:81, cpd:0.94, drops:17.9 },
        '28':{ recovery:90, load:95, retention:97, nps:80, cpd:0.96, drops:17.5 },
        '22':{ recovery:91, load:96, retention:98, nps:81, cpd:0.93, drops:17.8 },
        '05':{ recovery:90, load:95, retention:97, nps:80, cpd:0.96, drops:17.4 },
        '21':{ recovery:91, load:96, retention:98, nps:81, cpd:0.94, drops:17.7 },
        '48':{ recovery:89, load:96, retention:97, nps:80, cpd:0.96, drops:17.4 },
        '40':{ recovery:87, load:94, retention:96, nps:78, cpd:1.00, drops:17.0 },
        '35':{ recovery:88, load:95, retention:97, nps:79, cpd:0.98, drops:17.2 },
        '13':{ recovery:87, load:94, retention:97, nps:78, cpd:1.00, drops:16.9 },
        '12':{ recovery:86, load:93, retention:96, nps:77, cpd:1.02, drops:16.6 },
        '45':{ recovery:85, load:92, retention:96, nps:76, cpd:1.04, drops:16.5 },
        '37':{ recovery:86, load:93, retention:97, nps:77, cpd:1.02, drops:16.7 },
        '36':{ recovery:83, load:91, retention:94, nps:73, cpd:1.10, drops:15.2 },
        '34':{ recovery:84, load:92, retention:95, nps:74, cpd:1.08, drops:15.4 },
        '10':{ recovery:83, load:91, retention:94, nps:73, cpd:1.10, drops:15.1 },
        '24':{ recovery:83, load:91, retention:94, nps:73, cpd:1.10, drops:15.0 },
        '42':{ recovery:84, load:92, retention:95, nps:74, cpd:1.08, drops:15.3 },
        '39':{ recovery:82, load:90, retention:94, nps:72, cpd:1.12, drops:14.8 },
        '51':{ recovery:83, load:91, retention:94, nps:73, cpd:1.09, drops:15.1 },
        '54':{ recovery:81, load:90, retention:93, nps:71, cpd:1.13, drops:14.6 },
        '23':{ recovery:82, load:90, retention:93, nps:72, cpd:1.12, drops:14.8 },
        '33':{ recovery:81, load:89, retention:93, nps:71, cpd:1.14, drops:14.6 },
        '50':{ recovery:80, load:88, retention:92, nps:70, cpd:1.15, drops:14.4 },
        '25':{ recovery:82, load:90, retention:94, nps:72, cpd:1.11, drops:14.9 },
        '44':{ recovery:81, load:89, retention:93, nps:71, cpd:1.13, drops:14.7 },
        '09':{ recovery:83, load:91, retention:94, nps:73, cpd:1.09, drops:15.2 },
        '20':{ recovery:85, load:92, retention:95, nps:75, cpd:1.05, drops:15.5 },
        '31':{ recovery:84, load:92, retention:95, nps:74, cpd:1.06, drops:15.4 },
        '46':{ recovery:83, load:91, retention:94, nps:73, cpd:1.08, drops:15.2 },
        '38':{ recovery:83, load:91, retention:94, nps:73, cpd:1.09, drops:15.1 },
        '56':{ recovery:82, load:90, retention:94, nps:72, cpd:1.11, drops:14.8 },
        '30':{ recovery:82, load:90, retention:93, nps:72, cpd:1.12, drops:14.7 },
        '06':{ recovery:81, load:88, retention:93, nps:69, cpd:1.20, drops:13.4 },
        '32':{ recovery:80, load:87, retention:92, nps:68, cpd:1.22, drops:13.1 },
        '04':{ recovery:80, load:88, retention:92, nps:68, cpd:1.21, drops:13.2 },
        '41':{ recovery:79, load:88, retention:93, nps:70, cpd:1.18, drops:14.3 },
        '53':{ recovery:78, load:88, retention:93, nps:70, cpd:1.17, drops:14.2 },
        '16':{ recovery:77, load:87, retention:92, nps:69, cpd:1.19, drops:14.0 },
        '08':{ recovery:78, load:87, retention:92, nps:68, cpd:1.22, drops:13.0 },
        '49':{ recovery:77, load:86, retention:91, nps:67, cpd:1.24, drops:12.8 },
        '02':{ recovery:76, load:85, retention:91, nps:66, cpd:1.25, drops:12.6 },
        '15':{ recovery:77, load:86, retention:91, nps:67, cpd:1.23, drops:12.9 }
    };
    return seed;
})();

// FIPS (zero-padded string) → bottler id
const STATE_BOTTLER = {
    '17':'reyes','55':'reyes','27':'reyes','19':'reyes','26':'reyes','18':'reyes','29':'reyes',
    '01':'ccunited','47':'ccunited','28':'ccunited','22':'ccunited','05':'ccunited','21':'ccunited',
    '48':'arca','40':'arca','35':'arca',
    '13':'ccswb','12':'ccswb','45':'ccswb','37':'ccswb',
    '36':'liberty','34':'liberty','10':'liberty','24':'liberty','42':'liberty','39':'liberty','51':'liberty','54':'liberty',
    '23':'ccne','33':'ccne','50':'ccne','25':'ccne','44':'ccne','09':'ccne',
    '20':'greatplains','31':'greatplains','46':'greatplains','38':'greatplains','56':'greatplains','30':'greatplains',
    '06':'peninsula','32':'peninsula','04':'peninsula',
    '41':'pacific','53':'pacific','16':'pacific',
    '08':'highcountry','49':'highcountry','02':'highcountry','15':'highcountry'
};

// Agentforce scripted scenarios — Georgia (ccswb) only
const AF_SCRIPTS = {
    eol: {
        prompts: [
            'What EOL risk is coming up in Georgia?',
            'Which accounts should we target first?',
            'Draft the markdown recommendation'
        ],
        exchanges: [
            {
                q: 'What EOL risk is coming up in Georgia?',
                a: `**Scanning Georgia inventory for CC Southwest Beverages...**\n\nI found **1,240 cases** across 3 SKUs expiring within 21 days:\n\n• Sprite 2L — 580 cases · expires Jun 29\n• Fanta Orange 12pk — 420 cases · expires Jul 1\n• Coke Zero 20oz — 240 cases · expires Jul 3\n\nAt current sell-through, **$8,400 in write-downs** are projected. Recovery rate for this cohort is tracking at **74%** — 12 pts below Georgia average.`
            },
            {
                q: 'Which accounts should we target first?',
                a: `Based on historical clearance velocity and current order patterns, I recommend targeting these **6 Atlanta metro accounts** first:\n\n1. Publix — Peachtree City (capacity: 320 cases)\n2. Kroger — Buckhead (capacity: 280 cases)\n3. QuikTrip — I-285 corridor · 4 locations (capacity: 190 cases)\n4. Costco — Kennesaw (capacity: 380 cases)\n\nCombined absorption: **1,170 cases** — covers 94% of at-risk inventory. Optimal window: **Tuesday delivery**, before the weekend restock cycle.`
            },
            {
                q: 'Draft the markdown recommendation',
                a: `**Draft ready for review:**\n\n---\n*To: Georgia Route Managers*\n*Re: EOL Clearance — Action Required by Jun 25*\n\nAgentforce has identified 1,240 cases of near-expiry inventory requiring accelerated clearance. Recommended action:\n\n• **18% markdown** on Sprite 2L and Fanta Orange\n• **22% markdown** on Coke Zero 20oz\n• Priority delivery to 6 flagged accounts (see attached list)\n\nProjected recovery at these discounts: **$7,650** vs. **$0** at write-down.\n\n---\n\nReady to push to your Salesforce inbox or notify route managers directly?`
            }
        ]
    },
    truck: {
        prompts: [
            'Where are Georgia routes underloaded?',
            'What\'s the consolidation opportunity?',
            'Generate the optimized schedule'
        ],
        exchanges: [
            {
                q: 'Where are Georgia routes underloaded?',
                a: `**Analyzing Georgia route telemetry...**\n\nFound **3 Atlanta routes** consistently running below 85% load:\n\n• Route GA-114 · Buckhead · avg **81%** load · Wed/Fri\n• Route GA-127 · Midtown · avg **83%** load · Wed only\n• Route GA-209 · Sandy Springs · avg **79%** load · Tue/Thu\n\nThese 3 routes account for **$1,820/week** in excess cost vs. the Georgia average. Sandy Springs is the biggest outlier — 14 stops averaging only 4.2 cases per drop.`
            },
            {
                q: 'What\'s the consolidation opportunity?',
                a: `Routes GA-114 and GA-127 have **overlapping Wednesday coverage** across a 4-mile radius. Merging them into a single optimized Wednesday run would:\n\n• Reduce truck count: 2 → 1\n• Projected load: **94%** (vs. 81/83% currently)\n• Savings: **$340/week · $17,680/year**\n• CO₂ reduction: **~1.2 tonnes/month**\n\nSandy Springs (GA-209) can absorb 8 of the 14 stops into the Tuesday Buckhead run with no delivery window conflicts.`
            },
            {
                q: 'Generate the optimized schedule',
                a: `**Optimized Georgia Metro Schedule — effective Jun 23:**\n\n| Route | Day | Stops | Est. Load |\n|---|---|---|---|\n| GA-114M (merged) | Wed | 22 stops | 94% |\n| GA-209R (revised) | Tue/Thu | 6 stops | 88% |\n\nProjected monthly savings: **$1,360**\nCO₂ avoided: **1.2 tonnes**\n\nReady to push this schedule to your Salesforce Field Service queue for manager approval?`
            }
        ]
    },
    loyalty: {
        prompts: [
            'Which Georgia accounts are at risk?',
            'What\'s driving the NPS dip?',
            'Recommend a retention action'
        ],
        exchanges: [
            {
                q: 'Which Georgia accounts are at risk?',
                a: `**Scanning Georgia account health...**\n\nIdentified **12 accounts** inactive for 30+ days and **4 accounts** with declining order frequency:\n\n**High risk (inactive 30+ days):**\n• 7 Savannah area convenience accounts\n• 3 Augusta foodservice accounts\n• 2 Columbus grocery accounts\n\n**Declining frequency:**\n• Piggly Wiggly — Warner Robins (↓ 34% orders)\n• Circle K — Macon corridor · 3 locations (↓ 28% orders)\n\nCombined revenue at risk: **~$42K/quarter** if churn continues.`
            },
            {
                q: 'What\'s driving the NPS dip?',
                a: `Georgia NPS dropped from **81 → 78** over the last 6 weeks. Correlation analysis points to two factors:\n\n**1. Delivery reliability** — On-time delivery in Savannah dropped to **88%** in May (target: 95%). 6 of the 7 inactive Savannah accounts had a late delivery in the 2 weeks before going quiet.\n\n**2. EOL pricing confusion** — 3 accounts flagged inconsistent discount pricing on clearance SKUs. Suggests the markdown communication process isn't reaching store-level buyers cleanly.\n\nNeither issue is structural — both are fixable within this quarter.`
            },
            {
                q: 'Recommend a retention action',
                a: `**Recommended 2-touch retention play:**\n\n**Touch 1 — This week:**\nPersonalized outreach to 12 inactive accounts via Salesforce Engage. Template ready:\n*"We noticed a gap in your recent orders — here's what's new + an exclusive reorder incentive."*\n• 15% discount on first reorder (7-day window)\n• Prioritized delivery slot offered\n\n**Touch 2 — Jun 23:**\nFor accounts that don't respond, escalate to route rep for in-person check-in with a sample kit (new Sprite Chill + Fanta Mango).\n\nProjected re-engagement rate based on similar cohorts: **62%**. That recovers roughly **$26K** of the $42K at-risk revenue.`
            }
        ]
    }
};

// Per-tab: which bottler metric to shade by, and tooltip pair
const TAB_MAP_CONFIG = {
    eol:       { shadeKey: 'recovery',  shadeMin: 75, shadeMax: 92,
                 m1: (f) => ({ label: 'Recovery Rate', val: f.recovery + '%' }),
                 m2: (f) => ({ label: 'Margin Preserved', val: f.margin >= 1000000 ? '$' + (f.margin/1000000).toFixed(2) + 'M' : '$' + Math.round(f.margin/1000) + 'K' }) },
    truck:     { shadeKey: 'load',      shadeMin: 84, shadeMax: 97,
                 m1: (f) => ({ label: 'Load Rate',       val: f.load + '%' }),
                 m2: (f) => ({ label: 'Cost / Delivery', val: '$' + f.cpd.toFixed(2) }) },
    loyalty:   { shadeKey: 'retention', shadeMin: 90, shadeMax: 99,
                 m1: (f) => ({ label: 'Retention',       val: f.retention + '%' }),
                 m2: (f) => ({ label: 'NPS',             val: String(f.nps) }) },
    inventory: { shadeKey: 'invDays',   shadeMin: 13, shadeMax: 30,
                 m1: (f) => ({ label: 'Days of Supply',  val: f.invDays + 'd' }),
                 m2: (f) => ({ label: 'Overstock',       val: '$' + Math.round((f.overstock||0) / 1000) + 'K' }) }
};

function stateColor(t, isSelected, isActive) {
    if (isActive) return '#C8102E';
    if (isSelected !== null && !isSelected) return '#EBEBEB';
    // t = 0..1 — interpolate light pink → Coke red
    const r = Math.round(252 + (200 - 252) * t);
    const g = Math.round(221 + (16  - 221) * t);
    const b = Math.round(226 + (46  - 226) * t);
    return `rgb(${r},${g},${b})`;
}

const CHART_OPTS = {
    font: { size: 11, family: "-apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif" },
    grid: '#EBEBEB', tick: '#999'
};

function axis(overrides = {}) {
    return {
        ticks: { color: CHART_OPTS.tick, font: CHART_OPTS.font, ...overrides.ticks },
        grid:  { color: CHART_OPTS.grid, drawBorder: false, ...overrides.grid }
    };
}

export default class KoRefreshAnalyticsDashboard extends LightningElement {
    @track activeTab       = 'eol';
    @track activeRegion    = 'All';
    @track activeBottler   = 'all';
    @track bottlerSearch   = '';
    @track chartjsLoaded   = false;
    @track mapView         = false;
    @track mapTooltip      = null;
    @track mapDrillRegion  = null;
    @track afOpen          = false;
    @track afMessages      = [];
    @track afTyping        = false;
    @track afStep          = 0;

    _charts      = {};
    _data        = KO_DASHBOARD_DATA;
    _topology    = null;
    _libsLoaded  = false;
    _lastMapState = '';
    _mapSvg      = null;
    _mapG        = null;
    _mapProjection = null;
    _mapPath     = null;

    get logoUrl()  { return cokeLogoWhite; }
    get truckUrl()  { return cokeTruck; }
    get crateUrl()  { return cokeCrate; }

    // Max 15 crates in the truck bed, scale by load rate
    get truckCrates() {
        const count = Math.round(this.f.load / 100 * 15);
        return Array.from({ length: count }, (_, i) => ({ key: i }));
    }

    get tabs() {
        return TABS.map(t => ({ ...t, cssClass: 'ko-tab' + (t.id === this.activeTab ? ' active' : '') }));
    }
    get regionPills() {
        return REGIONS.map(r => ({ id: r, label: r, cssClass: 'ko-pill' + (r === this.activeRegion ? ' pill-active' : '') }));
    }
    get filteredBottlers() {
        const pool = this.activeRegion === 'All' ? BOTTLERS : BOTTLERS.filter(b => b.region === this.activeRegion);
        const q    = this.bottlerSearch.toLowerCase().trim();
        const matched = q ? pool.filter(b => b.name.toLowerCase().includes(q)) : pool;
        const allPill = { id: 'all', name: 'All Bottlers', cssClass: 'ko-pill' + (this.activeBottler === 'all' ? ' pill-active' : '') };
        return [allPill, ...matched.map(b => ({ ...b, cssClass: 'ko-pill' + (b.id === this.activeBottler ? ' pill-active' : '') }))];
    }

    get isEol()       { return this.activeTab === 'eol'; }
    get isTruck()     { return this.activeTab === 'truck'; }
    get isLoyalty()   { return this.activeTab === 'loyalty'; }
    get isInventory() { return this.activeTab === 'inventory'; }
    get showCharts(){ return !this.mapView; }
    get showMap()   { return this.mapView; }

    get mapToggleBtnClass() { return 'ko-map-btn' + (this.mapView ? ' map-btn-active' : ''); }
    get showMapBack()       { return this.mapView && !!this.mapDrillRegion; }
    get mapBreadcrumb()     { return this.mapDrillRegion ? 'US · ' + this.mapDrillRegion : 'US'; }

    // Agentforce panel
    get isGeorgia()         { return this.activeBottler === 'ccswb'; }
    get afBtnClass()        { return 'af-fab' + (this.isGeorgia ? ' af-fab-active' : ''); }
    get afBtnLabel()        { return this.isGeorgia ? '⚡ Agentforce' : '⚡ Agentforce'; }
    get afContextLine()     {
        if (!this.isGeorgia) return 'Select Georgia (CC Southwest Beverages) to unlock scenario';
        const tabLabel = { eol: 'EOL Clearance', truck: 'Truck Optimization', loyalty: 'Customer Loyalty' }[this.activeTab];
        return 'Context: Georgia · ' + tabLabel;
    }
    get afPrompts() {
        if (!this.isGeorgia) return [];
        const script = AF_SCRIPTS[this.activeTab];
        return script ? script.prompts.slice(this.afStep).map((p, i) => ({ key: String(i), label: p })) : [];
    }
    get afHasMessages()     { return this.afMessages.length > 0; }
    get afLocked()          { return !this.isGeorgia; }

    get mapTooltipStyle() {
        if (!this.mapTooltip) return '';
        return `left:${this.mapTooltip.x}px;top:${this.mapTooltip.y}px`;
    }

    get f() {
        if (this.activeBottler !== 'all') {
            const b = BOTTLERS.find(x => x.id === this.activeBottler);
            if (b) return b;
        }
        return REGION_FACTORS[this.activeRegion];
    }

    get kpiRecovery()  { return this.f.recovery + '%'; }
    get kpiMargin() {
        const m = this.f.margin;
        return m >= 1000000 ? '$' + (m / 1000000).toFixed(1) + 'M' : '$' + Math.round(m / 1000) + 'K';
    }
    get kpiDays()      { return this.f.days + 'd'; }
    get kpiShrink()    { return '−$' + (this.f.shrink / 1000).toFixed(0) + 'K'; }
    get kpiLoad()      { return this.f.load + '%'; }
    get kpiCpd()       { return '$' + this.f.cpd.toFixed(2); }
    get kpiDrops()     { return this.f.drops.toFixed(1); }
    get kpiCo2()       { return this.f.co2 + '%'; }
    get kpiAdoption()   { return this.f.adoption + '%'; }
    get kpiNps()        { return this.f.nps; }
    get kpiRetention()  { return this.f.retention + '%'; }

    get kpiInvValue()   {
        const v = this.f.invValue || 0;
        return v >= 1000000 ? '$' + (v / 1000000).toFixed(1) + 'M' : '$' + Math.round(v / 1000) + 'K';
    }
    get kpiInvDays()    { return (this.f.invDays || 0) + 'd'; }
    get kpiOverstock()  {
        const v = this.f.overstock || 0;
        return '$' + Math.round(v / 1000) + 'K';
    }
    get kpiPending()    {
        const v = this.f.pending || 0;
        return v >= 1000000 ? '$' + (v / 1000000).toFixed(1) + 'M' : '$' + Math.round(v / 1000) + 'K';
    }
    get invBuyOpportunity() {
        const f = this.f;
        if (!f.invDays) return 'N/A';
        const targetDays = 18;
        const gap = targetDays - f.invDays;
        if (gap <= 0) return 'At capacity';
        const dailyVal = (f.invValue || 0) / f.invDays;
        const opp = Math.round(dailyVal * gap / 1000);
        return '$' + opp + 'K opportunity';
    }

    get truckGain()        { return this.f.load - 71; }
    get truckBarStyle()    { return 'width:' + this.f.load + '%'; }
    get truckThumbStyle()  { return 'left:' + this.f.load + '%'; }

    // Liquid fill — cargo interior y:28→196, height=168
    get truckFillY()      { return Math.round(196 - this.f.load / 100 * 168); }
    get truckFillHeight() { return Math.round(this.f.load / 100 * 168 + 4); }
    get truckLabelFill()  { return this.f.load > 35 ? '#fff' : '#C8102E'; }

    // Bottler logo for truck area
    get truckBottlerLogoUrl() {
        if (this.activeBottler === 'ccunited') return ccunitedLogo;
        if (this.activeBottler === 'arca' || this.activeBottler === 'ccswb') return arcaLogo;
        return null;
    }
    get showTruckBottlerLogo() { return !!this.truckBottlerLogoUrl; }

    get truckFillStyle() {
        return 'height:' + this.f.load + '%;';
    }
    get truckLabelStyle() {
        return 'color:' + (this.f.load > 35 ? '#fff' : '#C8102E') + ';';
    }

    connectedCallback() {
        Promise.all([
            loadScript(this, chartjs),
            loadScript(this, d3url),
            loadScript(this, topojsonurl)
        ])
        .then(() => fetch(usstatesurl))
        .then(r => r.json())
        .then(topo => {
            this._topology  = topo;
            this._libsLoaded = true;
            this.chartjsLoaded = true;
            this._renderCurrent();
        })
        .catch(e => console.error('Load failed', e));
    }

    renderedCallback() {
        if (!this._libsLoaded) return;
        this._renderCurrent();
    }

    _renderCurrent() {
        if (this.mapView) {
            this._renderMap();
        } else {
            this._renderChartsForTab(this.activeTab);
        }
    }

    handleTabClick(evt) {
        const tab = evt.currentTarget.dataset.tab;
        if (tab === this.activeTab) return;
        this._destroyAll();
        this.activeTab = tab;
    }

    handleRegionClick(evt) {
        const region = evt.currentTarget.dataset.region;
        if (region === this.activeRegion) return;
        this.activeRegion  = region;
        this.activeBottler = 'all';
        this.bottlerSearch = '';
        this._destroyAll();
    }

    handleBottlerClick(evt) {
        const id = evt.currentTarget.dataset.id;
        if (id === this.activeBottler) return;
        this.activeBottler = id;
        this._destroyAll();
    }

    handleBottlerSearch(evt) {
        this.bottlerSearch = evt.target.value;
    }

    handleMapToggle() {
        this.mapView = !this.mapView;
        this._destroyAll();
    }

    handleAfToggle() {
        this.afOpen = !this.afOpen;
        if (this.afOpen) {
            this.afMessages = [];
            this.afStep     = 0;
        }
    }

    handleAfPrompt(evt) {
        if (!this.isGeorgia || this.afTyping) return;
        const idx   = parseInt(evt.currentTarget.dataset.idx, 10);
        const script = AF_SCRIPTS[this.activeTab];
        const exchange = script.exchanges[this.afStep + idx];
        if (!exchange) return;

        // Push user message
        this.afMessages = [...this.afMessages, { id: String(this.afMessages.length), role: 'user', isUser: true, isAgent: false, isConfirm: false, wrapClass: 'af-msg-row af-msg-user', text: exchange.q, lines: [] }];
        this.afTyping   = true;
        this.afStep     = this.afStep + idx + 1;

        // Simulate typing delay then stream response line by line
        const lines = exchange.a.split('\n').filter(l => l !== '');
        let lineIdx = 0;
        const botMsgId = String(this.afMessages.length);
        this.afMessages = [...this.afMessages, { id: botMsgId, role: 'agent', isUser: false, isAgent: true, isConfirm: false, wrapClass: 'af-msg-row af-msg-agent', text: '', lines: [] }];

        const tick = () => {
            if (lineIdx >= lines.length) {
                this.afTyping = false;
                return;
            }
            const nextLine = lines[lineIdx];
            this.afMessages = this.afMessages.map(m => {
                if (m.id !== botMsgId) return m;
                return { ...m, lines: [...m.lines, nextLine] };
            });
            lineIdx++;
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(tick, 90);
        };
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(tick, 700);
    }

    handleAfAction() {
        const confirmMsg = {
            id: String(this.afMessages.length),
            role: 'confirm', isUser: false, isAgent: false, isConfirm: true,
            wrapClass: 'af-msg-row',
            text: '',
            lines: ['✓ Action queued in Salesforce', 'Task created · assigned to Georgia route manager', 'Estimated completion: within 24 hrs']
        };
        this.afMessages = [...this.afMessages, confirmMsg];
    }

    handleMapBack() {
        this.mapDrillRegion = null;
        this._lastMapState  = '';
        this._renderMap();
    }

    _destroyAll() {
        Object.values(this._charts).forEach(c => c.destroy());
        this._charts       = {};
        this._lastMapState = '';
        this._mapSvg       = null;
        this._mapG         = null;
    }

    // ── Map ──
    _renderMap() {
        const stateKey = this.activeTab + '|' + this.activeRegion + '|' + this.activeBottler + '|' + (this.mapDrillRegion || '');
        if (stateKey === this._lastMapState) return;
        this._lastMapState = stateKey;

        const container = this.template.querySelector('[data-mapid]');
        if (!container || !this._topology) return;

        // eslint-disable-next-line no-undef
        const d3 = window.d3;
        // eslint-disable-next-line no-undef
        const topojson = window.topojson;

        const width  = container.clientWidth  || 780;
        const height = container.clientHeight || 440;

        const states    = topojson.feature(this._topology, this._topology.objects.states);
        const cfg       = TAB_MAP_CONFIG[this.activeTab];
        const drillRegion = this.mapDrillRegion;
        const drillFips   = drillRegion ? new Set(REGION_FIPS[drillRegion] || []) : null;

        // Build or reuse SVG
        if (!this._mapSvg) {
            while (container.firstChild) container.removeChild(container.firstChild);

            const svg = d3.select(container)
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('viewBox', `0 0 ${width} ${height}`)
                .style('display', 'block');

            const projection = d3.geoAlbersUsa().fitSize([width, height], states);
            const path       = d3.geoPath().projection(projection);

            const g = svg.append('g');

            this._mapSvg        = svg;
            this._mapG          = g;
            this._mapProjection = projection;
            this._mapPath       = path;

            // Draw all states once
            g.selectAll('path.state')
                .data(states.features)
                .enter()
                .append('path')
                .attr('class', 'state')
                .attr('d', path)
                .attr('stroke', '#fff')
                .attr('stroke-width', 0.8);

            // Borders mesh
            g.append('path')
                .attr('class', 'borders')
                .datum(topojson.mesh(this._topology, this._topology.objects.states, (a, b) => a !== b))
                .attr('fill', 'none')
                .attr('stroke', '#fff')
                .attr('stroke-width', 0.5)
                .attr('d', path);
        }

        const g    = this._mapG;
        const path = this._mapPath;

        // ── Color + interaction for each state ──
        const self = this;
        g.selectAll('path.state')
            .attr('fill', d => {
                const fips = String(d.id).padStart(2, '0');
                if (drillFips && !drillFips.has(fips)) return '#EBEBEB';
                const sd = STATE_DATA[fips];
                if (!sd) return '#EBEBEB';
                const t = (sd[cfg.shadeKey] - cfg.shadeMin) / (cfg.shadeMax - cfg.shadeMin);
                return stateColor(Math.max(0, Math.min(1, t)), null, false);
            })
            .attr('cursor', 'pointer')
            .on('mouseenter', function(event, d) {
                const fips = String(d.id).padStart(2, '0');
                if (drillFips && !drillFips.has(fips)) return;
                const sd = STATE_DATA[fips];
                if (!sd) return;
                const bottlerId = STATE_BOTTLER[fips];
                const bottler   = BOTTLERS.find(b => b.id === bottlerId);
                const rect = container.getBoundingClientRect();
                const x    = event.clientX - rect.left + 14;
                const y    = event.clientY - rect.top  - 10;
                const m1   = cfg.m1(sd);
                const m2   = cfg.m2(sd);
                const name = FIPS_NAME[fips] || fips;
                const territory = bottler ? bottler.name : '';
                self.mapTooltip = { x, y, name, territory, m1label: m1.label, m1val: m1.val, m2label: m2.label, m2val: m2.val };
                d3.select(this).attr('stroke', '#333').attr('stroke-width', 1.5).raise();
            })
            .on('mouseleave', function() {
                self.mapTooltip = null;
                d3.select(this).attr('stroke', '#fff').attr('stroke-width', 0.8);
            })
            .on('click', function(event, d) {
                const fips = String(d.id).padStart(2, '0');
                if (!drillRegion) {
                    // National view — click zooms into that state's region
                    const bottlerId = STATE_BOTTLER[fips];
                    const bottler   = BOTTLERS.find(b => b.id === bottlerId);
                    if (!bottler) return;
                    self.mapDrillRegion = bottler.region;
                    self._lastMapState  = '';
                    self._zoomToRegion(bottler.region);
                    self._renderMap();
                } else {
                    // Drilled-in view — click selects bottler for that state
                    if (!drillFips.has(fips)) return;
                    const bottlerId = STATE_BOTTLER[fips];
                    if (!bottlerId) return;
                    const next = bottlerId === self.activeBottler ? 'all' : bottlerId;
                    self.activeBottler = next;
                    if (next !== 'all') {
                        const b = BOTTLERS.find(x => x.id === bottlerId);
                        if (b) self.activeRegion = b.region;
                    }
                    self._lastMapState = '';
                    self._renderMap();
                }
            });

        // ── Zoom ──
        if (drillRegion) {
            this._zoomToRegion(drillRegion);
        } else {
            this._zoomToNational();
        }
    }

    _zoomToRegion(region) {
        const d3        = window.d3; // eslint-disable-line no-undef
        const topojson  = window.topojson; // eslint-disable-line no-undef
        if (!this._mapSvg || !this._topology) return;

        const container = this.template.querySelector('[data-mapid]');
        if (!container) return;
        const width  = container.clientWidth  || 780;
        const height = container.clientHeight || 440;

        const drillFips = new Set(REGION_FIPS[region] || []);
        const states    = topojson.feature(this._topology, this._topology.objects.states);
        const regionFeatures = states.features.filter(f => drillFips.has(String(f.id).padStart(2, '0')));
        if (!regionFeatures.length) return;

        const regionGeo  = { type: 'FeatureCollection', features: regionFeatures };
        const projection = d3.geoAlbersUsa().fitSize([width, height], regionGeo);
        const newPath    = d3.geoPath().projection(projection);

        // Animate all state paths to new projection
        this._mapG.selectAll('path.state')
            .transition().duration(600).ease(d3.easeCubicInOut)
            .attr('d', newPath);

        this._mapG.selectAll('path.borders')
            .transition().duration(600).ease(d3.easeCubicInOut)
            .attr('d', newPath);

        this._mapPath = newPath;
    }

    _zoomToNational() {
        const d3       = window.d3; // eslint-disable-line no-undef
        const topojson = window.topojson; // eslint-disable-line no-undef
        if (!this._mapSvg || !this._topology) return;

        const container = this.template.querySelector('[data-mapid]');
        if (!container) return;
        const width  = container.clientWidth  || 780;
        const height = container.clientHeight || 440;

        const states     = topojson.feature(this._topology, this._topology.objects.states);
        const projection = d3.geoAlbersUsa().fitSize([width, height], states);
        const newPath    = d3.geoPath().projection(projection);

        this._mapG.selectAll('path.state')
            .transition().duration(600).ease(d3.easeCubicInOut)
            .attr('d', newPath);

        this._mapG.selectAll('path.borders')
            .transition().duration(600).ease(d3.easeCubicInOut)
            .attr('d', newPath);

        this._mapPath = newPath;
    }

    // ── Charts ──
    _renderChartsForTab(tab) {
        // eslint-disable-next-line default-case
        switch (tab) {
            case 'eol':       this._renderEol();       break;
            case 'truck':     this._renderTruck();     break;
            case 'loyalty':   this._renderLoyalty();   break;
            case 'inventory': this._renderInventory(); break;
        }
    }

    _ctx(id) {
        const el = this.template.querySelector(`[data-chartid="${id}"]`);
        return el ? el.getContext('2d') : null;
    }

    _make(id, config) {
        if (this._charts[id]) { this._charts[id].destroy(); }
        const ctx = this._ctx(id);
        if (!ctx) return;
        // eslint-disable-next-line no-undef
        const extraPlugins = (config.options && config.options.plugins) ? config.options.plugins : {};
        const baseOpts     = config.options || {};
        this._charts[id] = new Chart(ctx, {
            ...config,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                ...baseOpts,
                plugins: {
                    legend: { display: false },
                    tooltip: { backgroundColor: '#fff', titleColor: '#333', bodyColor: '#555', borderColor: '#E0E0E0', borderWidth: 1, padding: 10 },
                    ...extraPlugins
                }
            }
        });
    }

    _renderEol() {
        const months = this._data.executiveInsights.eolTrendMonths;
        const f = this.f;
        const rb = f.recovery;
        const trend = [
            Math.round(rb * 0.88), Math.round(rb * 0.91),
            Math.round(rb * 0.93), Math.round(rb * 0.95),
            Math.round(rb * 0.98), rb
        ];
        this._make('eol_trend', {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    data: trend,
                    borderColor: '#C8102E', backgroundColor: 'rgba(200,16,46,0.06)',
                    fill: true, tension: 0.45, pointRadius: 5,
                    pointBackgroundColor: '#C8102E', pointBorderColor: '#fff', pointBorderWidth: 2, borderWidth: 2.5
                }]
            },
            options: {
                scales: {
                    x: axis({ grid: { display: false } }),
                    y: { ...axis(), min: 60, max: 100, ticks: { color: CHART_OPTS.tick, font: CHART_OPTS.font, callback: v => v + '%' } }
                },
                plugins: { tooltip: { callbacks: { label: ctx => ctx.raw + '%' } } }
            }
        });

        this._make('eol_margin', {
            type: 'bar',
            data: {
                labels: ['Revenue Recovered', 'Destruction Cost Avoided'],
                datasets: [{
                    data: [f.margin, Math.round(f.margin * 0.58)],
                    backgroundColor: ['#C8102E', '#E8E8E8'],
                    borderRadius: 6, barThickness: 64
                }]
            },
            options: {
                scales: {
                    x: axis({ grid: { display: false } }),
                    y: { ...axis(), ticks: { color: CHART_OPTS.tick, font: CHART_OPTS.font, callback: v => {
                        if (v >= 1000000) return '$' + (v/1000000).toFixed(1) + 'M';
                        return '$' + (v/1000).toFixed(0) + 'K';
                    }}}
                },
                plugins: { tooltip: { callbacks: { label: ctx => {
                    const v = ctx.raw;
                    return v >= 1000000 ? '$' + (v/1000000).toFixed(2) + 'M' : '$' + (v/1000).toFixed(0) + 'K';
                }}}}
            }
        });
    }

    _renderTruck() {
        const months = this._data.executiveInsights.eolTrendMonths;
        const f = this.f;
        const loadBase = f.load;
        const loadTrend = [
            Math.round(loadBase * 0.84), Math.round(loadBase * 0.87),
            Math.round(loadBase * 0.90), Math.round(loadBase * 0.93),
            Math.round(loadBase * 0.96), loadBase
        ];
        this._make('truck_load', {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    data: loadTrend,
                    borderColor: '#C8102E', backgroundColor: 'rgba(200,16,46,0.06)',
                    fill: true, tension: 0.45, pointRadius: 5,
                    pointBackgroundColor: '#C8102E', pointBorderColor: '#fff', pointBorderWidth: 2, borderWidth: 2.5
                }]
            },
            options: {
                scales: {
                    x: axis({ grid: { display: false } }),
                    y: { ...axis(), min: 60, max: 100, ticks: { color: CHART_OPTS.tick, font: CHART_OPTS.font, callback: v => v + '%' } }
                }
            }
        });

        const cpdBase = f.cpd;
        const cpdTrend = [
            +(cpdBase * 1.22).toFixed(2), +(cpdBase * 1.17).toFixed(2),
            +(cpdBase * 1.12).toFixed(2), +(cpdBase * 1.08).toFixed(2),
            +(cpdBase * 1.04).toFixed(2), +cpdBase.toFixed(2)
        ];
        this._make('truck_cpd', {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    data: cpdTrend,
                    borderColor: '#C8102E', backgroundColor: 'rgba(200,16,46,0.06)',
                    fill: true, tension: 0.45, pointRadius: 5,
                    pointBackgroundColor: '#C8102E', pointBorderColor: '#fff', pointBorderWidth: 2, borderWidth: 2.5
                }]
            },
            options: {
                scales: {
                    x: axis({ grid: { display: false } }),
                    y: { ...axis(), ticks: { color: CHART_OPTS.tick, font: CHART_OPTS.font, callback: v => '$' + v.toFixed(2) } }
                }
            }
        });
    }

    _renderLoyalty() {
        const months  = this._data.executiveInsights.eolTrendMonths;
        const f       = this.f;
        const retBase = f.retention;
        const retStd  = Math.round(retBase * 0.76);

        this._make('loyalty_retention', {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'On Program',
                        data: [
                            Math.round(retBase*0.94), Math.round(retBase*0.95),
                            Math.round(retBase*0.96), Math.round(retBase*0.97),
                            Math.round(retBase*0.99), retBase
                        ],
                        borderColor: '#C8102E', backgroundColor: 'rgba(200,16,46,0.06)',
                        fill: true, tension: 0.45, pointRadius: 5,
                        pointBackgroundColor: '#C8102E', pointBorderColor: '#fff', pointBorderWidth: 2, borderWidth: 2.5
                    },
                    {
                        label: 'Standard Only',
                        data: [retStd+1, retStd+1, retStd, retStd, retStd-1, retStd-1],
                        borderColor: '#CCCCCC', backgroundColor: 'transparent',
                        fill: false, tension: 0.3, pointRadius: 4,
                        pointBackgroundColor: '#CCCCCC', pointBorderColor: '#fff',
                        pointBorderWidth: 1.5, borderWidth: 2, borderDash: [6, 4]
                    }
                ]
            },
            options: {
                plugins: { legend: { display: true, position: 'top', align: 'end', labels: { color: '#999', font: CHART_OPTS.font, boxWidth: 10, boxHeight: 10, padding: 16 } } },
                scales: {
                    x: axis({ grid: { display: false } }),
                    y: { ...axis(), min: 60, max: 100, ticks: { color: CHART_OPTS.tick, font: CHART_OPTS.font, callback: v => v + '%' } }
                }
            }
        });

        const npsBase = f.nps;
        this._make('loyalty_nps', {
            type: 'line',
            data: {
                labels: ['Q3 FY24','Q4 FY24','Q1 FY25','Q2 FY25','Q3 FY25','Q4 FY25','Q1 FY26','Q2 FY26'],
                datasets: [{
                    data: [
                        Math.round(npsBase*0.72), Math.round(npsBase*0.77),
                        Math.round(npsBase*0.81), Math.round(npsBase*0.85),
                        Math.round(npsBase*0.88), Math.round(npsBase*0.92),
                        Math.round(npsBase*0.96), npsBase
                    ],
                    borderColor: '#C8102E', backgroundColor: 'rgba(200,16,46,0.06)',
                    fill: true, tension: 0.45, pointRadius: 5,
                    pointBackgroundColor: '#C8102E', pointBorderColor: '#fff', pointBorderWidth: 2, borderWidth: 2.5
                }]
            },
            options: {
                scales: {
                    x: axis({ grid: { display: false }, ticks: { maxRotation: 30 } }),
                    y: { ...axis(), min: 40, max: 90, ticks: { color: CHART_OPTS.tick, font: CHART_OPTS.font } }
                }
            }
        });
    }

    _renderInventory() {
        const months = this._data.executiveInsights.eolTrendMonths;
        const f = this.f;

        // Chart 1: SKU category mix — horizontal stacked bar
        const pool = this.activeBottler === 'all'
            ? (this.activeRegion === 'All' ? BOTTLERS : BOTTLERS.filter(b => b.region === this.activeRegion))
            : [BOTTLERS.find(b => b.id === this.activeBottler)].filter(Boolean);

        const labels   = pool.map(b => b.name.replace('Coca-Cola ', 'CC ').replace(' Beverages','').replace(' Bottling',''));
        const csdData  = pool.map(b => b.invMix ? b.invMix.csd  : 52);
        const watData  = pool.map(b => b.invMix ? b.invMix.water : 18);
        const engData  = pool.map(b => b.invMix ? b.invMix.energy : 16);
        const juiceData= pool.map(b => b.invMix ? b.invMix.juice : 14);

        this._make('inv_mix', {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    { label: 'CSD',    data: csdData,   backgroundColor: '#C8102E',              borderRadius: 0 },
                    { label: 'Water',  data: watData,   backgroundColor: '#5B9BD5',              borderRadius: 0 },
                    { label: 'Energy', data: engData,   backgroundColor: '#F4B942',              borderRadius: 0 },
                    { label: 'Juice',  data: juiceData, backgroundColor: 'rgba(200,16,46,0.25)', borderRadius: 0 }
                ]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    legend: { display: true, position: 'top', align: 'end', labels: { color: '#999', font: CHART_OPTS.font, boxWidth: 10, boxHeight: 10, padding: 12 } },
                    tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.raw + '%' } }
                },
                scales: {
                    x: { ...axis(), stacked: true, ticks: { color: CHART_OPTS.tick, font: CHART_OPTS.font, callback: v => v + '%' }, max: 100 },
                    y: { ...axis({ grid: { display: false } }), stacked: true, ticks: { color: CHART_OPTS.tick, font: { size: 10 } } }
                }
            }
        });

        // Chart 2: days-of-supply trend + 18-day reorder threshold line
        const daysBase = f.invDays || 21;
        const hist = f.invDaysHistory || [daysBase + 6, daysBase + 5, daysBase + 4, daysBase + 3, daysBase + 1, daysBase];
        const fwdMonths = ['Jul 26', 'Aug 26', 'Sep 26'];
        const velocity  = (hist[hist.length - 1] - hist[0]) / (hist.length - 1);
        const fwd = fwdMonths.map((_, i) => Math.max(10, Math.round(daysBase + velocity * (i + 1))));
        const allLabels = [...months, ...fwdMonths];
        const allDays   = [...hist, ...fwd];

        this._make('inv_days', {
            type: 'line',
            data: {
                labels: allLabels,
                datasets: [
                    {
                        label: 'Days of Supply',
                        data: allDays,
                        borderColor: '#C8102E', backgroundColor: 'rgba(200,16,46,0.06)',
                        fill: true, tension: 0.4, pointRadius: (ctx) => ctx.dataIndex < months.length ? 5 : 4,
                        pointBackgroundColor: (ctx) => ctx.dataIndex < months.length ? '#C8102E' : '#aaa',
                        pointBorderColor: '#fff', pointBorderWidth: 2, borderWidth: 2.5,
                        segment: { borderDash: (ctx) => ctx.p1DataIndex >= months.length ? [5, 4] : [] }
                    },
                    {
                        label: 'Reorder Threshold (18d)',
                        data: allLabels.map(() => 18),
                        borderColor: '#F4B942', backgroundColor: 'transparent',
                        fill: false, tension: 0, pointRadius: 0, borderWidth: 1.5,
                        borderDash: [6, 4]
                    }
                ]
            },
            options: {
                plugins: {
                    legend: { display: true, position: 'top', align: 'end', labels: { color: '#999', font: CHART_OPTS.font, boxWidth: 10, boxHeight: 10, padding: 12 } },
                    tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.raw + 'd' } }
                },
                scales: {
                    x: axis({ grid: { display: false }, ticks: { maxRotation: 30 } }),
                    y: { ...axis(), min: 8, ticks: { color: CHART_OPTS.tick, font: CHART_OPTS.font, callback: v => v + 'd' } }
                }
            }
        });
    }
}
