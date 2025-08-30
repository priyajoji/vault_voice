
import { CaseSummary, CaseDetails, CaseStatus, MlLabel, EncryptedBlob, ThreadItem, ThreadItemSender, ThreadItemType } from '../types';

// This is a mock service. In a real application, it would make HTTP requests.

const mockInvestigatorPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy8Dbv8prpJ/h3hJ9+vE/
T3B8L5B5T3E2G8D0C9Z5N3F8Q3E2G8D0C9Z5N3F8Q3E2G8D0C9Z5N3F8Q3E2G8D0
C9Z5N3F8Q3E2G8D0C9Z5N3F8Q3E2G8D0C9Z5N3F8Q3E2G8D0C9Z5N3F8Q3E2G8D0
C9Z5N3F8Q3E2G8D0C9Z5N3F8Q3E2G8D0C9Z5N3F8Q3E2G8D0C9Z5N3F8Q3E2G8D0
C9Z5N3F8Q3E2G8D0C9Z5N3F8Q3E2G8D0C9Z5N3F8Q3E2G8D0C9Z5N3F8Q3E2G8D0
C9Z5N3F8Q3E2G8D0C9Z5N3F8Q3E2G8D0C9Z5N3F8Q3E2G8D0C9Z5N3F8Q3E2G8D0
C9Z5N3F8Q3E2G8D0C9Z5N3F8Q3E2G8D0CAwEAAQ==
-----END PUBLIC KEY-----`;

let mockCases: { [sessionId: string]: CaseDetails } = {
    'existing-case-123': {
        id: 'case-001',
        sessionId: 'existing-case-123',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: CaseStatus.IN_REVIEW,
        mlLabel: MlLabel.NON_ABUSIVE,
        mlScore: 0.12,
        caseKeyForInvestigator: 'MOCK_RSA_ENCRYPTED_CASE_KEY_BASE64',
        thread: [
            { id: 't1', type: ThreadItemType.REPORT, createdAt: new Date(Date.now() - 86400000).toISOString(), blob: { ciphertextBase64: 'U2FsdGVkX19mockreportciphertext', nonceBase64: 'mocknonce1', algo: 'AES-GCM' }, sender: ThreadItemSender.WHISTLEBLOWER, decryptedContent: 'This is a test report about financial misconduct.' },
            { id: 't2', type: ThreadItemType.MESSAGE, createdAt: new Date(Date.now() - 43200000).toISOString(), blob: { ciphertextBase64: 'U2FsdGVkX19mockinvreplyciphertext', nonceBase64: 'mocknonce2', algo: 'AES-GCM' }, sender: ThreadItemSender.INVESTIGATOR, decryptedContent: 'Thank you for your report. We are looking into it.' }
        ]
    }
};


export const apiService = {
    createCase: async (): Promise<{ sessionId: string; investigatorPublicKeyPem: string }> => {
        await new Promise(res => setTimeout(res, 500));
        const sessionId = `session-${Math.random().toString(36).substring(2, 10)}`;
        mockCases[sessionId] = {
            id: `case-${Math.random().toString(36).substring(2, 7)}`,
            sessionId: sessionId,
            createdAt: new Date().toISOString(),
            status: CaseStatus.NEW,
            mlLabel: MlLabel.UNKNOWN,
            mlScore: 0,
            caseKeyForInvestigator: '', // Will be set by submitReport
            thread: []
        };
        return { sessionId, investigatorPublicKeyPem: mockInvestigatorPublicKey };
    },

    submitReport: async (sessionId: string, reportBlob: EncryptedBlob, wrappedCaseKey: string): Promise<void> => {
        await new Promise(res => setTimeout(res, 1000));
        if (!mockCases[sessionId]) throw new Error("Case not found");
        
        mockCases[sessionId].caseKeyForInvestigator = wrappedCaseKey;
        mockCases[sessionId].thread.push({
            id: `thread-${Math.random().toString(36).substring(2, 9)}`,
            type: ThreadItemType.REPORT,
            createdAt: new Date().toISOString(),
            blob: reportBlob,
            sender: ThreadItemSender.WHISTLEBLOWER
        });
        // Simulate ML scoring
        mockCases[sessionId].mlLabel = Math.random() > 0.8 ? MlLabel.ABUSIVE : MlLabel.NON_ABUSIVE;
        mockCases[sessionId].mlScore = Math.random();
        
        console.log('Mock report submitted for session:', sessionId);
    },

    getCaseThread: async (sessionId: string): Promise<{thread: ThreadItem[], status: CaseStatus}> => {
        await new Promise(res => setTimeout(res, 500));
        if (!mockCases[sessionId]) throw new Error("Case not found");
        // Return blobs without decrypted content
        const thread = mockCases[sessionId].thread.map(item => ({...item, decryptedContent: undefined}));
        return { thread, status: mockCases[sessionId].status };
    },

    postMessage: async (sessionId: string, messageBlob: EncryptedBlob, sender: ThreadItemSender): Promise<ThreadItem> => {
        await new Promise(res => setTimeout(res, 500));
        if (!mockCases[sessionId]) throw new Error("Case not found");

        const newItem: ThreadItem = {
            id: `thread-${Math.random().toString(36).substring(2, 9)}`,
            type: ThreadItemType.MESSAGE,
            createdAt: new Date().toISOString(),
            blob: messageBlob,
            sender: sender
        };

        mockCases[sessionId].thread.push(newItem);
        return {...newItem, decryptedContent: undefined};
    },

    // Investigator APIs
    investigatorLogin: async (user: string, pass: string): Promise<{ token: string; name: string } | null> => {
        await new Promise(res => setTimeout(res, 500));
        if (user === 'investigator' && pass === 'password123') {
            return { token: 'mock-jwt-token', name: 'Alex Doe' };
        }
        return null;
    },

    getInvestigatorCases: async (): Promise<CaseSummary[]> => {
        await new Promise(res => setTimeout(res, 800));
        return Object.values(mockCases).map(({id, sessionId, createdAt, status, mlLabel, mlScore}) => ({
            id, sessionId, createdAt, status, mlLabel, mlScore
        }));
    },

    getInvestigatorCaseDetails: async(caseId: string): Promise<CaseDetails | null> => {
        await new Promise(res => setTimeout(res, 500));
        const foundCase = Object.values(mockCases).find(c => c.id === caseId);
        if(!foundCase) return null;
        
        // Return blobs without decrypted content
        const thread = foundCase.thread.map(item => ({...item, decryptedContent: undefined}));
        return {...foundCase, thread};
    },
    
    updateCaseStatus: async(caseId: string, status: CaseStatus): Promise<void> => {
        await new Promise(res => setTimeout(res, 300));
        const foundCase = Object.values(mockCases).find(c => c.id === caseId);
        if(foundCase) {
           const sessionCase = mockCases[foundCase.sessionId];
           if(sessionCase) {
             sessionCase.status = status;
           }
        }
    }
};
