
export interface EncryptedBlob {
    ciphertextBase64: string;
    nonceBase64: string;
    algo: 'AES-GCM';
}

export enum CaseStatus {
    NEW = 'NEW',
    IN_REVIEW = 'IN_REVIEW',
    CLOSED = 'CLOSED',
}

export enum MlLabel {
    ABUSIVE = 'abusive',
    NON_ABUSIVE = 'non_abusive',
    UNKNOWN = 'unknown',
}

export interface CaseSummary {
    id: string;
    sessionId: string;
    createdAt: string;
    status: CaseStatus;
    mlLabel: MlLabel;
    mlScore: number;
}

export enum ThreadItemSender {
    WHISTLEBLOWER = 'WB',
    INVESTIGATOR = 'INV',
}

export enum ThreadItemType {
    REPORT = 'report',
    MESSAGE = 'message',
    ATTACHMENT = 'attachment',
}

export interface ThreadItem {
    id: string;
    type: ThreadItemType;
    createdAt: string;
    blob: EncryptedBlob;
    sender: ThreadItemSender;
    filename?: string;
    decryptedContent?: string | ArrayBuffer;
}

export interface CaseDetails extends CaseSummary {
    caseKeyForInvestigator: string; // RSA-encrypted case key in Base64
    thread: ThreadItem[];
}
