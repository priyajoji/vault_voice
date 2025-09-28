// ReportCaseRepository.java
package com.vaultvoice.repository;
// ... imports for JPA ...
public interface ReportCaseRepository extends JpaRepository<ReportCase, Long> {
    Optional<ReportCase> findBySessionId(String sessionId);
}

// ThreadItemRepository.java
package com.vaultvoice.repository;
// ... imports for JPA ...
public interface ThreadItemRepository extends JpaRepository<ThreadItem, Long> {
    // Custom queries can be added here if needed, but standard CRUD is enough initially
}
