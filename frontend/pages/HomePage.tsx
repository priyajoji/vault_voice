
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const HomePage: React.FC = () => {
    return (
        <div className="text-center py-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-text leading-tight">
                Speak Up. Stay <span className="text-brand-primary">Secure</span>.
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-brand-text-secondary">
                Vault Voice is a secure and anonymous whistleblower platform. Your identity is protected by end-to-end encryption, ensuring your report can only be read by authorized investigators.
            </p>
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
                <Link to="/submit">
                    <Button variant="primary" className="text-lg px-8 py-3">Submit a New Report</Button>
                </Link>
                <Link to="/followup">
                    <Button variant="secondary" className="text-lg px-8 py-3">Follow Up on a Case</Button>
                </Link>
            </div>
            <div className="mt-16 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-brand-secondary p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-brand-text mb-2">Total Anonymity</h3>
                    <p className="text-brand-text-secondary">No accounts, no personal information required. Your communication is tied to a unique, secure session ID that only you control.</p>
                </div>
                <div className="bg-brand-secondary p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-brand-text mb-2">End-to-End Encryption</h3>
                    <p className="text-brand-text-secondary">All data, including messages and files, is encrypted on your device before it's sent. We never have access to your unencrypted information.</p>
                </div>
                <div className="bg-brand-secondary p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-brand-text mb-2">Secure Follow-Up</h3>
                    <p className="text-brand-text-secondary">Use your session ID and passphrase to securely check for updates and communicate with investigators without revealing your identity.</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
