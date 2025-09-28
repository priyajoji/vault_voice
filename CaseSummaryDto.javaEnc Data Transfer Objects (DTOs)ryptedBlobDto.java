That's a huge task, but absolutely necessary for a complete backend! I'll provide the essential boilerplate code for the most critical files to establish the Vault Voice Spring Boot Backend, including Enums, Entities, Repositories, DTOs, and Controllers.

Due to the length, I'll focus on the core structure and interactions required by the frontend snippets, using Lombok for brevity (assuming you have it set up). You'll need to define the ResourceNotFoundException class separately.

Vault Voice Spring Boot Backend: Essential File Contents
All files are located under the package structure com.vaultvoice.<layer>.

1. Core Data Structures (Enums)
File Name	Path	Content
CaseStatus.java	com/vaultvoice/enums/	Defines StatusBadge states.
ThreadItemSender.java	com/vaultvoice/enums/	Defines message origins.
MlLabel.java	com/vaultvoice/enums/	Defines ML analysis categories (Dashboard).

Export to Sheets
Java

// CaseStatus.java
package com.vaultvoice.enums;
public enum CaseStatus {
    NEW,
    IN_REVIEW,
    CLOSED
}

// ThreadItemSender.java
package com.vaultvoice.enums;
public enum ThreadItemSender {
    WHISTLEBLOWER,
    INVESTIGATOR
}

// MlLabel.java
package com.vaultvoice.enums;
public enum MlLabel {
    ABUSIVE,
    NON_ABUSIVE,
    UNCATEGORIZED
}
2. Entities (Models)
File Name	Path	Content
ReportCase.java	com/vaultvoice/model/	Main Case Entity.
ThreadItem.java	com/vaultvoice/model/	Encrypted Message/File Entity.

Export to Sheets
Java

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
3. Data Transfer Objects (DTOs)
File Name	Path	Content
CaseSummaryDto.java	com/vaultvoice/dto/	Dashboard Row Data.
EncryptedBlobDto.java	com/vaultvoice/dto/	Message Payload Input.

Export to Sheets
Java

// CaseSummaryDto.java (Supports InvestigatorDashboardPage.tsx table)
package com.vaultvoice.dto;
// ... imports for Lombok ...
@Data @NoArgsConstructor @AllArgsConstructor
public class CaseSummaryDto {
    private Long id;
    private CaseStatus status;
    private MlLabel mlLabel;
    private Double mlScore;
    private Instant createdAt;

    public static CaseSummaryDto fromEntity(ReportCase entity) {
        return new CaseSummaryDto(
            entity.getId(), entity.getStatus(), entity.getMlLabel(), 
            entity.getMlScore(), entity.getCreatedAt()
        );
    }
}

// EncryptedBlobDto.java (Supports posting new messages/replies)
package com.vaultvoice.dto;
// ... imports for Lombok ...
@Data @NoArgsConstructor @AllArgsConstructor
public class EncryptedBlobDto {
    private String ciphertextBase64;
    private String nonceBase64;
    private String algo;
}
