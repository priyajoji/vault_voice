// ReportCase.java
package com.vaultvoice.model;
// ... imports for JPA, Lombok ...
@Entity
@Table(name = "report_cases")
@Data @NoArgsConstructor @AllArgsConstructor
public class ReportCase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Follow-up Credentials
    private String sessionId;       
    private String passphraseHash; 
    
    // Investigator Key (Encrypted on submission)
    private String caseKeyForInvestigator; 

    @Enumerated(EnumType.STRING)
    private CaseStatus status = CaseStatus.NEW;

    @Enumerated(EnumType.STRING)
    private MlLabel mlLabel = MlLabel.UNCATEGORIZED;
    private Double mlScore = 0.0;
    private Instant createdAt = Instant.now();
}

// ThreadItem.java
package com.vaultvoice.model;
// ... imports for JPA, Lombok ...
@Entity
@Table(name = "thread_items")
@Data @NoArgsConstructor @AllArgsConstructor
public class ThreadItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id")
    private ReportCase reportCase;
    
    // Encrypted data payload
    private String ciphertextBase64;
    private String nonceBase64;
    private String algo = "AES-GCM"; // Default algorithm

    @Enumerated(EnumType.STRING)
    private ThreadItemSender sender;
    private Instant createdAt = Instant.now();
}
