public with sharing class FairlifeCallController {

    /**
     * Saves call data captured by the Fairlife Call Flow LWC.
     * Writes a custom Fairlife_Call_Data__c record (first-party marketing data)
     * and updates the parent Case with resolution + subject.
     *
     * @param callData  JSON string matching the payload shape from the LWC
     * @return          Case.CaseNumber of the updated case
     */
    @AuraEnabled
    public static String saveFairlifeCallData(String callData) {
        FairlifeCallPayload payload = (FairlifeCallPayload) JSON.deserialize(callData, FairlifeCallPayload.class);

        // ── Update parent Case ────────────────────────────────────────────────
        Case c = new Case(
            Id          = payload.caseId,
            Subject     = payload.caseName,
            Description = buildCaseDescription(payload),
            Status      = 'Closed'
        );
        update c;

        // ── Retrieve case number for confirmation screen ───────────────────────
        Case updated = [SELECT CaseNumber FROM Case WHERE Id = :payload.caseId LIMIT 1];

        // ── Write first-party marketing record ───────────────────────────────
        Fairlife_Call_Data__c fd = new Fairlife_Call_Data__c(
            Case__c                     = payload.caseId,
            Taste_Description__c        = payload.tasteDescription,
            Product_Variant__c          = payload.productVariant,
            Product_Size__c             = payload.productSize,
            Best_By_Date__c             = payload.bestByDate,
            Lot_Code__c                 = payload.lotCode,
            UPC_Code__c                 = payload.upcCode,
            Purchase_Channel__c         = payload.purchaseChannel,
            Retailer_Name__c            = payload.retailerName,
            Purchase_Location__c        = payload.purchaseLocation,
            Was_Cold_At_Purchase__c     = payload.wasColdAtPurchase,
            Stored_Correctly__c         = payload.storedCorrectly,
            Customer_Tenure__c          = payload.customerTenure,
            Purchase_Frequency__c       = payload.purchaseFrequency,
            Use_Occasion__c             = payload.useOccasion,
            Discovery_Channel__c        = payload.discoveryChannel,
            Retention_Likelihood__c     = payload.retentionLikelihood,
            Resolution_Offered__c       = payload.resolution,
            Agent_Notes__c              = payload.agentNotes,
            Caller_City__c              = payload.callerCity
        );
        insert fd;

        return updated.CaseNumber;
    }

    private static String buildCaseDescription(FairlifeCallPayload p) {
        return 'CALLER: Toronto, ON\n'
            + 'PRODUCT: ' + p.productVariant + ' ' + p.productSize + '\n'
            + 'LOT CODE: ' + p.lotCode + '\n'
            + 'BEST BY: ' + p.bestByDate + '\n'
            + 'UPC: ' + p.upcCode + '\n'
            + 'TASTE ISSUE: ' + p.tasteDescription + '\n\n'
            + 'PURCHASED AT: ' + p.retailerName + ' (' + p.purchaseChannel + ')\n'
            + 'LOCATION: ' + p.purchaseLocation + '\n'
            + 'COLD AT PURCHASE: ' + p.wasColdAtPurchase + '\n'
            + 'STORED CORRECTLY: ' + p.storedCorrectly + '\n\n'
            + 'CUSTOMER SINCE: ' + p.customerTenure + '\n'
            + 'FREQUENCY: ' + p.purchaseFrequency + '\n'
            + 'USE OCCASION: ' + p.useOccasion + '\n'
            + 'DISCOVERED VIA: ' + p.discoveryChannel + '\n'
            + 'RETENTION: ' + p.retentionLikelihood + '\n\n'
            + 'RESOLUTION: ' + p.resolution + '\n'
            + 'NOTES: ' + p.agentNotes;
    }

    // ── inner DTO ─────────────────────────────────────────────────────────────
    public class FairlifeCallPayload {
        public String caseId;
        public String caseName;
        public String tasteDescription;
        public String productVariant;
        public String productSize;
        public String bestByDate;
        public String lotCode;
        public String upcCode;
        public String purchaseChannel;
        public String retailerName;
        public String purchaseLocation;
        public String wasColdAtPurchase;
        public String storedCorrectly;
        public String customerTenure;
        public String purchaseFrequency;
        public String useOccasion;
        public String discoveryChannel;
        public String retentionLikelihood;
        public String resolution;
        public String agentNotes;
        public String callerCity;
    }
}
