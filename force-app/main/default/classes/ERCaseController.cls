public with sharing class ERCaseController {

    @AuraEnabled(cacheable=true)
    public static SearchResponse searchCases(
        String searchTerm,
        String mode,
        String matchLogic,
        Integer threshold,
        String dateFrom,
        String dateTo,
        String ownerId,
        String status,
        String correctiveAction,
        String location,
        String category
    ) {
        String baseWhere = 'Level_of_Corrective_Action__c != null';

        if (String.isNotBlank(dateFrom)) {
            baseWhere += ' AND CreatedDate >= ' + dateFrom + 'T00:00:00Z';
        }
        if (String.isNotBlank(dateTo)) {
            baseWhere += ' AND CreatedDate <= ' + dateTo + 'T23:59:59Z';
        }
        if (String.isNotBlank(ownerId)) {
            baseWhere += ' AND OwnerId = \'' + String.escapeSingleQuotes(ownerId) + '\'';
        }
        if (String.isNotBlank(status)) {
            baseWhere += ' AND Status = \'' + String.escapeSingleQuotes(status) + '\'';
        }
        if (String.isNotBlank(correctiveAction)) {
            baseWhere += ' AND Level_of_Corrective_Action__c = \'' + String.escapeSingleQuotes(correctiveAction) + '\'';
        }
        if (String.isNotBlank(location)) {
            baseWhere += ' AND Affected_Associate_Location__c = \'' + String.escapeSingleQuotes(location) + '\'';
        }
        if (String.isNotBlank(category)) {
            baseWhere += ' AND Bottler_Category__c = \'' + String.escapeSingleQuotes(category) + '\'';
        }

        String selectClause = 'SELECT Id, CaseNumber, Subject, Description, Status, Status_Reason__c, Owner.Name, '
            + 'Bottler_Category__c, Bottler_Sub_Category_1__c, Bottler_Sub_Category_2__c, Bottler_Sub_Category_3__c, Bottler_Sub_Category_4__c, '
            + 'Affected_Associate_Job_Title__c, Affected_Associate_Location__c, Affected_Associate_Market_Unit__c, Affected_Associate_Status__c, '
            + 'Level_of_Corrective_Action__c, Date_Action_Issued__c, ER_Notes_Comments__c, CreatedDate FROM Case WHERE ';

        List<Case> cases = new List<Case>();
        if (mode == 'Keyword' || mode == 'AI Similarity') {
            String trimmed = searchTerm != null ? searchTerm.trim() : '';
            if (String.isNotBlank(trimmed)) {
                if (matchLogic == 'Any') {
                    List<String> terms = trimmed.split('\\s+');
                    List<String> orClauses = new List<String>();
                    for (String t : terms) {
                        orClauses.add('Subject LIKE \'%' + String.escapeSingleQuotes(t) + '%\'');
                    }
                    cases = Database.query(selectClause + baseWhere + ' AND (' + String.join(orClauses, ' OR ') + ') ORDER BY CreatedDate ASC LIMIT 50');
                } else {
                    String likeClause = '%' + String.escapeSingleQuotes(trimmed) + '%';
                    cases = Database.query(selectClause + baseWhere + ' AND Subject LIKE \'' + likeClause + '\' ORDER BY CreatedDate ASC LIMIT 50');
                }
            } else {
                cases = Database.query(selectClause + baseWhere + ' ORDER BY CreatedDate ASC LIMIT 50');
            }
        } else {
            String trimmed = searchTerm != null ? searchTerm.trim() : '';
            String likeClause = '%' + String.escapeSingleQuotes(trimmed) + '%';
            cases = Database.query(selectClause + baseWhere + ' AND CaseNumber LIKE \'' + likeClause + '\' ORDER BY CreatedDate ASC LIMIT 50');
        }

        List<CaseResult> results = new List<CaseResult>();
        for (Case c : cases) {
            CaseResult r = new CaseResult();
            r.id = c.Id;
            r.caseNumber = c.CaseNumber;
            r.subject = c.Subject;
            r.status = c.Status;
            r.ownerName = c.Owner != null ? c.Owner.Name : '';
            r.levelOfCorrectiveAction = c.Level_of_Corrective_Action__c;
            r.dateActionIssued = c.Date_Action_Issued__c != null ? String.valueOf(c.Date_Action_Issued__c) : '';
            r.notesComments = c.ER_Notes_Comments__c;
            r.description = c.Description;
            r.createdDate = String.valueOf(c.CreatedDate.date());
            r.statusReason = c.Status_Reason__c;
            r.bottlerCategory = c.Bottler_Category__c;
            r.subCategory1 = c.Bottler_Sub_Category_1__c;
            r.subCategory2 = c.Bottler_Sub_Category_2__c;
            r.subCategory3 = c.Bottler_Sub_Category_3__c;
            r.subCategory4 = c.Bottler_Sub_Category_4__c;
            r.associateJobTitle = c.Affected_Associate_Job_Title__c;
            r.associateLocation = c.Affected_Associate_Location__c;
            r.associateMarketUnit = c.Affected_Associate_Market_Unit__c;
            r.associateStatus = c.Affected_Associate_Status__c;
            r.aiSummary = generateCaseSummary(c);
            results.add(r);
        }

        SearchResponse resp = new SearchResponse();
        resp.cases = results;
        resp.insightSummary = generateInsightSummary(cases, searchTerm);
        return resp;
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getFilterOptions() {
        Map<String, Object> opts = new Map<String, Object>();

        List<Map<String, String>> owners = new List<Map<String, String>>();
        Set<Id> seen = new Set<Id>();
        for (Case c : [SELECT OwnerId, Owner.Name FROM Case WHERE Level_of_Corrective_Action__c != null ORDER BY Owner.Name LIMIT 200]) {
            if (!seen.contains(c.OwnerId)) {
                seen.add(c.OwnerId);
                owners.add(new Map<String, String>{ 'value' => c.OwnerId, 'label' => c.Owner.Name });
            }
        }
        opts.put('owners', owners);

        List<Map<String, String>> statuses = new List<Map<String, String>>();
        Set<String> seenStatus = new Set<String>();
        for (Case c : [SELECT Status FROM Case WHERE Level_of_Corrective_Action__c != null ORDER BY Status]) {
            if (c.Status != null && !seenStatus.contains(c.Status)) {
                seenStatus.add(c.Status);
                statuses.add(new Map<String, String>{ 'value' => c.Status, 'label' => c.Status });
            }
        }
        opts.put('statuses', statuses);

        List<Map<String, String>> categories = new List<Map<String, String>>();
        Set<String> seenCategory = new Set<String>();
        for (Case c : [SELECT Bottler_Category__c FROM Case WHERE Level_of_Corrective_Action__c != null AND Bottler_Category__c != null ORDER BY Bottler_Category__c LIMIT 200]) {
            if (!seenCategory.contains(c.Bottler_Category__c)) {
                seenCategory.add(c.Bottler_Category__c);
                categories.add(new Map<String, String>{ 'value' => c.Bottler_Category__c, 'label' => c.Bottler_Category__c });
            }
        }
        opts.put('categories', categories);

        List<Map<String, String>> locations = new List<Map<String, String>>();
        Set<String> seenLocation = new Set<String>();
        for (Case c : [SELECT Affected_Associate_Location__c FROM Case WHERE Level_of_Corrective_Action__c != null AND Affected_Associate_Location__c != null ORDER BY Affected_Associate_Location__c LIMIT 500]) {
            if (!seenLocation.contains(c.Affected_Associate_Location__c)) {
                seenLocation.add(c.Affected_Associate_Location__c);
                locations.add(new Map<String, String>{ 'value' => c.Affected_Associate_Location__c, 'label' => c.Affected_Associate_Location__c });
            }
        }
        opts.put('locations', locations);

        List<Map<String, String>> actions = new List<Map<String, String>>{
            new Map<String, String>{ 'value' => 'Level 1 - Verbal Warning',        'label' => 'Level 1 - Verbal Warning' },
            new Map<String, String>{ 'value' => 'Level 2 - Written Warning',       'label' => 'Level 2 - Written Warning' },
            new Map<String, String>{ 'value' => 'Level 3 - Final Written Warning', 'label' => 'Level 3 - Final Written Warning' },
            new Map<String, String>{ 'value' => 'Level 4 - Termination',           'label' => 'Level 4 - Termination' },
            new Map<String, String>{ 'value' => 'No Action Required',              'label' => 'No Action Required' }
        };
        opts.put('correctiveActions', actions);

        return opts;
    }

    // Narrative synthesis across the full result set
    private static String generateInsightSummary(List<Case> cases, String searchTerm) {
        if (cases == null || cases.isEmpty()) return '';

        Integer total = cases.size();

        // Date range
        Date earliest = cases[0].CreatedDate.date();
        Date latest   = cases[0].CreatedDate.date();
        for (Case c : cases) {
            Date d = c.CreatedDate.date();
            if (d < earliest) earliest = d;
            if (d > latest)   latest   = d;
        }
        String dateRange;
        if (earliest == latest) {
            dateRange = DateTime.newInstance(earliest, Time.newInstance(0,0,0,0)).format('MMMM d, yyyy');
        } else {
            dateRange = DateTime.newInstance(earliest, Time.newInstance(0,0,0,0)).format('MMMM yyyy')
                + ' through '
                + DateTime.newInstance(latest, Time.newInstance(0,0,0,0)).format('MMMM yyyy');
        }

        // Counts
        Map<String, Integer> actionCounts = new Map<String, Integer>();
        Map<String, Integer> sub1Counts   = new Map<String, Integer>();
        Map<String, Integer> locationCounts = new Map<String, Integer>();
        Integer terminations = 0;
        Integer resolvedCount = 0;
        Long totalDaysOpen = 0;
        Integer daysCount = 0;

        for (Case c : cases) {
            String lvl = c.Level_of_Corrective_Action__c != null ? c.Level_of_Corrective_Action__c : 'No Action';
            actionCounts.put(lvl, (actionCounts.containsKey(lvl) ? actionCounts.get(lvl) : 0) + 1);
            if (lvl.contains('4') || lvl.toLowerCase().contains('termination')) terminations++;

            if (String.isNotBlank(c.Bottler_Sub_Category_1__c)) {
                String s = c.Bottler_Sub_Category_1__c;
                sub1Counts.put(s, (sub1Counts.containsKey(s) ? sub1Counts.get(s) : 0) + 1);
            }
            if (String.isNotBlank(c.Affected_Associate_Market_Unit__c)) {
                String mu = c.Affected_Associate_Market_Unit__c;
                locationCounts.put(mu, (locationCounts.containsKey(mu) ? locationCounts.get(mu) : 0) + 1);
            }
            if (c.Status != null && (c.Status == 'Resolved' || c.Status == 'Closed')) {
                resolvedCount++;
                if (c.Date_Action_Issued__c != null) {
                    Long days = c.CreatedDate.date().daysBetween(c.Date_Action_Issued__c);
                    if (days > 0 && days < 365) { totalDaysOpen += days; daysCount++; }
                }
            }
        }

        // Top action
        String topAction = ''; Integer topCount = 0;
        for (String a : actionCounts.keySet()) {
            if (actionCounts.get(a) > topCount) { topCount = actionCounts.get(a); topAction = a; }
        }
        // Top sub-category
        String topSub1 = ''; Integer topSub1Count = 0;
        for (String s : sub1Counts.keySet()) {
            if (sub1Counts.get(s) > topSub1Count) { topSub1Count = sub1Counts.get(s); topSub1 = s; }
        }
        // Top market unit
        String topUnit = ''; Integer topUnitCount = 0;
        for (String mu : locationCounts.keySet()) {
            if (locationCounts.get(mu) > topUnitCount) { topUnitCount = locationCounts.get(mu); topUnit = mu; }
        }

        // Build narrative
        String term = String.isNotBlank(searchTerm) ? '"' + searchTerm.trim() + '"' : 'this criteria';
        String summary = 'Agentforce identified ' + total + ' ER case' + (total > 1 ? 's' : '')
            + ' matching ' + term + ', spanning ' + dateRange + '. ';

        // Issue type
        if (String.isNotBlank(topSub1)) {
            summary += (topSub1Count == total ? 'All cases involve ' : topSub1Count + ' of ' + total + ' cases involve ')
                + topSub1.toLowerCase() + '. ';
        }

        // Geography
        if (String.isNotBlank(topUnit) && locationCounts.size() > 0) {
            if (locationCounts.size() == 1) {
                summary += 'All incidents occurred within the ' + topUnit + ' market unit. ';
            } else {
                summary += 'The ' + topUnit + ' market unit accounts for the highest concentration of cases (' + topUnitCount + '). ';
            }
        }

        // Resolution rate
        if (resolvedCount == total) {
            summary += 'All ' + total + ' cases have been fully investigated and resolved. ';
        } else if (resolvedCount > 0) {
            summary += resolvedCount + ' of ' + total + ' cases are resolved, with '
                + (total - resolvedCount) + ' still open or in progress. ';
        } else {
            summary += 'No cases in this set have been marked resolved. ';
        }

        // Action pattern
        if (total == 1) {
            summary += 'The ER team responded with a ' + topAction + '. ';
        } else {
            summary += 'The most common ER response was a ' + topAction
                + ' (' + topCount + ' of ' + total + ' cases). ';
            if (terminations > 0 && !topAction.toLowerCase().contains('termination')) {
                summary += terminations == 1 ? '1 case escalated to termination. '
                    : terminations + ' cases escalated to termination. ';
            }
        }

        // Avg resolution time
        if (daysCount > 0) {
            Long avgDays = totalDaysOpen / daysCount;
            summary += 'Average time to resolution: ' + avgDays + ' day' + (avgDays != 1 ? 's.' : '.');
        }

        // Severity
        Integer serious = 0;
        for (Case c : cases) {
            String lvl = c.Level_of_Corrective_Action__c != null ? c.Level_of_Corrective_Action__c : '';
            if (lvl.contains('3') || lvl.contains('4') || lvl.toLowerCase().contains('termination')) serious++;
        }
        if (serious > 0 && total > 1) {
            Decimal pct = (Decimal.valueOf(serious) / total * 100).setScale(0);
            summary += ' ' + pct + '% of cases resulted in a Level 3 or higher action, '
                + (pct >= 50 ? 'indicating a pattern of serious policy violations.'
                             : 'suggesting most were resolved through standard progressive discipline.');
        }

        return summary.trim();
    }

    private static String generateCaseSummary(Case c) {
        String subject = c.Subject != null ? c.Subject : 'an ethics complaint';
        String status  = c.Status != null ? c.Status.toLowerCase() : 'unresolved';
        String lvl     = c.Level_of_Corrective_Action__c;
        String dt      = c.Date_Action_Issued__c != null
            ? DateTime.newInstance(c.Date_Action_Issued__c, Time.newInstance(0,0,0,0)).format('MMMM d, yyyy')
            : null;
        String notes   = c.ER_Notes_Comments__c;

        // Category context
        String catContext = '';
        if (String.isNotBlank(c.Bottler_Sub_Category_1__c)) {
            catContext = c.Bottler_Sub_Category_1__c.toLowerCase();
            if (String.isNotBlank(c.Bottler_Sub_Category_2__c)) {
                catContext += ' (' + c.Bottler_Sub_Category_2__c.toLowerCase() + ')';
            }
        }

        String summary = 'An ER case was opened regarding ' + subject.toLowerCase();
        if (String.isNotBlank(catContext)) summary += ', categorized as ' + catContext;
        summary += '. ';

        // Associate context
        if (String.isNotBlank(c.Affected_Associate_Job_Title__c) || String.isNotBlank(c.Affected_Associate_Location__c)) {
            summary += 'The affected associate';
            if (String.isNotBlank(c.Affected_Associate_Job_Title__c)) summary += ' (' + c.Affected_Associate_Job_Title__c + ')';
            if (String.isNotBlank(c.Affected_Associate_Location__c)) summary += ' is based in ' + c.Affected_Associate_Location__c;
            if (String.isNotBlank(c.Affected_Associate_Status__c) && c.Affected_Associate_Status__c != 'Active') {
                summary += ' and is currently ' + c.Affected_Associate_Status__c.toLowerCase();
            }
            summary += '. ';
        }

        // Investigation notes
        if (notes != null && notes.trim().length() > 0) {
            String detail = notes.trim();
            if (detail.length() > 180) detail = detail.substring(0, 180).trim() + '...';
            summary += 'Investigation notes indicate: ' + detail + ' ';
        }

        // Resolution
        if (lvl != null && lvl != 'No Action Required') {
            summary += 'The ER team concluded the investigation';
            if (dt != null) summary += ' on ' + dt;
            summary += ' and issued a ' + lvl + '.';
        } else if (lvl == 'No Action Required') {
            summary += 'The investigation was completed and no corrective action was required.';
        } else {
            summary += 'The case is currently ' + status + ' with no corrective action recorded.';
        }

        return summary;
    }

    public class SearchResponse {
        @AuraEnabled public List<CaseResult> cases;
        @AuraEnabled public String insightSummary;
    }

    // Requires Einstein for Service license + Einstein Generative AI enabled in Setup.
    // Falls back silently if unavailable — the rule-based summary remains in place.
    @AuraEnabled
    public static String getEinsteinInsight(List<String> caseIds, String searchTerm) {
        if (caseIds == null || caseIds.isEmpty()) return '';

        List<Case> cases = [
            SELECT CaseNumber, Subject, Status, Level_of_Corrective_Action__c,
                   Bottler_Sub_Category_1__c, Affected_Associate_Market_Unit__c
            FROM Case WHERE Id IN :caseIds LIMIT 50
        ];

        String term = String.isNotBlank(searchTerm) ? searchTerm.trim() : 'all cases';
        String prompt = 'You are an HR analytics assistant for a beverage bottling company. '
            + 'Analyze these ' + cases.size() + ' employee relations cases from a search for "' + term + '". '
            + 'Write a 3-sentence executive summary covering: the key issue patterns, '
            + 'the most common corrective action taken, and overall resolution status. '
            + 'Be concise and professional. Cases: ';

        List<String> lines = new List<String>();
        for (Case c : cases) {
            lines.add(c.CaseNumber + ': ' + (c.Subject != null ? c.Subject : 'N/A')
                + ' | ' + (c.Level_of_Corrective_Action__c != null ? c.Level_of_Corrective_Action__c : 'No Action')
                + ' | ' + (c.Status != null ? c.Status : 'Open')
                + (c.Bottler_Sub_Category_1__c != null ? ' | ' + c.Bottler_Sub_Category_1__c : '')
                + (c.Affected_Associate_Market_Unit__c != null ? ' | ' + c.Affected_Associate_Market_Unit__c : ''));
        }
        prompt += String.join(lines, '; ');

        ConnectApi.EinsteinLLMGenerateMessagesInput input = new ConnectApi.EinsteinLLMGenerateMessagesInput();
        input.promptTextorId = prompt;
        ConnectApi.EinsteinLLMGenerateMessagesOutput output = ConnectApi.EinsteinLLM.generateMessages(input);
        return output.generations[0].text;
    }

    public class CaseResult {
        @AuraEnabled public String id;
        @AuraEnabled public String caseNumber;
        @AuraEnabled public String subject;
        @AuraEnabled public String status;
        @AuraEnabled public String statusReason;
        @AuraEnabled public String ownerName;
        @AuraEnabled public String levelOfCorrectiveAction;
        @AuraEnabled public String dateActionIssued;
        @AuraEnabled public String notesComments;
        @AuraEnabled public String description;
        @AuraEnabled public String createdDate;
        @AuraEnabled public String bottlerCategory;
        @AuraEnabled public String subCategory1;
        @AuraEnabled public String subCategory2;
        @AuraEnabled public String subCategory3;
        @AuraEnabled public String subCategory4;
        @AuraEnabled public String associateJobTitle;
        @AuraEnabled public String associateLocation;
        @AuraEnabled public String associateMarketUnit;
        @AuraEnabled public String associateStatus;
        @AuraEnabled public String aiSummary;
    }
}
