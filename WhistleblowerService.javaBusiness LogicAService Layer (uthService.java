// WhistleblowerService.java (Handles initial submission)
package com.vaultvoice.service;
// ... imports for DTOs, Models, Repositories, PasswordEncoder ...
@Service
public class WhistleblowerService {
    private final ReportCaseRepository caseRepository;
    private final PasswordEncoder passwordEncoder;

    // ... Constructor injection ...

    @Transactional
    public ReportCase submitNewReport(ReportSubmissionDto submissionDto) {
        // 1. Create unique credentials
        String sessionId = generateUniqueSessionId(); // Custom utility
        String passphraseHash = passwordEncoder.encode(submissionDto.getPassphrase());

        ReportCase newCase = new ReportCase();
        newCase.setSessionId(sessionId);
        newCase.setPassphraseHash(passphraseHash);
        newCase.setCaseKeyForInvestigator(submissionDto.getEncryptedCaseKey());
        
        // 2. Save the case
        ReportCase savedCase = caseRepository.save(newCase);

        // 3. Save the initial message as a ThreadItem
        // threadRepository.save(new ThreadItem(... sender: WHISTLEBLOWER));

        return savedCase;
    }
}

// AuthService.java (Handles Investigator Login)
package com.vaultvoice.service;
// ... imports for DTOs, JwtTokenProvider, UserDetails, AuthenticationManager ...
@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    // ... Constructor injection ...

    public LoginResponse investigatorLogin(String username, String password) {
        // 1. Authenticate using Spring Security
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(username, password)
        );
        
        // 2. Get user details and generate token
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);
        
        // Assuming the UserDetails object contains the name
        String name = ((User) authentication.getPrincipal()).getName(); 
        
        return new LoginResponse(token, name); // Supports InvestigatorLoginPage.tsx
    }
}
