import { LightningElement, track, api } from 'lwc';
import saveFairlifeCallData from '@salesforce/apex/FairlifeCallController.saveFairlifeCallData';
import fairlifeBottle from '@salesforce/resourceUrl/fairlife_chocolate';

export default class FairlifeCallFlow extends LightningElement {
    @api recordId; // Case record Id when dropped on Case page layout / console tab

    @track currentStep = 1;
    totalSteps = 5;
    isSubmitting = false;
    submitError = null;
    caseNumber = '';

    // Step 1
    @track tasteDescription = '';

    // Step 2 — product details
    @track productVariant = '';
    @track productSize = '';
    @track bestByDate = '';
    @track lotCode = '';
    @track upcCode = '';

    // Step 3 — purchase & storage
    @track purchaseChannel = '';
    @track retailerName = '';
    @track purchaseLocation = '';
    @track wasColdAtPurchase = '';
    @track storedCorrectly = '';

    // Step 4 — usage & consumer profile
    @track customerTenure = '';
    @track purchaseFrequency = '';
    @track useOccasion = '';
    @track discoveryChannel = '';
    @track retentionLikelihood = '';

    // Step 5
    @track resolution = '';
    @track agentNotes = '';

    // ─── static resource ──────────────────────────────────────────────────────
    get bottleImgSrc() { return fairlifeBottle; }

    // ─── computed step flags ───────────────────────────────────────────────────
    get isStep1() { return this.currentStep === 1; }
    get isStep2() { return this.currentStep === 2; }
    get isStep3() { return this.currentStep === 3; }
    get isStep4() { return this.currentStep === 4; }
    get isStep5() { return this.currentStep === 5; }
    get isStep6() { return this.currentStep === 6; }

    get progressStyle() {
        const pct = Math.min((this.currentStep - 1) / this.totalSteps * 100, 100);
        return `width: ${pct}%`;
    }

    get resolutionLabel() {
        const map = { coupon: 'Replacement Coupon', refund: 'Refund', both: 'Coupon + Apology Kit' };
        return map[this.resolution] || 'Not selected';
    }

    // ─── picklist options ──────────────────────────────────────────────────────
    get channelOptions() {
        return [
            { label: 'Grocery – in store', value: 'grocery_instore' },
            { label: 'Grocery – pickup / delivery', value: 'grocery_delivery' },
            { label: 'Mass retail (Walmart, Costco)', value: 'mass_retail' },
            { label: 'Online (Amazon.ca)', value: 'online' },
            { label: 'Pharmacy / drug store', value: 'pharmacy' },
            { label: 'Gym / specialty nutrition', value: 'gym_specialty' },
            { label: 'Convenience store', value: 'convenience' },
            { label: 'Other / unsure', value: 'other' },
        ];
    }

    get yesNoOptions() {
        return [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
            { label: 'Unsure', value: 'unsure' },
        ];
    }

    get tenureOptions() {
        return [
            { label: 'First-time purchase', value: 'first_time' },
            { label: 'Less than 6 months', value: 'lt_6mo' },
            { label: '6–12 months', value: '6_12mo' },
            { label: '1–2 years', value: '1_2yr' },
            { label: '2+ years (loyal)', value: 'loyal' },
        ];
    }

    get frequencyOptions() {
        return [
            { label: 'Daily', value: 'daily' },
            { label: 'Several times a week', value: 'several_week' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Bi-weekly', value: 'biweekly' },
            { label: 'Monthly or less', value: 'monthly' },
        ];
    }

    get occasionOptions() {
        return [
            { label: 'Post-workout / fitness recovery', value: 'post_workout' },
            { label: 'Meal replacement', value: 'meal_replacement' },
            { label: 'On-the-go snack', value: 'snack' },
            { label: 'Morning routine', value: 'morning' },
            { label: 'High-protein diet / nutrition plan', value: 'nutrition_plan' },
            { label: 'General everyday drink', value: 'everyday' },
        ];
    }

    get discoveryOptions() {
        return [
            { label: 'Social media (Instagram, TikTok, etc.)', value: 'social' },
            { label: 'Friend / family recommendation', value: 'referral' },
            { label: 'In-store display / promotion', value: 'instore_promo' },
            { label: 'Gym or trainer recommendation', value: 'gym' },
            { label: 'Online search', value: 'search' },
            { label: 'TV / streaming ad', value: 'tv_ad' },
            { label: "Don't remember", value: 'unknown' },
        ];
    }

    get retentionOptions() {
        return [
            { label: 'Definitely yes', value: 'definitely' },
            { label: 'Probably yes', value: 'probably' },
            { label: 'Not sure', value: 'unsure' },
            { label: 'Probably not', value: 'probably_not' },
            { label: 'Definitely not', value: 'no' },
        ];
    }

    // ─── step pill classes ─────────────────────────────────────────────────────
    _pillClass(n) {
        if (this.currentStep > n)   return 'step-pill step-pill--done';
        if (this.currentStep === n) return 'step-pill step-pill--active';
        return 'step-pill';
    }
    get stepPillClass1() { return this._pillClass(1); }
    get stepPillClass2() { return this._pillClass(2); }
    get stepPillClass3() { return this._pillClass(3); }
    get stepPillClass4() { return this._pillClass(4); }
    get stepPillClass5() { return this._pillClass(5); }

    // ─── resolution tile styling ───────────────────────────────────────────────
    get couponTileClass() { return this.resolution === 'coupon' ? 'res-tile res-tile--selected' : 'res-tile'; }
    get refundTileClass()  { return this.resolution === 'refund'  ? 'res-tile res-tile--selected' : 'res-tile'; }
    get bothTileClass()    { return this.resolution === 'both'    ? 'res-tile res-tile--selected' : 'res-tile'; }

    // ─── navigation ───────────────────────────────────────────────────────────
    nextStep() { if (this.currentStep < 6) this.currentStep++; }
    prevStep() { if (this.currentStep > 1) this.currentStep--; }

    // ─── field handlers ────────────────────────────────────────────────────────
    handleTasteDescription(e)     { this.tasteDescription     = e.detail.value; }
    handleProductVariant(e)       { this.productVariant       = e.detail.value; }
    handleProductSize(e)          { this.productSize          = e.detail.value; }
    handleBestByDate(e)           { this.bestByDate           = e.detail.value; }
    handleLotCode(e)              { this.lotCode              = e.detail.value; }
    handleUpcCode(e)              { this.upcCode              = e.detail.value; }
    handlePurchaseChannel(e)      { this.purchaseChannel      = e.detail.value; }
    handleRetailerName(e)         { this.retailerName         = e.detail.value; }
    handlePurchaseLocation(e)     { this.purchaseLocation     = e.detail.value; }
    handleWasColdAtPurchase(e)    { this.wasColdAtPurchase    = e.detail.value; }
    handleStoredCorrectly(e)      { this.storedCorrectly      = e.detail.value; }
    handleCustomerTenure(e)       { this.customerTenure       = e.detail.value; }
    handlePurchaseFrequency(e)    { this.purchaseFrequency    = e.detail.value; }
    handleUseOccasion(e)          { this.useOccasion          = e.detail.value; }
    handleDiscoveryChannel(e)     { this.discoveryChannel     = e.detail.value; }
    handleRetentionLikelihood(e)  { this.retentionLikelihood  = e.detail.value; }
    handleAgentNotes(e)           { this.agentNotes           = e.detail.value; }

    handleResolutionCoupon() { this.resolution = 'coupon'; }
    handleResolutionRefund()  { this.resolution = 'refund';  }
    handleResolutionBoth()    { this.resolution = 'both';    }

    // ─── submit ────────────────────────────────────────────────────────────────
    handleSubmit() {
        this.isSubmitting = true;
        this.submitError  = null;

        const payload = {
            caseId:             this.recordId,
            tasteDescription:   this.tasteDescription,
            productVariant:     this.productVariant,
            productSize:        this.productSize,
            bestByDate:         this.bestByDate,
            lotCode:            this.lotCode,
            upcCode:            this.upcCode,
            purchaseChannel:    this.purchaseChannel,
            retailerName:       this.retailerName,
            purchaseLocation:   this.purchaseLocation,
            wasColdAtPurchase:  this.wasColdAtPurchase,
            storedCorrectly:    this.storedCorrectly,
            customerTenure:     this.customerTenure,
            purchaseFrequency:  this.purchaseFrequency,
            useOccasion:        this.useOccasion,
            discoveryChannel:   this.discoveryChannel,
            retentionLikelihood:this.retentionLikelihood,
            resolution:         this.resolution,
            agentNotes:         this.agentNotes,
            callerCity:         'Toronto, ON',
            caseName:           'Product Quality Variance - Fairlife Nutrition Plan Chocolate Shakes (Chemical Taste)',
        };

        saveFairlifeCallData({ callData: JSON.stringify(payload) })
            .then(result => {
                this.caseNumber    = result;
                this.isSubmitting  = false;
                this.currentStep   = 6;
            })
            .catch(error => {
                this.submitError  = 'Save failed: ' + (error.body?.message || error.message);
                this.isSubmitting = false;
            });
    }

    resetFlow() {
        this.currentStep         = 1;
        this.tasteDescription    = '';
        this.productVariant      = '';
        this.productSize         = '';
        this.bestByDate          = '';
        this.lotCode             = '';
        this.upcCode             = '';
        this.purchaseChannel     = '';
        this.retailerName        = '';
        this.purchaseLocation    = '';
        this.wasColdAtPurchase   = '';
        this.storedCorrectly     = '';
        this.customerTenure      = '';
        this.purchaseFrequency   = '';
        this.useOccasion         = '';
        this.discoveryChannel    = '';
        this.retentionLikelihood = '';
        this.resolution          = '';
        this.agentNotes          = '';
        this.submitError         = null;
        this.caseNumber          = '';
    }
}
