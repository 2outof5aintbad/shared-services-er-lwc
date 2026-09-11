import { LightningElement, track } from 'lwc';

export default class ErCaseSimilarity extends LightningElement {
    @track results = [];
    @track selectedCase = null;
    @track insightSummary = '';

    handleResultsChange(e) {
        this.results = e.detail.results;
        this.selectedCase = e.detail.selectedCase || null;
        this.insightSummary = e.detail.insightSummary || '';
    }
}
