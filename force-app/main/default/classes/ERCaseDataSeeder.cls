public class ERCaseDataSeeder {
    public static void seed() {
        List<Case> existing = [SELECT Id FROM Case WHERE Level_of_Corrective_Action__c != null LIMIT 200];
        if (!existing.isEmpty()) delete existing;

        List<Case> cases = new List<Case>{
            make('Vending Machine Theft - Company Van Used for Personal Vending',
                 'Theft/Fraud\n\nCE: Anonymous\nAE: M. Torres\n\nInformant reports that Reset Merchandise Manager M. Torres is using a Coca-Cola company van to service his personal vending machines at two Houston locations during work hours. Multiple sightings over 6 weeks.',
                 'Code of Business Conduct (ER)', 'Theft of Assets from the Company', 'Company Vehicle', 'Confirmed', 'Termination',
                 'Level 4 - Termination', Date.newInstance(2024,10,2),
                 'Investigation confirmed via GPS logs and security footage. Employee admitted to 11 incidents. Terminated 10/08/2024. Company vehicle returned.',
                 'Terminated', 'Supervisor, Reset', '4800 Houston, TX (NorthPoint)', 'HQ',
                 'Resolved', 'Investigation Completed', Date.newInstance(2024,8,22)),

            make('Vending Machine Cash Theft - Break Room',
                 'Theft/Fraud\n\nCE: Anonymous tip via Ethics hotline\nAE: D. Kowalski\n\nCoworker observed removing cash from break room vending machine coin return on multiple occasions. Estimated total: $22.',
                 'Code of Business Conduct (ER)', 'Theft of Assets from the Company', 'Cash/Currency', 'Confirmed', 'Written Warning',
                 'Level 2 - Written Warning', Date.newInstance(2024,3,15),
                 'Badge log and camera footage confirmed. Employee admitted three incidents. Written warning issued. Restitution of $22 collected.',
                 'Active', 'Warehouse Associate', '2200 Chicago, IL (Midway)', 'Midwest',
                 'Resolved', 'Investigation Completed', Date.newInstance(2024,2,28)),

            make('Vending Machine Tampering - Coin Mechanism',
                 'Policy Violation\n\nCE: Facilities Manager\nAE: R. Patel\n\nVending machine coin mechanism on 3rd floor tampered with to obtain free product. Badge log confirms R. Patel present at all three flagged incidents.',
                 'Code of Business Conduct (ER)', 'Theft of Assets from the Company', 'Product / Inventory', 'Confirmed', 'Verbal Warning',
                 'Level 1 - Verbal Warning', Date.newInstance(2024,4,2),
                 'First offense. Employee counseled. Acknowledged behavior in writing. Verbal warning per progressive discipline policy.',
                 'Active', 'Field Sales Representative', '3100 Dallas, TX (NorthGate)', 'Southwest',
                 'Resolved', 'Investigation Completed', Date.newInstance(2024,3,18)),

            make('Vending Machine Cash Box Theft - Cafeteria',
                 'Theft/Fraud\n\nCE: Cafeteria Vendor\nAE: J. Whitmore (primary), C. Nguyen (bystander)\n\nVending cash box missing $148. Badge and camera review identified J. Whitmore removing cash box; C. Nguyen present and failed to report.',
                 'Code of Business Conduct (ER)', 'Theft of Assets from the Company', 'Cash/Currency', 'Confirmed', 'Termination',
                 'Level 4 - Termination', Date.newInstance(2024,6,10),
                 'J. Whitmore terminated per zero-tolerance policy. C. Nguyen issued Level 2 warning for failure to report. Both signed acknowledgment documents.',
                 'Terminated', 'Delivery Driver', '5500 Atlanta, GA (Peachtree)', 'Southeast',
                 'Resolved', 'Investigation Completed', Date.newInstance(2024,5,30)),

            make('Vending Machine Key Duplication - Unauthorized Access',
                 'Theft/Fraud\n\nCE: Security Team\nAE: P. Okafor\n\nDuplicate key to lobby vending cash compartment found in employee possession. Three prior unexplained cash shortages align with badge access history.',
                 'Code of Business Conduct (ER)', 'Theft of Assets from the Company', 'Cash/Currency', 'Confirmed', 'Final Written Warning',
                 'Level 3 - Final Written Warning', Date.newInstance(2024,5,20),
                 'Third incident in two years. Employee admitted to key duplication. Final written warning. 6-month probation. Maintenance closet access revoked.',
                 'Active', 'Merchandiser', '4800 Houston, TX (SouthPoint)', 'HQ',
                 'Resolved', 'Investigation Completed', Date.newInstance(2024,5,5)),

            make('Vending Machine Coin Fraud - Modified Coins',
                 'Theft/Fraud\n\nCE: Maintenance Staff\nAE: A. Reyes\n\nModified coins found in break room vending machine during routine service. Security footage identified A. Reyes on six occasions over 3 weeks. Estimated: $31.',
                 'Code of Business Conduct (ER)', 'Theft of Assets from the Company', 'Product / Inventory', 'Confirmed', 'Written Warning',
                 'Level 2 - Written Warning', Date.newInstance(2024,10,3),
                 'Employee admitted after viewing footage. Written warning. Restitution of $31 collected. 90-day monitoring initiated.',
                 'Active', 'Route Sales Representative', '6200 Phoenix, AZ (Desert Ridge)', 'Southwest',
                 'Resolved', 'Investigation Completed', Date.newInstance(2024,9,20)),

            make('Workplace Harassment - Supervisor Conduct',
                 'Harassment\n\nCE: Two direct reports (filed separately)\nAE: K. Sullivan (Supervisor)\n\nTwo employees filed separate complaints for repeated unwanted comments about physical appearance during team meetings over 60 days. Third employee later corroborated.',
                 'Harassment / Discrimination', 'Harassment', 'Verbal / Non-Physical', 'Confirmed', 'Final Written Warning',
                 'Level 3 - Final Written Warning', Date.newInstance(2024,2,28),
                 'Pattern corroborated by three witnesses. Mandatory harassment training completed. Final written warning. Performance improvement plan with monthly HR reviews.',
                 'Active', 'Supervisor, Distribution', '1100 Nashville, TN (Central)', 'Southeast',
                 'Resolved', 'Investigation Completed', Date.newInstance(2024,2,5)),

            make('Expense Report Fraud - Duplicate Receipts',
                 'Theft/Fraud\n\nCE: Finance Audit\nAE: T. Brennan\n\nRoutine audit flagged duplicate receipt submissions over 8 months. Total confirmed: $1,240 across 14 submissions. Pattern identified as intentional re-use.',
                 'Code of Business Conduct (ER)', 'Misappropriation of Funds', 'Expense Fraud', 'Confirmed', 'Termination',
                 'Level 4 - Termination', Date.newInstance(2024,1,17),
                 'Confirmed intentional fraud. Terminated 01/17/2024. Repayment agreement signed for $1,240. Legal reviewed, no further action required.',
                 'Terminated', 'Regional Account Manager', '9000 Denver, CO (Tech Center)', 'Mountain West',
                 'Resolved', 'Investigation Completed', Date.newInstance(2024,1,3)),

            make('Conflict of Interest - Undisclosed Vendor Relationship',
                 'Code of Business Conduct\n\nCE: Anonymous\nAE: S. Ihejirika\n\nEmployee approved vendor contract while receiving personal consulting payments from that vendor over 4 months. Not disclosed per policy 7.1.',
                 'Code of Business Conduct (ER)', 'Conflict of Interest', 'Vendor Relationship', 'Confirmed', 'Final Written Warning',
                 'Level 3 - Final Written Warning', Date.newInstance(2024,7,5),
                 'Contract voided and re-bid. Employee removed from vendor approvals. Final written warning. Annual compliance training required.',
                 'Active', 'Procurement Manager', '7700 Cincinnati, OH (Riverfront)', 'Midwest',
                 'Resolved', 'Investigation Completed', Date.newInstance(2024,6,18)),

            make('Falsified Timesheet Records',
                 'Policy Violation\n\nCE: Payroll Audit\nAE: L. Fontaine\n\n14 unworked hours recorded over 3 pay periods. Supervisor signed off without verification. Overpayment: $490.',
                 'Code of Business Conduct (ER)', 'Misappropriation of Funds', 'Timesheet Fraud', 'Confirmed', 'Final Written Warning',
                 'Level 3 - Final Written Warning', Date.newInstance(2024,6,30),
                 'Employee issued final written warning, repaid $490. Supervisor issued written warning for inadequate oversight. Both on mandatory timesheet audit 6 months.',
                 'Active', 'Supply Chain Coordinator', '3300 Memphis, TN (Eastgate)', 'Southeast',
                 'Resolved', 'Investigation Completed', Date.newInstance(2024,6,14)),

            make('Workplace Bullying - Exclusionary Conduct by Team Lead',
                 'Harassment\n\nCE: Three team members (filed jointly)\nAE: B. Okonkwo (Team Lead)\n\nTeam lead systematically excluded three employees from project meetings and withheld work information over 4 months.',
                 'Harassment / Discrimination', 'Harassment', 'Workplace Bullying', 'Confirmed', 'Written Warning',
                 'Level 2 - Written Warning', Date.newInstance(2024,4,22),
                 'Pattern confirmed via document and calendar review. Written warning issued. Leadership coaching assigned. 30/60/90-day HR check-ins with affected staff.',
                 'Active', 'Team Lead, Customer Service', '8800 Orlando, FL (Convention)', 'Southeast',
                 'Resolved', 'Investigation Completed', Date.newInstance(2024,4,8)),

            make('Theft - Unreturned Company Laptop',
                 'Policy Violation\n\nCE: IT Asset Management\nAE: F. Morales\n\nLaptop valued at $1,450 not returned after employee transfer. Employee claims unawareness of return requirement. Device located at home.',
                 'Code of Business Conduct (ER)', 'Theft of Assets from the Company', 'IT Equipment', 'Confirmed', 'Verbal Warning',
                 'Level 1 - Verbal Warning', Date.newInstance(2024,9,12),
                 'Laptop recovered in full working condition. Verbal warning. New transfer equipment checklist implemented. No data security concern.',
                 'Active', 'Marketing Analyst', '2500 Minneapolis, MN (Uptown)', 'Midwest',
                 'Resolved', 'Investigation Completed', Date.newInstance(2024,9,1)),

            make('Substance Policy Violation - Controlled Substance on Premises',
                 'Policy Violation\n\nCE: Security (random search)\nAE: G. Tanaka\n\nControlled substance found in employee vehicle during random parking lot search under policy 9.3 during work hours.',
                 'Substance Policy Violation', 'Substance Possession', 'On Company Premises', 'Confirmed', 'Termination',
                 'Level 4 - Termination', Date.newInstance(2024,11,14),
                 'Zero-tolerance policy applied. Terminated immediately. EAP referral offered. Legal reviewed, no further company action required.',
                 'Terminated', 'Warehouse Supervisor', '4100 San Antonio, TX (Alamo)', 'Southwest',
                 'Resolved', 'Investigation Completed', Date.newInstance(2024,11,8)),

            make('Data Misuse - Unauthorized Customer Record Access',
                 'Code of Business Conduct\n\nCE: IT Security Alert\nAE: H. Nakamura\n\n340 customer records queried in a 4-hour window outside normal job scope. Records included personal contact info and purchase history.',
                 'Data Privacy / Misuse', 'Unauthorized Data Access', 'Customer Records', 'Confirmed', 'Written Warning',
                 'Level 2 - Written Warning', Date.newInstance(2024,8,1),
                 'No malicious intent confirmed. No data export found. Written warning. Access permissions reduced to job scope. Annual privacy training completed.',
                 'Active', 'Customer Success Analyst', '6600 Seattle, WA (SoDo)', 'Pacific Northwest',
                 'Resolved', 'Investigation Completed', Date.newInstance(2024,7,22)),

            make('Vending Machine Theft - Lobby Area (Repeat Pattern)',
                 'Theft/Fraud\n\nCE: Security Camera Review\nAE: Under Investigation\n\nEmployee captured removing $15 from lobby vending coin return on 9 occasions over two weeks. Identified during routine camera audit.',
                 'Code of Business Conduct (ER)', 'Theft of Assets from the Company', 'Cash/Currency', 'Confirmed', 'Written Warning',
                 'Level 2 - Written Warning', Date.newInstance(2025,1,8),
                 'Employee acknowledged incidents when shown footage. Written warning. Restitution of $15 collected. 90-day monitoring period.',
                 'Active', 'Front Desk Associate', '4800 Houston, TX (NorthPoint)', 'HQ',
                 'Open', 'Pending Investigation', Date.newInstance(2025,1,2)),

            make('Interpersonal Conflict - Miscommunication Between Peers',
                 'Workplace Conduct\n\nCE: Team Member (A. Simmons)\nAE: C. Delgado\n\nComplainant alleged hostile communication via email and in team stand-ups over a three-week period. Tone described as dismissive and condescending.',
                 'Harassment / Discrimination', 'Harassment', 'Verbal / Non-Physical', 'Not Confirmed', 'No Action Required',
                 'No Action Required', null,
                 'Both parties interviewed separately and together. Situation attributed to communication style differences and workload stress, not intent. Mediation session completed. No policy violation found. Case closed.',
                 'Active', 'Senior Analyst, Supply Chain', '3300 Memphis, TN (Eastgate)', 'Southeast',
                 'Resolved', 'No Violation Found', Date.newInstance(2024,3,10)),

            make('Alleged Expense Misuse - Business Meal Claim',
                 'Policy Compliance\n\nCE: Direct Manager\nAE: W. Chambers\n\nManager questioned a $310 dinner receipt submitted for client entertainment. Attendee list did not include the client name. Possible personal meal submitted as business expense.',
                 'Code of Business Conduct (ER)', 'Misappropriation of Funds', 'Expense Fraud', 'Not Confirmed', 'No Action Required',
                 'No Action Required', null,
                 'Employee provided email confirmation of client attendance at dinner. Receipt matched restaurant, date, and party size. Omission of client name on form was clerical error. No violation. Finance notified to update expense form guidance.',
                 'Active', 'Key Account Manager', '9000 Denver, CO (Tech Center)', 'Mountain West',
                 'Resolved', 'No Violation Found', Date.newInstance(2024,5,19)),

            make('Harassment Allegation - Social Media Comment',
                 'Workplace Conduct\n\nCE: HR (self-report)\nAE: N. Osei\n\nEmployee reported being tagged in a social media post by a colleague with a comment perceived as mocking. Post was made on a personal account outside work hours.',
                 'Harassment / Discrimination', 'Harassment', 'Digital / Social Media', 'Not Confirmed', 'No Action Required',
                 'No Action Required', null,
                 'Post reviewed in context. Comment was a lighthearted reference to a shared team event. Reporting employee acknowledged misread after conversation. Both parties agreed to move forward. No policy violation. Informal coaching provided to AE on professional digital conduct.',
                 'Active', 'Territory Sales Representative', '2200 Chicago, IL (Midway)', 'Midwest',
                 'Resolved', 'No Violation Found', Date.newInstance(2024,7,30)),

            make('Conflict of Interest Inquiry - Spouse Employment at Vendor',
                 'Ethics Disclosure\n\nCE: Voluntary Self-Disclosure\nAE: R. Krishnamurthy\n\nEmployee proactively disclosed that their spouse recently accepted a position at a third-party logistics vendor currently used by CCBSS. Employee sought guidance on recusal.',
                 'Code of Business Conduct (ER)', 'Conflict of Interest', 'Vendor Relationship', 'Not Confirmed', 'No Action Required',
                 'No Action Required', null,
                 'Disclosure reviewed by Legal and ER. Employee has no procurement authority over the vendor in question. Recusal not required but recommended as best practice. Annual COI disclosure updated. No policy violation. Case closed commending proactive disclosure.',
                 'Active', 'Logistics Coordinator', '7700 Cincinnati, OH (Riverfront)', 'Midwest',
                 'Resolved', 'No Violation Found', Date.newInstance(2024,9,4)),

            make('Workplace Conduct - Raised Voices During Team Meeting',
                 'Workplace Conduct\n\nCE: Peer (anonymous)\nAE: M. Okonkwo, D. Vasquez\n\nTwo colleagues reported to have argued loudly during a planning meeting. Other team members described the environment as tense. No physical contact or personal insults alleged.',
                 'Harassment / Discrimination', 'Harassment', 'Workplace Bullying', 'Not Confirmed', 'No Action Required',
                 'No Action Required', null,
                 'Both individuals interviewed. Disagreement was work-related (project scope, not personal). Neither party felt threatened. Team lead facilitated a retrospective meeting. Working relationship reported as restored. Coaching on conflict resolution provided to both.',
                 'Active', 'Project Manager', '1100 Nashville, TN (Central)', 'Southeast',
                 'Resolved', 'No Violation Found', Date.newInstance(2024,11,20)),

            make('Data Access Inquiry - Cross-Department Report Pull',
                 'Data Compliance\n\nCE: IT Security (automated flag)\nAE: J. Fernandez\n\nAutomated system flagged access to HR compensation data by an employee in Finance. Volume was within normal range but scope crossed department boundary.',
                 'Data Privacy / Misuse', 'Unauthorized Data Access', 'Internal HR Records', 'Not Confirmed', 'No Action Required',
                 'No Action Required', null,
                 'Employee was conducting a cross-functional audit approved by VP Finance and VP HR. Verbal approval was not logged in the ticket system — gap in process, not intent. Access was appropriate given the task. IT now requires written approval for cross-department data access. No violation.',
                 'Active', 'Senior Financial Analyst', '6600 Seattle, WA (SoDo)', 'Pacific Northwest',
                 'Resolved', 'No Violation Found', Date.newInstance(2025,2,14))
        };

        insert cases;
        System.debug('Seeded ' + cases.size() + ' ER Ethics cases.');
    }

    private static Case make(
        String subject, String caseDesc,
        String category, String sub1, String sub2, String sub3, String sub4,
        String lvl, Date actionDate, String notes,
        String assocStatus, String jobTitle, String location, String marketUnit,
        String status, String statusReason, Date openedDate
    ) {
        return new Case(
            Subject = subject,
            Description = caseDesc,
            Bottler_Category__c = category,
            Bottler_Sub_Category_1__c = sub1,
            Bottler_Sub_Category_2__c = sub2,
            Bottler_Sub_Category_3__c = sub3,
            Bottler_Sub_Category_4__c = sub4,
            Level_of_Corrective_Action__c = lvl,
            Date_Action_Issued__c = actionDate,
            ER_Notes_Comments__c = notes,
            Affected_Associate_Status__c = assocStatus,
            Affected_Associate_Job_Title__c = jobTitle,
            Affected_Associate_Location__c = location,
            Affected_Associate_Market_Unit__c = marketUnit,
            Status = status,
            Status_Reason__c = statusReason,
            Origin = 'Internal'
        );
    }
}
