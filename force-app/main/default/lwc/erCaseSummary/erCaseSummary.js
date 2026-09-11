import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class ErCaseSummary extends NavigationMixin(LightningElement) {
    @api selectedCase = null;
    @api insightSummary = '';

    _results = [];
    @api
    get results() { return this._results; }
    set results(val) {
        this._results = val || [];
    }

    get isEmpty() { return this._results.length === 0; }
    get hasInsight() { return this.insightSummary && this.insightSummary.length > 0; }
    get hasSelected() { return this.selectedCase !== null; }
    get showClickPrompt() { return !this.hasSelected && this._results.length > 0; }

    get totalCount() { return this._results.length; }

    get terminationCount() {
        return this._results.filter(r =>
            r.levelOfCorrectiveAction &&
            (r.levelOfCorrectiveAction.includes('4') || r.levelOfCorrectiveAction.toLowerCase().includes('termination'))
        ).length;
    }

    get resolvedCount() {
        return this._results.filter(r =>
            r.status && (r.status.toLowerCase() === 'resolved' || r.status.toLowerCase() === 'closed')
        ).length;
    }

    get actionBreakdown() {
        const counts = {};
        this._results.forEach(r => {
            const key = r.levelOfCorrectiveAction || 'No Action';
            counts[key] = (counts[key] || 0) + 1;
        });
        const total = this._results.length || 1;
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([label, count]) => ({
                label,
                count,
                barStyle: `width:${Math.round((count / total) * 100)}%`
            }));
    }

    get selectedActionClass() {
        const lvl = this.selectedCase?.levelOfCorrectiveAction || '';
        let level = 'none';
        if (lvl.includes('1')) level = 'level1';
        else if (lvl.includes('2')) level = 'level2';
        else if (lvl.includes('3')) level = 'level3';
        else if (lvl.includes('4') || lvl.toLowerCase().includes('termination')) level = 'level4';
        return `action-badge action-${level}`;
    }

    navigateToRecord() {
        if (!this.selectedCase?.id) return;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.selectedCase.id,
                objectApiName: 'Case',
                actionName: 'view'
            }
        });
    }

    get selectedStatusClass() {
        const s = (this.selectedCase?.status || '').toLowerCase().replace(/\s+/g, '-');
        return `status-badge status-${s}`;
    }

    get hasAssociate() {
        return this.selectedCase && (
            this.selectedCase.associateJobTitle ||
            this.selectedCase.associateLocation ||
            this.selectedCase.associateMarketUnit ||
            this.selectedCase.associateStatus
        );
    }

    get assocStatusClass() {
        const s = (this.selectedCase?.associateStatus || '').toLowerCase();
        if (s === 'terminated') return 'assoc-badge assoc-terminated';
        if (s === 'on leave')   return 'assoc-badge assoc-leave';
        return 'assoc-badge assoc-active';
    }
}
