import { LightningElement, track, wire } from 'lwc';
import searchCases from '@salesforce/apex/ERCaseController.searchCases';
import getFilterOptions from '@salesforce/apex/ERCaseController.getFilterOptions';
import getEinsteinInsight from '@salesforce/apex/ERCaseController.getEinsteinInsight';

const MODE_KEYWORD = 'Keyword';
const MODE_AI = 'AI Similarity';
const MODE_CASE = 'Case';

export default class ErCaseSearch extends LightningElement {
    @track currentMode = MODE_KEYWORD;
    @track matchLogic = 'All';
    @track threshold = 75;
    @track searchTerm = '';
    @track results = [];
    @track insightSummary = '';
    @track isSearching = false;
    @track hasSearched = false;
    @track selectedId = null;

    // Filter state
    @track showFilters = false;
    @track dateFrom = '';
    @track dateTo = '';
    @track selectedOwner = '';
    @track selectedStatus = '';
    @track selectedAction = '';
    @track selectedLocation = '';
    @track selectedCategory = '';

    // Filter options loaded from org
    @track ownerOptions = [];
    @track statusOptions = [];
    @track actionOptions = [];
    @track locationOptions = [];
    @track categoryOptions = [];

    @wire(getFilterOptions)
    wiredOptions({ data }) {
        if (data) {
            this.ownerOptions = data.owners || [];
            this.statusOptions = data.statuses || [];
            this.actionOptions = data.correctiveActions || [];
            this.locationOptions = data.locations || [];
            this.categoryOptions = data.categories || [];
        }
    }

    // Mode / match getters
    get modeOptions() {
        return [MODE_KEYWORD, MODE_AI, MODE_CASE].map(m => ({
            value: m, label: m, isAI: m === MODE_AI,
            pillClass: `pill-btn${this.currentMode === m ? ' pill-active' : ''}`
        }));
    }
    get isAIMode() { return this.currentMode === MODE_AI; }
    get showMatchLogic() { return this.currentMode !== MODE_CASE; }
    get allPillClass() { return `pill-btn${this.matchLogic === 'All' ? ' pill-active' : ''}`; }
    get anyPillClass() { return `pill-btn${this.matchLogic === 'Any' ? ' pill-active' : ''}`; }
    get searchPlaceholder() {
        return this.currentMode === MODE_CASE ? 'Enter case number...' : 'Enter keywords (e.g. vending theft)';
    }

    // Results getters
    get hasResults() { return this.results.length > 0; }
    get resultCount() { return this.results.length; }
    get showEmpty() { return this.hasSearched && !this.isSearching && this.results.length === 0; }

    // Filter getters
    get hasActiveFilters() { return this.activeFilterChips.length > 0; }
    get activeFilterCount() { return this.activeFilterChips.length || 0; }

    get activeFilterChips() {
        const chips = [];
        if (this.dateFrom) chips.push({ key: 'dateFrom', label: `From: ${this.dateFrom}` });
        if (this.dateTo)   chips.push({ key: 'dateTo',   label: `To: ${this.dateTo}` });
        if (this.selectedOwner) {
            const o = this.ownerOptions.find(x => x.value === this.selectedOwner);
            chips.push({ key: 'owner', label: `Owner: ${o ? o.label : this.selectedOwner}` });
        }
        if (this.selectedStatus)   chips.push({ key: 'status',   label: `Status: ${this.selectedStatus}` });
        if (this.selectedCategory) chips.push({ key: 'category', label: `Category: ${this.selectedCategory}` });
        if (this.selectedLocation) chips.push({ key: 'location', label: `Location: ${this.selectedLocation}` });
        if (this.selectedAction)   chips.push({ key: 'action',   label: `Action: ${this.selectedAction}` });
        return chips;
    }

    // Handlers
    handleModeChange(e) { this.currentMode = e.currentTarget.dataset.value; }
    handleMatchLogicChange(e) { this.matchLogic = e.currentTarget.dataset.value; }
    handleThresholdChange(e) { this.threshold = parseInt(e.target.value, 10); }
    handleSearchInput(e) { this.searchTerm = e.target.value; }
    handleKeyDown(e) { if (e.key === 'Enter') this.runSearch(); }

    toggleFilters() { this.showFilters = !this.showFilters; }

    handleDateFrom(e)   { this.dateFrom = e.target.value; }
    handleDateTo(e)     { this.dateTo = e.target.value; }
    handleOwnerChange(e)    { this.selectedOwner = e.target.value; }
    handleStatusChange(e)   { this.selectedStatus = e.target.value; }
    handleCategoryChange(e) { this.selectedCategory = e.target.value; }
    handleLocationChange(e) { this.selectedLocation = e.target.value; }
    handleActionChange(e)   { this.selectedAction = e.target.value; }

    clearFilters() {
        this.dateFrom = '';
        this.dateTo = '';
        this.selectedOwner = '';
        this.selectedStatus = '';
        this.selectedCategory = '';
        this.selectedLocation = '';
        this.selectedAction = '';
    }

    removeFilter(e) {
        const key = e.currentTarget.dataset.key;
        if (key === 'dateFrom')  this.dateFrom = '';
        if (key === 'dateTo')    this.dateTo = '';
        if (key === 'owner')     this.selectedOwner = '';
        if (key === 'status')    this.selectedStatus = '';
        if (key === 'category')  this.selectedCategory = '';
        if (key === 'location')  this.selectedLocation = '';
        if (key === 'action')    this.selectedAction = '';
    }

    async runSearch() {
        if (this.isSearching) return;
        this.isSearching = true;
        this.hasSearched = true;
        this.selectedId = null;

        try {
            const resp = await searchCases({
                searchTerm: this.searchTerm,
                mode: this.currentMode,
                matchLogic: this.matchLogic,
                threshold: this.threshold,
                dateFrom: this.dateFrom || null,
                dateTo: this.dateTo || null,
                ownerId: this.selectedOwner || null,
                status: this.selectedStatus || null,
                correctiveAction: this.selectedAction || null,
                location: this.selectedLocation || null,
                category: this.selectedCategory || null
            });

            this.results = ((resp && resp.cases) || []).map(r => ({
                ...r,
                cardClass: 'result-card',
                statusBadgeClass: `status-badge status-${(r.status || 'open').toLowerCase().replace(/\s+/g, '-')}`,
                actionBadgeClass: `action-badge action-${this.actionLevel(r.levelOfCorrectiveAction)}`
            }));

            this.insightSummary = (resp && resp.insightSummary) || '';
            this.fireResultsChange();
            // Upgrade summary with Einstein if results exist (fails silently if not licensed)
            if (this.results.length > 0) {
                const ids = this.results.map(r => r.id);
                getEinsteinInsight({ caseIds: ids, searchTerm: this.searchTerm })
                    .then(text => { if (text) { this.insightSummary = text; this.fireResultsChange(); } })
                    .catch(() => { /* stay on rule-based summary */ });
            }
        } catch (err) {
            console.error('Search error', err);
            this.results = [];
            this.insightSummary = '';
            this.fireResultsChange();
        } finally {
            this.isSearching = false;
        }
    }

    handleResultClick(e) {
        const id = e.currentTarget.dataset.id;
        this.selectedId = id;
        this.results = this.results.map(r => ({
            ...r,
            cardClass: `result-card${r.id === id ? ' result-selected' : ''}`
        }));
        const selected = this.results.find(r => r.id === id) || null;
        this.fireResultsChange(selected);
    }

    fireResultsChange(selected = null) {
        this.dispatchEvent(new CustomEvent('resultschange', {
            detail: {
                results: this.results,
                selectedCase: selected,
                insightSummary: this.insightSummary
            }
        }));
    }

    actionLevel(lvl) {
        if (!lvl) return 'none';
        if (lvl.includes('1')) return 'level1';
        if (lvl.includes('2')) return 'level2';
        if (lvl.includes('3')) return 'level3';
        if (lvl.includes('4') || lvl.toLowerCase().includes('termination')) return 'level4';
        return 'none';
    }
}
