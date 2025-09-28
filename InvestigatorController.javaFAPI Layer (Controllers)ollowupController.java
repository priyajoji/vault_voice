// InvestigatorController.java (Supports Dashboard and Case Page)
package com.vaultvoice.controller;
// ... imports for DTOs, Services, Security ...
@RestController
@RequestMapping("/api/investigator/cases")
@PreAuthorize("hasRole('INVESTIGATOR')") // Requires successful JWT auth
public class InvestigatorController {
    private final CaseService caseService;

    // ... Constructor injection ...

    // GET /api/investigator/cases (Supports InvestigatorDashboardPage.tsx)
    @GetMapping 
    public ResponseEntity<List<CaseSummaryDto>> getCases() {
        return ResponseEntity.ok(caseService.findAllCaseSummaries());
    }

    // PUT /api/investigator/cases/{caseId}/status (Supports handleStatusChange)
    @PutMapping("/{caseId}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long caseId, @RequestParam CaseStatus newStatus) {
        caseService.updateStatus(caseId, newStatus);
        return ResponseEntity.ok().build();
    }
    
    // POST /api/investigator/cases/{caseId}/reply (Supports handlePostMessage)
    @PostMapping("/{caseId}/reply")
    public ResponseEntity<ThreadItem> postReply(@PathVariable Long caseId, @RequestBody EncryptedBlobDto blobDto) {
        ThreadItem newItem = caseService.saveNewThreadItem(caseId, blobDto, ThreadItemSender.INVESTIGATOR);
        return ResponseEntity.status(201).body(newItem);
    }
}

// FollowupController.java (Supports FollowupPage.tsx)
package com.vaultvoice.controller;
// ... imports for DTOs, Services ...
@RestController
@RequestMapping("/api/followup")
public class FollowupController {
    private final WhistleblowerService whistleblowerService;
    private final CaseService caseService;

    // ... Constructor injection ...

    // POST /api/followup/login (Supports handleLogin)
    @PostMapping("/login")
    public ResponseEntity<CaseDetailsDto> followUpLogin(@RequestBody FollowupLoginRequest request) {
        // Assume whistleblowerService has a method to validate credentials and return details
        CaseDetailsDto details = whistleblowerService.secureLogin(request.getSessionId(), request.getPassphrase());
        
        if (details == null) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        return ResponseEntity.ok(details);
    }

    // POST /api/followup/{sessionId}/reply (Whistleblower sends a reply)
    @PostMapping("/{sessionId}/reply")
    public ResponseEntity<ThreadItem> postMessage(@PathVariable String sessionId, @RequestBody EncryptedBlobDto blobDto) {
        // Must first verify sessionId's existence/validity
        ThreadItem newItem = caseService.saveNewThreadItem(sessionId, blobDto, ThreadItemSender.WHISTLEBLOWER);
        return ResponseEntity.status(201).body(newItem);
    }
}
