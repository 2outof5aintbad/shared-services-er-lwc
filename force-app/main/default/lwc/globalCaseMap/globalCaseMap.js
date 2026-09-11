import { LightningElement, track } from 'lwc';
import { loadScript }              from 'lightning/platformResourceLoader';
import D3_MIN      from '@salesforce/resourceUrl/d3min';
import TOPOJSON    from '@salesforce/resourceUrl/topojsonmin';
import WORLD       from '@salesforce/resourceUrl/world110m';
import US_STATES   from '@salesforce/resourceUrl/usstates10m';
import US_COUNTIES from '@salesforce/resourceUrl/uscounties10m';

// ─── Data model ───────────────────────────────────────────────────────────────
// Each region carries the full chain: complaint → retailer → distributor → bottler

const WORLD_DATA = {
    840: { cases:18420, delta:'+12%', severity:'critical' },
    76:  { cases:9140,  delta:'+34%', severity:'critical' },
    356: { cases:11200, delta:'+22%', severity:'high'     },
    156: { cases:7800,  delta:'+8%',  severity:'medium'   },
    276: { cases:4200,  delta:'+5%',  severity:'medium'   },
    826: { cases:3900,  delta:'+3%',  severity:'low'      },
    484: { cases:5100,  delta:'+18%', severity:'high'     },
    392: { cases:3400,  delta:'+4%',  severity:'low'      },
    36:  { cases:2100,  delta:'-2%',  severity:'low'      },
    170: { cases:2800,  delta:'+15%', severity:'medium'   },
    710: { cases:1900,  delta:'+19%', severity:'medium'   },
    124: { cases:3100,  delta:'+11%', severity:'medium'   },
    250: { cases:2900,  delta:'+6%',  severity:'low'      },
    380: { cases:2200,  delta:'+7%',  severity:'low'      },
    724: { cases:1800,  delta:'+4%',  severity:'low'      },
    643: { cases:3600,  delta:'+9%',  severity:'medium'   },
    586: { cases:4100,  delta:'+16%', severity:'high'     },
};

const STATE_DATA = {
    '01':{name:'Alabama',        cases:310,  delta:'+6%',  severity:'low'     },
    '02':{name:'Alaska',         cases:88,   delta:'+2%',  severity:'low'     },
    '04':{name:'Arizona',        cases:620,  delta:'+9%',  severity:'medium'  },
    '05':{name:'Arkansas',       cases:198,  delta:'+4%',  severity:'low'     },
    '06':{name:'California',     cases:2840, delta:'+14%', severity:'high'    },
    '08':{name:'Colorado',       cases:480,  delta:'+7%',  severity:'medium'  },
    '09':{name:'Connecticut',    cases:290,  delta:'+5%',  severity:'low'     },
    '10':{name:'Delaware',       cases:95,   delta:'+3%',  severity:'low'     },
    '12':{name:'Florida',        cases:1920, delta:'+11%', severity:'high'    },
    '13':{name:'Georgia',        cases:1340, delta:'+31%', severity:'critical',
          alert: true,
          alertSummary: 'Off-taste complaints up 31% — traced to Bottler ATL-03, batch C4-2024',
          complaint:    'Off taste / chemical odour',
          product:      'Coca‑Cola Spiced 20oz PET',
          retailer:     'Kroger & Publix (metro Atlanta)',
          distributor:  { name:'Coca-Cola United – Southeast', contact:'David Mercer', email:'d.mercer@ccunited.com', phone:'(404) 555-0182' },
          bottler:      { name:'Coca-Cola Bottling Co. Consolidated – Atlanta', contact:'Lynn Okafor', email:'l.okafor@ccbcc.com', phone:'(404) 555-0241', batch:'ATL-C4-2024', facility:'Atlanta Plant 3', rootCause:'Pasteurization temperature variance detected on Line 7 — Feb 14–17 production run', holdQty:'4,200 cases' },
          actions: [
              { priority:'Immediate', label:'Place hold on batch ATL-C4-2024', owner:'Lynn Okafor – CCBCC',  status:'open'       },
              { priority:'Immediate', label:'Notify Kroger & Publix SE procurement', owner:'David Mercer – CCU', status:'open'  },
              { priority:'24 hrs',    label:'Issue consumer advisory for lot codes 24045–24048', owner:'Global Care Ops', status:'open' },
              { priority:'48 hrs',    label:'Root cause report from Plant 3 QA team', owner:'Lynn Okafor – CCBCC', status:'open' },
              { priority:'This week', label:'Audit Line 7 calibration records', owner:'CCBCC Quality Assurance', status:'open'  },
          ],
          trend: [42,45,44,49,55,72,110,148],
    },
    '15':{name:'Hawaii',         cases:112,  delta:'+1%',  severity:'low'     },
    '17':{name:'Illinois',       cases:1100, delta:'+10%', severity:'high'    },
    '18':{name:'Indiana',        cases:490,  delta:'+7%',  severity:'medium'  },
    '19':{name:'Iowa',           cases:280,  delta:'+5%',  severity:'low'     },
    '22':{name:'Louisiana',      cases:410,  delta:'+8%',  severity:'medium'  },
    '24':{name:'Maryland',       cases:480,  delta:'+6%',  severity:'medium'  },
    '25':{name:'Massachusetts',  cases:560,  delta:'+8%',  severity:'medium'  },
    '26':{name:'Michigan',       cases:720,  delta:'+9%',  severity:'medium'  },
    '27':{name:'Minnesota',      cases:440,  delta:'+6%',  severity:'medium'  },
    '29':{name:'Missouri',       cases:510,  delta:'+7%',  severity:'medium'  },
    '34':{name:'New Jersey',     cases:640,  delta:'+9%',  severity:'medium'  },
    '36':{name:'New York',       cases:1640, delta:'+12%', severity:'high'    },
    '37':{name:'North Carolina', cases:890,  delta:'+8%',  severity:'medium'  },
    '39':{name:'Ohio',           cases:880,  delta:'+9%',  severity:'medium'  },
    '42':{name:'Pennsylvania',   cases:920,  delta:'+10%', severity:'high'    },
    '45':{name:'South Carolina', cases:430,  delta:'+7%',  severity:'medium'  },
    '47':{name:'Tennessee',      cases:620,  delta:'+9%',  severity:'medium'  },
    '48':{name:'Texas',          cases:2100, delta:'+13%', severity:'high'    },
    '51':{name:'Virginia',       cases:640,  delta:'+8%',  severity:'medium'  },
    '53':{name:'Washington',     cases:720,  delta:'+9%',  severity:'medium'  },
    '55':{name:'Wisconsin',      cases:490,  delta:'+6%',  severity:'medium'  },
};

const GA_COUNTY_DATA = {
    '13121':{ name:'Fulton',    cases:480, delta:'+38%', severity:'critical',
              complaint:'Off taste / chemical',  product:'Coca‑Cola Spiced 20oz',
              retailer:'Kroger Peachtree St & Publix Midtown',
              distributor:{ name:'Coca-Cola United – Atlanta Metro', contact:'David Mercer', email:'d.mercer@ccunited.com', phone:'(404) 555-0182' },
              bottler:{ name:'CCBCC – Atlanta Plant 3', batch:'ATL-C4-2024', rootCause:'Pasteurization variance, Line 7, Feb 14–17', holdQty:'~1,800 cases in territory' },
              alert:true },
    '13089':{ name:'DeKalb',   cases:312, delta:'+29%', severity:'critical',
              complaint:'Off taste / chemical',  product:'Coca‑Cola Spiced 20oz',
              retailer:'Kroger Decatur & Publix Toco Hills',
              distributor:{ name:'Coca-Cola United – Atlanta Metro', contact:'David Mercer', email:'d.mercer@ccunited.com', phone:'(404) 555-0182' },
              bottler:{ name:'CCBCC – Atlanta Plant 3', batch:'ATL-C4-2024', rootCause:'Pasteurization variance, Line 7, Feb 14–17', holdQty:'~940 cases in territory' },
              alert:true },
    '13135':{ name:'Gwinnett', cases:244, delta:'+24%', severity:'critical',
              complaint:'Off taste / chemical',  product:'Coca‑Cola Spiced 20oz',
              retailer:"Kroger Lawrenceville & Publix Duluth",
              distributor:{ name:'Coca-Cola United – Northeast Atlanta', contact:'Sandra Kim',   email:'s.kim@ccunited.com',    phone:'(770) 555-0314' },
              bottler:{ name:'CCBCC – Atlanta Plant 3', batch:'ATL-C4-2024', rootCause:'Pasteurization variance, Line 7, Feb 14–17', holdQty:'~780 cases in territory' },
              alert:true },
    '13063':{ name:'Clayton',  cases:156, delta:'+21%', severity:'critical',
              complaint:'Off taste / chemical',  product:'Coca‑Cola Spiced 20oz',
              retailer:'Kroger Morrow & Publix Jonesboro',
              distributor:{ name:'Coca-Cola United – South Atlanta', contact:'Marcus Webb',  email:'m.webb@ccunited.com',   phone:'(770) 555-0409' },
              bottler:{ name:'CCBCC – Atlanta Plant 3', batch:'ATL-C4-2024', rootCause:'Pasteurization variance, Line 7, Feb 14–17', holdQty:'~490 cases in territory' },
              alert:true },
    '13067':{ name:'Cobb',     cases:198, delta:'+11%', severity:'medium',
              complaint:'Packaging defect – leaking seal', product:'Sprite Zero 2L',
              retailer:'Walmart Smyrna & Marietta',
              distributor:{ name:'Coca-Cola United – Northwest Atlanta', contact:'Priya Nair',   email:'p.nair@ccunited.com',   phone:'(770) 555-0521' },
              bottler:{ name:'CCBCC – Marietta Plant', batch:'MAR-SP-2024', rootCause:'Seal integrity issue, capping machine recalibrated Feb 20', holdQty:'~320 cases flagged' },
              alert:false },
    '13151':{ name:'Henry',    cases:88,  delta:'+6%',  severity:'low',
              complaint:'Wrong product in multi-pack', product:'Fairlife Chocolate 4-pack',
              retailer:'Kroger McDonough',
              distributor:{ name:'Coca-Cola United – South Atlanta', contact:'Marcus Webb',  email:'m.webb@ccunited.com',   phone:'(770) 555-0409' },
              bottler:{ name:'Fairlife – Chicago',    batch:'CHI-FL-2024', rootCause:'Pick-and-pack error at 3PL, isolated to single SKU', holdQty:'None – resolved at 3PL' },
              alert:false },
    '13117':{ name:'Forsyth',  cases:91,  delta:'+7%',  severity:'low',
              complaint:'Product quality – flat carbonation', product:'Coca‑Cola Classic 2L',
              retailer:"Sam's Club Cumming",
              distributor:{ name:'Coca-Cola United – Northeast Atlanta', contact:'Sandra Kim',   email:'s.kim@ccunited.com',    phone:'(770) 555-0314' },
              bottler:{ name:'CCBCC – Gainesville Plant', batch:'GVL-CC-2024', rootCause:'Under-carbonation on Line 2, corrected Feb 22', holdQty:'~180 cases recalled' },
              alert:false },
    '13057':{ name:'Cherokee', cases:65,  delta:'+4%',  severity:'low',
              complaint:'Packaging defect', product:'Dasani 24-pack',
              retailer:'Costco Canton',
              distributor:{ name:'Coca-Cola United – Northwest Atlanta', contact:'Priya Nair',   email:'p.nair@ccunited.com',   phone:'(770) 555-0521' },
              bottler:{ name:'CCBCC – Marietta Plant', batch:'MAR-DAS-2024', rootCause:'Label adhesion failure in cold storage', holdQty:'None' },
              alert:false },
};

const SEVERITY_COLOR = {
    critical: { fill:'#fca5a5', stroke:'#ef4444', pin:'#dc2626' },
    high:     { fill:'#fed7aa', stroke:'#f97316', pin:'#ea580c' },
    medium:   { fill:'#fde68a', stroke:'#f59e0b', pin:'#d97706' },
    low:      { fill:'#dbeafe', stroke:'#93c5fd', pin:'#3b82f6' },
    none:     { fill:'#e8eef4', stroke:'#cbd5e1', pin:'#94a3b8' },
};

function heatColor(severity) {
    return SEVERITY_COLOR[severity] || SEVERITY_COLOR.none;
}

const PRODUCT_OPTIONS = [
    {label:'All Products',       value:''},
    {label:'Coca‑Cola Spiced',   value:'spiced'},
    {label:'Fairlife Chocolate', value:'fairlife'},
    {label:'Sprite Zero',        value:'sprite'},
    {label:'Dasani',             value:'dasani'},
    {label:'Coca‑Cola Classic',  value:'classic'},
];
const COMPLAINT_OPTIONS = [
    {label:'All Complaint Types',     value:''},
    {label:'Off Taste / Chemical',    value:'taste'},
    {label:'Packaging Defect',        value:'packaging'},
    {label:'Wrong Product',           value:'wrong'},
    {label:'Flat Carbonation',        value:'flat'},
];
const SEVERITY_OPTIONS = [
    {label:'All Severity Levels', value:''},
    {label:'Critical',            value:'critical'},
    {label:'High',                value:'high'},
    {label:'Medium',              value:'medium'},
    {label:'Low',                 value:'low'},
];

// ─────────────────────────────────────────────────────────────────────────────

export default class GlobalCaseMap extends LightningElement {

    @track view              = 'world';
    @track selected          = null;
    @track filterProduct     = '';
    @track filterComplaint   = '';
    @track filterSeverity    = '';
    @track activeTab         = 'chain';   // 'chain' | 'actions' | 'trend'
    @track agentState        = 'idle';    // 'idle' | 'running' | 'done'
    @track agentStepsDone    = 0;

    _world      = null;
    _usStates   = null;
    _usCounties = null;
    _svg        = null;
    _g          = null;
    _zoom       = null;
    _width      = 960;
    _height     = 520;

    // ── computed ──────────────────────────────────────────────────────────────

    get isWorld()      { return this.view === 'world';   }
    get isUsa()        { return this.view === 'usa';     }
    get isGeorgia()    { return this.view === 'georgia'; }
    get canDrillBack() { return this.view !== 'world';   }
    get showPanel()    { return !!this.selected;         }

    get breadcrumb() {
        if (this.view === 'georgia') return 'World  ›  United States  ›  Georgia';
        if (this.view === 'usa')     return 'World  ›  United States';
        return 'World';
    }

    get statTotal() {
        if (this.view === 'georgia') return Object.values(GA_COUNTY_DATA).reduce((s,c)=>s+c.cases,0).toLocaleString();
        if (this.view === 'usa')     return Object.values(STATE_DATA).reduce((s,c)=>s+c.cases,0).toLocaleString();
        return Object.values(WORLD_DATA).reduce((s,v)=>s+v.cases,0).toLocaleString();
    }
    get statCritical() {
        if (this.view === 'georgia') return Object.values(GA_COUNTY_DATA).filter(c=>c.severity==='critical').length;
        if (this.view === 'usa')     return Object.values(STATE_DATA).filter(s=>s.severity==='critical').length;
        return Object.values(WORLD_DATA).filter(v=>v.severity==='critical').length;
    }
    get statScope() {
        if (this.view === 'georgia') return 'Georgia';
        if (this.view === 'usa')     return 'United States';
        return 'Global';
    }

    get productOptions()   { return PRODUCT_OPTIONS;   }
    get complaintOptions() { return COMPLAINT_OPTIONS; }
    get severityOptions()  { return SEVERITY_OPTIONS;  }

    // Panel tabs
    get tabChainClass()   { return this.activeTab === 'chain'   ? 'tab tab--active' : 'tab'; }
    get tabActionsClass() { return this.activeTab === 'actions' ? 'tab tab--active' : 'tab'; }
    get tabTrendClass()   { return this.activeTab === 'trend'   ? 'tab tab--active' : 'tab'; }
    get showChain()       { return this.activeTab === 'chain';   }
    get showActions()     { return this.activeTab === 'actions'; }
    get showTrend()       { return this.activeTab === 'trend';   }

    get hasActions()      { return this.selected && this.selected.actions && this.selected.actions.length; }
    get hasBottler()      { return this.selected && this.selected.bottler; }
    get hasDistributor()  { return this.selected && this.selected.distributor; }

    get showAgentButton() { return this.selected && this.selected.alert && this.agentState !== 'done'; }
    get showAgentResult() { return this.agentState === 'done'; }
    get agentRunning()    { return this.agentState === 'running'; }

    get agentStep1Class() { return this.agentStepsDone >= 1 ? 'agent-step agent-step--done' : (this.agentState === 'running' && this.agentStepsDone === 0 ? 'agent-step agent-step--active' : 'agent-step'); }
    get agentStep2Class() { return this.agentStepsDone >= 2 ? 'agent-step agent-step--done' : (this.agentState === 'running' && this.agentStepsDone === 1 ? 'agent-step agent-step--active' : 'agent-step'); }
    get agentStep3Class() { return this.agentStepsDone >= 3 ? 'agent-step agent-step--done' : (this.agentState === 'running' && this.agentStepsDone === 2 ? 'agent-step agent-step--active' : 'agent-step'); }

    get agentDistributor() { return this.selected && this.selected.distributor ? this.selected.distributor.contact : 'Distributor contact'; }
    get agentRetailer()    { return this.selected ? this.selected.retailer : ''; }

    // ── lifecycle ─────────────────────────────────────────────────────────────

    connectedCallback() {
        Promise.all([
            loadScript(this, D3_MIN),
            loadScript(this, TOPOJSON),
            fetch(WORLD).then(r => r.json()),
            fetch(US_STATES).then(r => r.json()),
            fetch(US_COUNTIES).then(r => r.json()),
        ]).then(([,,world, usStates, usCounties]) => {
            this._world      = world;
            this._usStates   = usStates;
            this._usCounties = usCounties;
            this._buildSvg();
            this._drawWorld();
        }).catch(err => console.error('Map error:', err));
    }

    renderedCallback() {
        if (this.selected && this.activeTab === 'trend') this._drawSparkline();
    }

    // ── SVG scaffold ──────────────────────────────────────────────────────────

    _buildSvg() {
        /* eslint-disable no-undef */
        const container = this.refs.mapContainer;
        if (!container) return;
        this._width  = container.clientWidth  || 960;
        this._height = container.clientHeight || 520;
        const W = this._width, H = this._height;

        const svg = d3.select(container).append('svg')
            .attr('width','100%').attr('height','100%')
            .attr('viewBox',`0 0 ${W} ${H}`)
            .style('background','#f8fafc');
        this._svg = svg;

        // Legend
        const defs = svg.append('defs');
        const lg = defs.append('linearGradient').attr('id','leg').attr('x1','0%').attr('x2','100%');
        [['0%','#dbeafe'],['33%','#fde68a'],['66%','#fed7aa'],['100%','#fca5a5']].forEach(([o,c]) =>
            lg.append('stop').attr('offset',o).attr('stop-color',c));

        const legG = svg.append('g').attr('transform',`translate(16,${H-40})`);
        legG.append('text').attr('y',-4).attr('font-size',9).attr('fill','#94a3b8')
            .attr('font-family','sans-serif').text('SEVERITY');
        legG.append('rect').attr('width',160).attr('height',7).attr('rx',3.5).attr('fill','url(#leg)').attr('opacity',0.9);
        [['Low','#3b82f6'],['Medium','#d97706'],['High','#ea580c'],['Critical','#dc2626']].forEach(([lbl,col],i) => {
            legG.append('circle').attr('cx', i*40+4).attr('cy',20).attr('r',4).attr('fill',col);
            legG.append('text').attr('x',i*40+11).attr('y',24).attr('font-size',8.5)
                .attr('fill','#64748b').attr('font-family','sans-serif').text(lbl);
        });

        const g = svg.append('g');
        this._g = g;
        const zoom = d3.zoom().scaleExtent([0.5,20])
            .on('zoom', ({transform}) => g.attr('transform', transform));
        svg.call(zoom);
        this._zoom = zoom;
        /* eslint-enable no-undef */
    }

    // ── World ─────────────────────────────────────────────────────────────────

    _drawWorld() {
        /* eslint-disable no-undef */
        this._clearMap(); this.view = 'world'; this.selected = null;
        const W = this._width, H = this._height;
        const proj = d3.geoNaturalEarth1().scale(W/6.4).translate([W/2,H/2]);
        const path = d3.geoPath().projection(proj);
        const self = this;

        this._g.append('path').datum(d3.geoGraticule()()).attr('d',path)
            .attr('fill','none').attr('stroke','#e2e8f0').attr('stroke-width',0.3);

        const countries = topojson.feature(this._world, this._world.objects.countries);

        this._g.selectAll('.country').data(countries.features).enter().append('path')
            .attr('class','country').attr('d',path)
            .attr('fill', d => {
                const v = WORLD_DATA[+d.id];
                return v ? heatColor(v.severity).fill : '#f1f5f9';
            })
            .attr('stroke', d => {
                const v = WORLD_DATA[+d.id];
                return v ? heatColor(v.severity).stroke : '#e2e8f0';
            })
            .attr('stroke-width',0.6)
            .style('cursor', d => WORLD_DATA[+d.id] ? 'pointer' : 'default')
            .on('mouseover', function(e,d) {
                if (!WORLD_DATA[+d.id]) return;
                d3.select(this).attr('stroke-width',1.8);
            })
            .on('mouseout', function() { d3.select(this).attr('stroke-width',0.6); })
            .on('click', (e,d) => {
                const id = +d.id;
                if (id === 840) { self._drillUsa(); return; }
                const v = WORLD_DATA[id];
                if (!v) return;
                self.selected = self._worldRegionData(id, v);
                self.activeTab = 'chain';
            });

        this._g.append('path')
            .datum(topojson.mesh(this._world, this._world.objects.countries, (a,b)=>a!==b))
            .attr('d',path).attr('fill','none').attr('stroke','#e2e8f0').attr('stroke-width',0.3);

        this._resetZoom();
        /* eslint-enable no-undef */
    }

    _worldRegionData(id, v) {
        const names = {840:'United States',76:'Brazil',356:'India',156:'China',276:'Germany',826:'United Kingdom',484:'Mexico',392:'Japan',36:'Australia',170:'Colombia',710:'South Africa',124:'Canada',250:'France',380:'Italy',724:'Spain',643:'Russia',586:'Pakistan',818:'Egypt',566:'Nigeria',504:'Morocco',32:'Argentina',152:'Chile',604:'Peru',288:'Ghana'};
        return {
            type:'world', name: names[id]||'Region',
            cases: v.cases.toLocaleString(), delta: v.delta, severity: v.severity,
            complaint: 'Product Quality', product: 'Various Sparkling',
            retailer: 'Multiple retail chains',
            distributor: { name:'Regional Distributor', contact:'Regional Manager', email:'regional@coca-cola.com', phone:'Contact via regional office' },
            bottler: { name:'Regional Bottler', batch:'Multiple batches', rootCause:'Under investigation', holdQty:'TBD' },
            actions: [{ priority:'Review', label:'Pull regional case data and segment by SKU', owner:'Global Care Analytics', status:'open' }],
            trend: this._mockTrend(v.cases),
        };
    }

    // ── USA states ────────────────────────────────────────────────────────────

    _drillUsa() {
        /* eslint-disable no-undef */
        this._clearMap(); this.view = 'usa'; this.selected = null;
        const W = this._width, H = this._height;
        const proj = d3.geoAlbersUsa().scale(W*1.22).translate([W/2,H/2]);
        const path = d3.geoPath().projection(proj);
        const states = topojson.feature(this._usStates, this._usStates.objects.states);
        const self = this;

        this._g.selectAll('.state').data(states.features).enter().append('path')
            .attr('class','state').attr('d',path)
            .attr('fill', d => {
                const s = STATE_DATA[String(d.id).padStart(2,'0')];
                return s ? heatColor(s.severity).fill : '#f1f5f9';
            })
            .attr('stroke', d => {
                const s = STATE_DATA[String(d.id).padStart(2,'0')];
                return s ? heatColor(s.severity).stroke : '#e2e8f0';
            })
            .attr('stroke-width',0.8)
            .style('cursor','pointer')
            .on('mouseover', function() { d3.select(this).attr('stroke-width',2); })
            .on('mouseout',  function() { d3.select(this).attr('stroke-width',0.8); })
            .on('click', (e,d) => {
                const fips = String(d.id).padStart(2,'0');
                const s = STATE_DATA[fips];
                if (!s) return;
                if (fips === '13') { self._drillGeorgia(); return; }
                self.selected = { type:'state', name:s.name, cases:s.cases.toLocaleString(),
                    delta:s.delta, severity:s.severity, complaint:'Product Quality',
                    product:'Various', retailer:'Multiple retail chains',
                    distributor:{ name:'Regional Distributor', contact:'Area Manager', email:'area@coca-cola.com', phone:'Contact via region' },
                    bottler:{ name:'Regional Bottler', batch:'Multiple batches', rootCause:'Under review', holdQty:'TBD' },
                    actions:[{ priority:'Review', label:'Segment cases by SKU and bottler', owner:'Care Analytics', status:'open' }],
                    trend:self._mockTrend(s.cases) };
                self.activeTab = 'chain';
            });

        this._g.append('path')
            .datum(topojson.mesh(this._usStates, this._usStates.objects.states, (a,b)=>a!==b))
            .attr('d',path).attr('fill','none').attr('stroke','#cbd5e1').attr('stroke-width',0.6);

        // Georgia critical pulse
        const gaFeature = states.features.find(f => String(f.id).padStart(2,'0') === '13');
        if (gaFeature) {
            const [cx,cy] = path.centroid(gaFeature);
            if (!isNaN(cx)) {
                this._g.append('circle').attr('cx',cx).attr('cy',cy).attr('r',8)
                    .attr('fill','none').attr('stroke','#dc2626').attr('stroke-width',1.5)
                    .call(el => { function r() { el.attr('r',7).attr('opacity',0.9).transition().duration(1500).ease(d3.easeCubicOut).attr('r',24).attr('opacity',0).on('end',r); } r(); });
                this._g.append('circle').attr('cx',cx).attr('cy',cy).attr('r',6)
                    .attr('fill','#dc2626').attr('stroke','#fff').attr('stroke-width',1.5)
                    .style('cursor','pointer').on('click',()=>self._drillGeorgia());
            }
        }

        this._resetZoom();
        /* eslint-enable no-undef */
    }

    // ── Georgia counties ──────────────────────────────────────────────────────

    _drillGeorgia() {
        /* eslint-disable no-undef */
        this._clearMap(); this.view = 'georgia'; this.selected = null;
        const W = this._width, H = this._height;

        const allCounties = topojson.feature(this._usCounties, this._usCounties.objects.counties);
        const gaFeatures  = allCounties.features.filter(f => Math.floor(f.id/1000) === 13);
        const gaGeoJSON   = { type:'FeatureCollection', features: gaFeatures };

        const proj = d3.geoIdentity().reflectY(true).fitExtent([[28,16],[W-20,H-28]], gaGeoJSON);
        const path = d3.geoPath().projection(proj);
        const self = this;

        // County fills
        this._g.selectAll('.county').data(gaFeatures).enter().append('path')
            .attr('class','county').attr('d',path)
            .attr('fill', d => {
                const c = GA_COUNTY_DATA[String(d.id).padStart(5,'0')];
                return c ? heatColor(c.severity).fill : '#f1f5f9';
            })
            .attr('stroke', d => {
                const c = GA_COUNTY_DATA[String(d.id).padStart(5,'0')];
                return c ? heatColor(c.severity).stroke : '#e2e8f0';
            })
            .attr('stroke-width',0.6)
            .style('cursor', d => GA_COUNTY_DATA[String(d.id).padStart(5,'0')] ? 'pointer' : 'default')
            .on('mouseover', function(e,d) {
                if (!GA_COUNTY_DATA[String(d.id).padStart(5,'0')]) return;
                d3.select(this).attr('stroke-width',1.8);
            })
            .on('mouseout', function() { d3.select(this).attr('stroke-width',0.6); })
            .on('click', (e,d) => {
                const fips = String(d.id).padStart(5,'0');
                const c = GA_COUNTY_DATA[fips];
                if (!c) return;
                self.selected = {
                    type:'county', name:c.name + ' County, GA',
                    cases:c.cases.toLocaleString(), delta:c.delta, severity:c.severity,
                    alert:c.alert,
                    alertSummary: c.alert ? `${c.complaint} — ${c.product}` : null,
                    complaint:c.complaint, product:c.product, retailer:c.retailer,
                    distributor:c.distributor, bottler:c.bottler,
                    actions: c.alert ? GA_COUNTY_DATA['13121'].alert && GA_COUNTY_DATA['13121'] === c
                        ? STATE_DATA['13'].actions
                        : [
                            { priority:'Immediate', label:'Confirm batch ATL-C4-2024 hold in territory', owner:c.distributor.contact + ' – ' + c.distributor.name, status:'open' },
                            { priority:'24 hrs',    label:'Notify ' + c.retailer.split('&')[0].trim() + ' store managers', owner:c.distributor.contact, status:'open' },
                            { priority:'48 hrs',    label:'Consumer advisory for affected lot codes',    owner:'Global Care Ops', status:'open' },
                          ]
                        : [],
                    trend: self._mockTrend(c.cases),
                };
                self.activeTab = 'chain';
                self.agentState = 'idle'; self.agentStepsDone = 0;
            });

        // Alert pins on critical counties
        gaFeatures.forEach(f => {
            const fips = String(f.id).padStart(5,'0');
            const c = GA_COUNTY_DATA[fips];
            if (!c || !c.alert) return;
            const centroid = path.centroid(f);
            if (!centroid || isNaN(centroid[0])) return;
            const [cx,cy] = centroid;

            this._g.append('circle').attr('cx',cx).attr('cy',cy).attr('r',5)
                .attr('fill','none').attr('stroke','#dc2626').attr('stroke-width',1.2)
                .call(el => { function r() { el.attr('r',4).attr('opacity',0.85).transition().duration(1300).ease(d3.easeCubicOut).attr('r',14).attr('opacity',0).on('end',r); } r(); });
            this._g.append('circle').attr('cx',cx).attr('cy',cy).attr('r',5)
                .attr('fill','#dc2626').attr('stroke','#fff').attr('stroke-width',1.5)
                .style('cursor','pointer')
                .on('click', () => {
                    self.selected = {
                        type:'county', name:c.name + ' County, GA',
                        cases:c.cases.toLocaleString(), delta:c.delta, severity:c.severity,
                        alert:true, alertSummary:`${c.complaint} — ${c.product}`,
                        complaint:c.complaint, product:c.product, retailer:c.retailer,
                        distributor:c.distributor, bottler:c.bottler,
                        actions:[
                            { priority:'Immediate', label:'Confirm batch ATL-C4-2024 hold in territory', owner:c.distributor.contact, status:'open' },
                            { priority:'24 hrs',    label:'Notify ' + c.retailer.split('&')[0].trim() + ' store managers', owner:c.distributor.contact, status:'open' },
                            { priority:'48 hrs',    label:'Issue consumer advisory for affected lot codes', owner:'Global Care Ops', status:'open' },
                        ],
                        trend: self._mockTrend(c.cases),
                    };
                    self.activeTab = 'chain';
                });
        });

        this._resetZoom();
        /* eslint-enable no-undef */
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    _clearMap() { if (this._g) this._g.selectAll('*').remove(); }

    _resetZoom() {
        /* eslint-disable no-undef */
        this._svg.transition().duration(360).call(this._zoom.transform, d3.zoomIdentity);
        /* eslint-enable no-undef */
    }

    _mockTrend(peak) {
        const base = Math.floor(peak * 0.52);
        return Array.from({length:8}, (_,i) =>
            Math.round(base + (peak-base) * (i/7) * (0.65 + i*0.05))
        );
    }

    _drawSparkline() {
        const el = this.refs.sparkline;
        if (!el || !this.selected) return;
        /* eslint-disable no-undef */
        const data = this.selected.trend;
        const W=240, H=64, p=4;
        const xs = d3.scaleLinear().domain([0,data.length-1]).range([p,W-p]);
        const ys = d3.scaleLinear().domain([d3.min(data),d3.max(data)]).range([H-p,p]);
        const line = d3.line().x((_,i)=>xs(i)).y(d=>ys(d)).curve(d3.curveCatmullRom);
        const area = d3.area().x((_,i)=>xs(i)).y0(H).y1(d=>ys(d)).curve(d3.curveCatmullRom);

        const svg = d3.select(el);
        svg.selectAll('*').remove();

        const defs = svg.append('defs');
        const gr = defs.append('linearGradient').attr('id','tg').attr('gradientUnits','userSpaceOnUse').attr('x1',0).attr('y1',0).attr('x2',0).attr('y2',H);
        gr.append('stop').attr('offset','0%').attr('stop-color','#dc2626').attr('stop-opacity',0.15);
        gr.append('stop').attr('offset','100%').attr('stop-color','#dc2626').attr('stop-opacity',0);

        // X-axis week labels
        const weeks = ['8w','7w','6w','5w','4w','3w','2w','1w'];
        weeks.forEach((w,i) => {
            svg.append('text').attr('x',xs(i)).attr('y',H+12).attr('font-size',8)
                .attr('fill','#cbd5e1').attr('text-anchor','middle').attr('font-family','sans-serif').text(w);
        });

        svg.append('path').datum(data).attr('d',area).attr('fill','url(#tg)');
        svg.append('path').datum(data).attr('d',line).attr('fill','none')
            .attr('stroke','#dc2626').attr('stroke-width',2);
        svg.selectAll('c').data(data).enter().append('circle')
            .attr('cx',(_,i)=>xs(i)).attr('cy',d=>ys(d)).attr('r',2.5)
            .attr('fill','#dc2626').attr('stroke','#fff').attr('stroke-width',1);
        /* eslint-enable no-undef */
    }

    // ── event handlers ────────────────────────────────────────────────────────

    handleBack() {
        if (this.view === 'georgia') { this._drillUsa();  return; }
        if (this.view === 'usa')     { this._drawWorld(); return; }
    }

    handleZoomIn()    { /* eslint-disable no-undef */ this._svg.transition().duration(260).call(this._zoom.scaleBy, 1.7); /* eslint-enable no-undef */ }
    handleZoomOut()   { /* eslint-disable no-undef */ this._svg.transition().duration(260).call(this._zoom.scaleBy, 0.6); /* eslint-enable no-undef */ }
    handleResetZoom() { this._resetZoom(); }

    handleFilterProduct(e)   { this.filterProduct   = e.detail.value; }
    handleFilterComplaint(e) { this.filterComplaint = e.detail.value; }
    handleFilterSeverity(e)  { this.filterSeverity  = e.detail.value; }

    clearSelection()     { this.selected = null; this.agentState = 'idle'; this.agentStepsDone = 0; }
    handleDrillUsa()     { this._drillUsa();     }
    handleDrillGeorgia() { this._drillGeorgia(); }

    handleTabChain()   { this.activeTab = 'chain';   }
    handleTabActions() { this.activeTab = 'actions'; }
    handleTabTrend()   { this.activeTab = 'trend';   }

    handleLaunchAgent() {
        if (this.agentState !== 'idle') return;
        this.agentState = 'running';
        this.agentStepsDone = 0;
        // Step 1: Draft distributor email (1.2s)
        setTimeout(() => { this.agentStepsDone = 1; }, 1200);
        // Step 2: Create Salesforce tasks (2.6s)
        setTimeout(() => { this.agentStepsDone = 2; }, 2600);
        // Step 3: Queue consumer advisory (3.8s)
        setTimeout(() => { this.agentStepsDone = 3; }, 3800);
        // Done (4.6s)
        setTimeout(() => { this.agentState = 'done'; }, 4600);
    }

    handleAgentReset() {
        this.agentState = 'idle';
        this.agentStepsDone = 0;
    }
}
