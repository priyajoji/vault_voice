import React, { useState } from 'react';
import Button from '../components/Button';
import { apiService } from '../services/apiService';
import { cryptoService } from '../services/cryptoService';
import { dbService } from '../services/dbService';
import { ThreadItem, CaseStatus, ThreadItemSender, EncryptedBlob } from '../types';
import StatusBadge from '../components/StatusBadge';

const FollowupPage: React.FC = () => {
    const [sessionId, setSessionId] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [caseKey, setCaseKey] = useState<CryptoKey | null>(null);
    const [thread, setThread] = useState<ThreadItem[]>([]);
    const [status, setStatus] = useState<CaseStatus | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setThread([]);

        try {
            // 1. Get encrypted case key from IndexedDB
            const keyData = await dbService.getEncryptedCaseKey(sessionId);
            if (!keyData) {
                throw new Error("Session ID not found or this case was not created on this browser.");
            }
            
            // 2. Decrypt the case key
            const salt = cryptoService.base64ToArrayBuffer(keyData.saltBase64);
            const encryptionKey = await cryptoService.deriveKeyFromPassword(passphrase, new Uint8Array(salt));
            const encryptedKey = cryptoService.base64ToArrayBuffer(keyData.encryptedKeyBase64);
            const keyNonce = cryptoService.base64ToArrayBuffer(keyData.nonceBase64);

            const exportedKeyAb = await cryptoService.decryptAesGcm(encryptedKey, new Uint8Array(keyNonce), encryptionKey);
            const exportedKeyStr = cryptoService.textDecoder.decode(exportedKeyAb);
            const decryptedCaseKey = await cryptoService.importKey(exportedKeyStr);
            setCaseKey(decryptedCaseKey);

            // 3. Fetch encrypted thread
            const { thread: encryptedThread, status: caseStatus } = await apiService.getCaseThread(sessionId);

            // 4. Decrypt thread messages
            const decryptedThreadPromises = encryptedThread.map(async (item) => {
                const ciphertext = cryptoService.base64ToArrayBuffer(item.blob.ciphertextBase64);
                const itemNonce = cryptoService.base64ToArrayBuffer(item.blob.nonceBase64);
                try {
                    const decryptedContentAb = await cryptoService.decryptAesGcm(ciphertext, new Uint8Array(itemNonce), decryptedCaseKey);
                    // This is a mock; in reality, we can't get decrypted content from the mock API this way.
                    // We'll simulate by displaying a success message.
                    const realDecryptedContent = item.decryptedContent || `[Decrypted] Mock content for ${item.id}.`;
                    return { ...item, decryptedContent: realDecryptedContent };
                } catch (e) {
                    console.error("Failed to decrypt thread item:", item.id, e);
                    return { ...item, decryptedContent: "[DECRYPTION FAILED]" };
                }
            });

            const decryptedThread = await Promise.all(decryptedThreadPromises);
            
            setThread(decryptedThread);
            setStatus(caseStatus);

        } catch (err: any) {
            setError(err.message || 'Failed to access case. Please check your Session ID and passphrase.');
             if (err.name === 'OperationError') {
                setError("Decryption failed. The passphrase is likely incorrect.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostMessage = async () => {
        if (!newMessage.trim() || !caseKey) return;
        setIsPosting(true);
        try {
            const { ciphertext, nonce } = await cryptoService.encryptAesGcm(newMessage, caseKey);
            const messageBlob: EncryptedBlob = {
                ciphertextBase64: cryptoService.arrayBufferToBase64(ciphertext),
                nonceBase64: cryptoService.arrayBufferToBase64(nonce.buffer),
                algo: 'AES-GCM',
            };
            const postedItem = await apiService.postMessage(sessionId, messageBlob, ThreadItemSender.WHISTLEBLOWER);
            
            const newItem: ThreadItem = {
                ...postedItem,
                decryptedContent: newMessage
            };

            setThread(prev => [...prev, newItem]);
            setNewMessage('');

        } catch (err) {
            setError("Failed to send message.");
        } finally {
            setIsPosting(false);
        }
    };

    if (caseKey && status) {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Case Follow-Up</h1>
                    <StatusBadge status={status} />
                </div>
                <div className="bg-brand-secondary p-4 rounded-lg shadow-lg">
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {thread.map(item => (
                            <div key={item.id} className={`flex ${item.sender === ThreadItemSender.WHISTLEBLOWER ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-md p-3 rounded-lg ${item.sender === ThreadItemSender.WHISTLEBLOWER ? 'bg-brand-primary' : 'bg-brand-accent'}`}>
                                    <p className="text-sm text-white whitespace-pre-wrap">{item.decryptedContent as string}</p>
                                    <p className="text-xs text-right mt-1 opacity-70">{new Date(item.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-brand-accent">
                        <textarea
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            rows={3}
                            className="w-full bg-brand-dark border border-brand-accent rounded-md p-2 text-brand-text focus:outline-none focus:ring-brand-primary"
                            placeholder="Type your secure message..."
                        />
                        <div className="text-right mt-2">
                            <Button onClick={handlePostMessage} isLoading={isPosting}>Send Message</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Access Your Case</h1>
            <form onSubmit={handleLogin} className="bg-brand-secondary p-8 rounded-lg shadow-lg space-y-6">
                <div>
                    <label htmlFor="sessionId" className="block text-sm font-medium text-brand-text-secondary">
                        Session ID
                    </label>
                    <input
                        type="text"
                        id="sessionId"
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value)}
                        className="mt-1 block w-full bg-brand-dark border border-brand-accent rounded-md shadow-sm py-2 px-3 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        placeholder="Enter your unique session ID"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="passphrase" className="block text-sm font-medium text-brand-text-secondary">
                        Passphrase
                    </label>
                    <input
                        type="password"
                        id="passphrase"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        className="mt-1 block w-full bg-brand-dark border border-brand-accent rounded-md shadow-sm py-2 px-3 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        placeholder="Your case passphrase"
                        required
                    />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <div>
                    <Button type="submit" isLoading={isLoading} className="w-full">
                        Decrypt and Access Case
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default FollowupPage;