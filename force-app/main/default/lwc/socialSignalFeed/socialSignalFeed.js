import { LightningElement, track } from 'lwc';

// ─── Mock signal data ──────────────────────────────────────────────────────────
// resolution: 'matched' | 'new-profile' | 'pending'

const SEED_SIGNALS = [
    {
        id: 's001', platform: 'reddit', handle: 'u/nutrition_nerd_atl',
        text: 'Has anyone else noticed Coca-Cola Spiced tastes metallic lately? Bought it at Kroger on Peachtree last week. Threw the whole 6-pack out.',
        timestamp: '16 days ago', product: 'Coca-Cola Spiced 20oz', retailer: 'Kroger Peachtree St',
        batch: 'ATL-C4-2024', resolution: 'matched',
        profile: {
            id: 'LC-00291847', name: 'Aisha M.', loyaltyTier: 'Gold',
            purchases: 42, batchOverlap: true,
            outreach: 'Proactive SMS sent 14 days ago · Replacement coupon redeemed',
            callRecord: 'fairlifeCallFlow case linked — Case #00341892',
        },
    },
    {
        id: 's002', platform: 'x', handle: '@cokeaddict_404',
        text: 'whoever approved the new coke spiced formula made a mistake. chemical aftertaste is disgusting. @CocaCola please fix this',
        timestamp: '15 days ago', product: 'Coca-Cola Spiced 20oz', retailer: 'Publix Midtown',
        batch: 'ATL-C4-2024', resolution: 'matched',
        profile: {
            id: 'LC-00198234', name: 'Jordan T.', loyaltyTier: 'Silver',
            purchases: 18, batchOverlap: true,
            outreach: 'Proactive email sent 13 days ago · Link clicked, coupon pending',
            callRecord: null,
        },
    },
    {
        id: 's003', platform: 'instagram', handle: '@healthyeatsatl',
        text: 'Not sure if it\'s just me but the Coke Spiced I grabbed at Kroger tastes off this week? Like a weird chemical thing. Anyone else?',
        timestamp: '14 days ago', product: 'Coca-Cola Spiced 20oz', retailer: 'Kroger Decatur',
        batch: 'ATL-C4-2024', resolution: 'new-profile',
        profile: {
            id: 'DC-00918423', name: 'Anonymous → Samira K.', loyaltyTier: 'New',
            purchases: null, batchOverlap: true,
            outreach: 'Agentforce DM sent · Consent form completed · Profile created',
            callRecord: null,
        },
    },
    {
        id: 's004', platform: 'google', handle: 'Local Guide · 47 reviews',
        text: '★★☆☆☆ — Coca-Cola Spiced tastes completely different from the last time I bought it. Chemical smell. Returning to the store.',
        timestamp: '13 days ago', product: 'Coca-Cola Spiced 20oz', retailer: 'Publix Toco Hills',
        batch: 'ATL-C4-2024', resolution: 'matched',
        profile: {
            id: 'LC-00441029', name: 'Marcus B.', loyaltyTier: 'Gold',
            purchases: 67, batchOverlap: true,
            outreach: 'Proactive email sent · Loyalty points credited · No call',
            callRecord: null,
        },
    },
    {
        id: 's005', platform: 'reddit', handle: 'u/ATLfoodie2024',
        text: 'r/Atlanta — bought Coke Spiced at the Kroger in Lawrenceville and it has a really strong chemical smell. Is there a recall happening?',
        timestamp: '12 days ago', product: 'Coca-Cola Spiced 20oz', retailer: 'Kroger Lawrenceville',
        batch: 'ATL-C4-2024', resolution: 'new-profile',
        profile: {
            id: 'DC-00921847', name: 'Anonymous → Chris P.', loyaltyTier: 'New',
            purchases: null, batchOverlap: true,
            outreach: 'Agentforce comment reply sent · Consent form clicked, not yet completed',
            callRecord: null,
        },
    },
    {
        id: 's006', platform: 'x', handle: '@spiced_skeptic',
        text: 'Three different people at my office all said the same thing about Coke Spiced this week. Something is definitely wrong with a batch.',
        timestamp: '11 days ago', product: 'Coca-Cola Spiced 20oz', retailer: 'Unknown',
        batch: 'ATL-C4-2024', resolution: 'pending',
        profile: null,
    },
    {
        id: 's007', platform: 'instagram', handle: '@fitlife_gwinnett',
        text: 'Returned my Coca-Cola Spiced to the Publix in Duluth. The manager said they\'ve had a bunch of returns this week for the same thing.',
        timestamp: '10 days ago', product: 'Coca-Cola Spiced 20oz', retailer: 'Publix Duluth',
        batch: 'ATL-C4-2024', resolution: 'matched',
        profile: {
            id: 'LC-00302918', name: 'Priya S.', loyaltyTier: 'Platinum',
            purchases: 112, batchOverlap: true,
            outreach: 'Priority outreach via app push · $10 credit applied · VoC survey sent',
            callRecord: null,
        },
    },
];

const LIVE_SIGNAL = {
    id: 's008', platform: 'reddit', handle: 'u/coke_daily_atl',
    text: 'Just bought Coke Spiced from the Kroger in Morrow and it has the same weird taste people have been posting about. Lot code on the bottom says 24046. What\'s going on?',
    timestamp: 'Just now', product: 'Coca-Cola Spiced 20oz', retailer: 'Kroger Morrow',
    batch: 'ATL-C4-2024', resolution: 'pending',
    profile: null,
};

const PLATFORM_LABEL = { reddit:'Reddit', x:'X (Twitter)', instagram:'Instagram', google:'Google Reviews' };
const PLATFORM_COLOR = { reddit:'#ff4500', x:'#000', instagram:'#e1306c', google:'#4285f4' };

export default class SocialSignalFeed extends LightningElement {

    @track signals        = [...SEED_SIGNALS];
    @track selectedId     = 's001';
    @track simulateState  = 'idle';  // 'idle' | 'running' | 'matched' | 'new-profile'
    @track simulateStep   = 0;

    // ── computed ──────────────────────────────────────────────────────────────

    get statTotal()    { return this.signals.length; }
    get statMatched()  { return this.signals.filter(s => s.resolution === 'matched').length; }
    get statNew()      { return this.signals.filter(s => s.resolution === 'new-profile').length; }
    get statDeflected(){ return this.signals.filter(s => s.resolution !== 'pending').length; }

    get enrichedSignals() {
        return this.signals.map(s => ({
            ...s,
            platformLabel: PLATFORM_LABEL[s.platform] || s.platform,
            isMatched:    s.resolution === 'matched',
            isNew:        s.resolution === 'new-profile',
            isPending:    s.resolution === 'pending',
            resolutionLabel: s.resolution === 'matched' ? 'Matched' :
                             s.resolution === 'new-profile' ? 'New profile' : 'Pending',
            isSelected: s.id === this.selectedId,
            itemClass: `signal-item signal-item--${s.resolution}${s.id === this.selectedId ? ' signal-item--active' : ''}`,
        }));
    }

    get selected() {
        return this.enrichedSignals.find(s => s.id === this.selectedId) || null;
    }

    get showMatchedPanel()    { return this.selected && this.selected.isMatched; }
    get showNewProfilePanel() { return this.selected && this.selected.isNew; }
    get showPendingPanel()    { return this.selected && this.selected.isPending; }
    get showProfileLinked()   { return this.selected && this.selected.profile && this.selected.profile.callRecord; }

    get canSimulate()         { return this.simulateState === 'idle'; }
    get simRunning()          { return this.simulateState === 'running'; }
    get simDone()             { return this.simulateState === 'matched' || this.simulateState === 'new-profile'; }

    get simStep1Class() { return this.simulateStep >= 1 ? 'sim-step sim-step--done' : (this.simulateStep === 0 && this.simRunning ? 'sim-step sim-step--active' : 'sim-step'); }
    get simStep2Class() { return this.simulateStep >= 2 ? 'sim-step sim-step--done' : (this.simulateStep === 1 && this.simRunning ? 'sim-step sim-step--active' : 'sim-step'); }
    get simStep3Class() { return this.simulateStep >= 3 ? 'sim-step sim-step--done' : (this.simulateStep === 2 && this.simRunning ? 'sim-step sim-step--active' : 'sim-step'); }

    // ── handlers ──────────────────────────────────────────────────────────────

    handleSelectSignal(e) {
        this.selectedId = e.currentTarget.dataset.id;
    }

    handleSimulate() {
        if (!this.canSimulate) return;

        // Add pending signal to top of feed
        this.signals = [{ ...LIVE_SIGNAL }, ...this.signals];
        this.selectedId = LIVE_SIGNAL.id;
        this.simulateState = 'running';
        this.simulateStep = 0;

        setTimeout(() => { this.simulateStep = 1; }, 900);   // scanning social
        setTimeout(() => { this.simulateStep = 2; }, 2000);  // querying Data Cloud
        setTimeout(() => { this.simulateStep = 3; }, 3200);  // match found

        setTimeout(() => {
            // Resolve as matched (Kroger Morrow = Clayton county, Marcus Webb territory)
            this.simulateState = 'matched';
            this.signals = this.signals.map(s => s.id === LIVE_SIGNAL.id ? {
                ...s,
                resolution: 'matched',
                profile: {
                    id: 'LC-00512039', name: 'Devon R.', loyaltyTier: 'Silver',
                    purchases: 24, batchOverlap: true,
                    outreach: 'Agentforce proactive SMS drafting now — batch ATL-C4-2024 hold advisory',
                    callRecord: null,
                },
            } : s);
        }, 4200);
    }

    handleSimulateReset() {
        this.signals = [...SEED_SIGNALS];
        this.selectedId = 's001';
        this.simulateState = 'idle';
        this.simulateStep = 0;
    }
}
