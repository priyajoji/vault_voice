
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { apiService } from '../services/apiService';

const InvestigatorLoginPage: React.FC = () => {
    const [username, setUsername] = useState('investigator');
    const [password, setPassword] = useState('password123');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await apiService.investigatorLogin(username, password);

        if (result) {
            // In a real app, store token securely (e.g., httpOnly cookie)
            // For this demo, using localStorage is fine.
            localStorage.setItem('investigatorToken', result.token);
            localStorage.setItem('investigatorName', result.name);
            navigate('/investigator/cases');
        } else {
            setError('Invalid username or password.');
        }

        setIsLoading(false);
    };

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Investigator Portal</h1>
            <form onSubmit={handleLogin} className="bg-brand-secondary p-8 rounded-lg shadow-lg space-y-6">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-brand-text-secondary">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 block w-full bg-brand-dark border border-brand-accent rounded-md shadow-sm py-2 px-3 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-brand-text-secondary">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full bg-brand-dark border border-brand-accent rounded-md shadow-sm py-2 px-3 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        required
                    />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <div>
                    <Button type="submit" isLoading={isLoading} className="w-full">
                        Sign In
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default InvestigatorLoginPage;
