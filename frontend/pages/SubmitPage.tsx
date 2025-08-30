import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { apiService } from '../services/apiService';
import { cryptoService } from '../services/cryptoService';
import { dbService } from '../services/dbService';
import { EncryptedBlob } from '../types';

const SubmitPage: React.FC = () => {
    const [report, setReport] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!report.trim() || !passphrase.trim()) {
            setError('Please fill out both the report and passphrase fields.');
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            // 1. Create a new case to get session ID and investigator's public key
            const { sessionId, investigatorPublicKeyPem } = await apiService.createCase();

            // 2. Generate a new AES-GCM key for this case
            const caseKey = await cryptoService.generateAesKey();

            // 3. Encrypt the report using the case key
            const { ciphertext, nonce } = await cryptoService.encryptAesGcm(report, caseKey);
            const reportBlob: EncryptedBlob = {
                ciphertextBase64: cryptoService.arrayBufferToBase64(ciphertext),
                nonceBase64: cryptoService.arrayBufferToBase64(nonce.buffer),
                algo: 'AES-GCM',
            };
            
            // 4. Encrypt the case key for the investigator
            const exportedCaseKey = await cryptoService.exportKey(caseKey);
            const exportedCaseKeyBuffer = cryptoService.base64ToArrayBuffer(exportedCaseKey);
            const encryptedCaseKeyForInv = await cryptoService.encryptWithRsaPublicKey(exportedCaseKeyBuffer, investigatorPublicKeyPem);
            const wrappedCaseKey = cryptoService.arrayBufferToBase64(encryptedCaseKeyForInv);

            // 5. Submit the encrypted report and wrapped case key
            await apiService.submitReport(sessionId, reportBlob, wrappedCaseKey);

            // 6. Encrypt the case key with user's passphrase for local storage
            const salt = window.crypto.getRandomValues(new Uint8Array(16));
            const encryptionKey = await cryptoService.deriveKeyFromPassword(passphrase, salt);
            const { ciphertext: encryptedCaseKey, nonce: keyNonce } = await cryptoService.encryptAesGcm(exportedCaseKey, encryptionKey);

            const encryptedKeyData = {
                encryptedKeyBase64: cryptoService.arrayBufferToBase64(encryptedCaseKey),
                saltBase64: cryptoService.arrayBufferToBase64(salt.buffer),
                nonceBase64: cryptoService.arrayBufferToBase64(keyNonce.buffer),
            };

            await dbService.saveEncryptedCaseKey(sessionId, encryptedKeyData);
            
            setSessionId(sessionId);
        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const copyToClipboard = () => {
        if(sessionId) {
            navigator.clipboard.writeText(sessionId);
            alert('Session ID copied to clipboard!');
        }
    }

    if (sessionId) {
        return (
            <div className="max-w-2xl mx-auto bg-brand-secondary p-8 rounded-lg shadow-xl text-center">
                <h2 className="text-2xl font-bold text-green-400 mb-4">Report Submitted Successfully</h2>
                <p className="text-brand-text-secondary mb-4">
                    Please save your unique Session ID. You will need it, along with your passphrase, to follow up on your case.
                </p>
                <div className="bg-brand-dark p-4 rounded-md mb-4 flex items-center justify-between">
                    <code className="text-lg text-yellow-300 break-all">{sessionId}</code>
                    <button onClick={copyToClipboard} className="ml-4 p-2 rounded-md hover:bg-brand-accent transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                </div>
                <div className="bg-yellow-900 border-l-4 border-yellow-500 text-yellow-200 p-4 rounded-md" role="alert">
                    <p className="font-bold">Important Security Notice</p>
                    <p>This is the ONLY time your Session ID will be displayed. Store it in a safe place. We cannot recover it for you.</p>
                </div>
                 <Button onClick={() => navigate('/followup')} className="mt-6 w-full">Go to Follow-Up Page</Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Submit a New Anonymous Report</h1>
            <form onSubmit={handleSubmit} className="bg-brand-secondary p-8 rounded-lg shadow-lg space-y-6">
                <div>
                    <label htmlFor="report" className="block text-sm font-medium text-brand-text-secondary">
                        Your Report
                    </label>
                    <textarea
                        id="report"
                        value={report}
                        onChange={(e) => setReport(e.target.value)}
                        rows={10}
                        className="mt-1 block w-full bg-brand-dark border border-brand-accent rounded-md shadow-sm py-2 px-3 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        placeholder="Provide a detailed account of the events. Include dates, names, and any other relevant information."
                        required
                    />
                </div>
                <div>
                    <label htmlFor="passphrase" className="block text-sm font-medium text-brand-text-secondary">
                        Create a Passphrase
                    </label>
                    <input
                        type="password"
                        id="passphrase"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        className="mt-1 block w-full bg-brand-dark border border-brand-accent rounded-md shadow-sm py-2 px-3 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        placeholder="A strong passphrase to secure your case"
                        required
                    />
                    <p className="mt-2 text-xs text-brand-text-secondary">
                        This passphrase encrypts your case key in your browser. It is essential for follow-up and cannot be recovered.
                    </p>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div>
                    <Button type="submit" isLoading={isLoading} className="w-full">
                        Encrypt and Submit Report
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SubmitPage;