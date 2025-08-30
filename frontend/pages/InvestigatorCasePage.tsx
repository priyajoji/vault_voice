import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { CaseDetails, ThreadItem, CaseStatus, ThreadItemSender, EncryptedBlob } from '../types';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import { cryptoService } from '../services/cryptoService';

const InvestigatorCasePage: React.FC = () => {
    const { caseId } = useParams<{ caseId: string }>();
    const navigate = useNavigate();
    
    const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDecrypted, setIsDecrypted] = useState(false);
    
    const [keyPassword, setKeyPassword] = useState('');
    const [caseKey, setCaseKey] = useState<CryptoKey | null>(null);
    const [decryptedThread, setDecryptedThread] = useState<ThreadItem[]>([]);
    
    const [newMessage, setNewMessage] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        if (!caseId) return;

        const fetchCase = async () => {
            setIsLoading(true);
            try {
                const data = await apiService.getInvestigatorCaseDetails(caseId);
                if (data) {
                    setCaseDetails(data);
                    setDecryptedThread(data.thread); // Initially show encrypted stubs
                } else {
                    setError('Case not found.');
                }
            } catch (err) {
                setError('Failed to fetch case details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCase();
    }, [caseId]);
    
    const handleDecryptCase = async () => {
        // MOCK: In a real app, this would be a complex flow:
        // 1. Fetch investigator's encrypted private key.
        // 2. Decrypt it using `keyPassword`.
        // 3. Use the private key to decrypt `caseDetails.caseKeyForInvestigator`.
        // 4. Import the decrypted case key as a `CryptoKey`.
        if (keyPassword === 'investigator-key-pass') {
             // For simulation, we generate a mock key.
             const tempKey = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
             setCaseKey(tempKey);

             // MOCK: "Decrypt" the thread
             const thread = caseDetails!.thread.map(item => ({...item, decryptedContent: `[Investigator Decrypted] Mock content for item ${item.id}`}));
             setDecryptedThread(thread);
             setIsDecrypted(true);
        } else {
            alert('Incorrect key password.');
        }
    };
    
    const handlePostMessage = async () => {
        if (!newMessage.trim() || !caseKey || !caseId) return;
        setIsPosting(true);
        try {
             const nonce = window.crypto.getRandomValues(new Uint8Array(12));
             const ciphertext = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, caseKey, new TextEncoder().encode(newMessage));
             
             const blob: EncryptedBlob = {
                 ciphertextBase64: cryptoService.arrayBufferToBase64(ciphertext),
                 nonceBase64: cryptoService.arrayBufferToBase64(nonce.buffer),
                 algo: 'AES-GCM'
             };
             
             const newItem = await apiService.postMessage(caseDetails!.sessionId, blob, ThreadItemSender.INVESTIGATOR);
             setDecryptedThread(prev => [...prev, {...newItem, decryptedContent: newMessage}]);
             setNewMessage('');

        } catch (err) {
            console.error(err);
        } finally {
            setIsPosting(false);
        }
    };
    
    const handleStatusChange = async (newStatus: CaseStatus) => {
        if (!caseId || !caseDetails) return;
        await apiService.updateCaseStatus(caseId, newStatus);
        setCaseDetails(prev => prev ? {...prev, status: newStatus} : null);
    }

    if (isLoading) return <div className="text-center p-10">Loading case details...</div>;
    if (error) return <div className="text-center text-red-400 p-10">{error}</div>;
    if (!caseDetails) return null;

    if (!isDecrypted) {
        return (
            <div className="max-w-md mx-auto text-center bg-brand-secondary p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Unlock Case</h2>
                <p className="text-brand-text-secondary mb-6">Enter your key-password to decrypt your private key and access the case contents.</p>
                 <input
                        type="password"
                        value={keyPassword}
                        onChange={(e) => setKeyPassword(e.target.value)}
                        className="mt-1 block w-full bg-brand-dark border border-brand-accent rounded-md shadow-sm py-2 px-3 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary mb-4"
                        placeholder="Enter key password (investigator-key-pass)"
                    />
                <Button onClick={handleDecryptCase}>Unlock and Decrypt</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
             <div className="bg-brand-secondary p-6 rounded-lg shadow-lg mb-6">
                 <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">Case Details</h1>
                        <p className="font-mono text-sm text-brand-text-secondary mt-1">{caseDetails.id}</p>
                    </div>
                    <StatusBadge status={caseDetails.status} />
                 </div>
                 <div className="mt-4 border-t border-brand-accent pt-4 flex space-x-4">
                     <p>Status Actions:</p>
                     <button onClick={() => handleStatusChange(CaseStatus.IN_REVIEW)} className="text-yellow-400 hover:underline">Mark as In Review</button>
                     <button onClick={() => handleStatusChange(CaseStatus.CLOSED)} className="text-gray-400 hover:underline">Mark as Closed</button>
                 </div>
             </div>
             
             <div className="bg-brand-secondary p-4 rounded-lg shadow-lg">
                 <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                     {decryptedThread.map(item => (
                         <div key={item.id} className={`flex ${item.sender === ThreadItemSender.INVESTIGATOR ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-md p-3 rounded-lg ${item.sender === ThreadItemSender.INVESTIGATOR ? 'bg-brand-primary' : 'bg-brand-accent'}`}>
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
                         placeholder="Type your secure reply..."
                     />
                     <div className="text-right mt-2">
                         <Button onClick={handlePostMessage} isLoading={isPosting}>Send Reply</Button>
                     </div>
                 </div>
             </div>
        </div>
    );
};

export default InvestigatorCasePage;