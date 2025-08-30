
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { CaseSummary, MlLabel } from '../types';
import StatusBadge from '../components/StatusBadge';

const InvestigatorDashboardPage: React.FC = () => {
    const [cases, setCases] = useState<CaseSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('investigatorToken');
        if (!token) {
            navigate('/investigator/login');
            return;
        }

        const fetchCases = async () => {
            try {
                const caseData = await apiService.getInvestigatorCases();
                setCases(caseData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } catch (error) {
                console.error("Failed to fetch cases", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCases();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getMlLabelColor = (label: MlLabel) => {
        switch (label) {
            case MlLabel.ABUSIVE: return 'text-red-400';
            case MlLabel.NON_ABUSIVE: return 'text-green-400';
            default: return 'text-gray-500';
        }
    };
    
    if (isLoading) {
        return <div className="text-center p-10">Loading cases...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Case Dashboard</h1>
            <div className="bg-brand-secondary shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-brand-accent">
                    <thead className="bg-brand-accent">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Case ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Submitted</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">ML Abuse Detection</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-accent">
                        {cases.map((caseItem) => (
                            <tr key={caseItem.id} className="hover:bg-brand-accent/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-brand-text">{caseItem.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary">{new Date(caseItem.createdAt).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <StatusBadge status={caseItem.status} />
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getMlLabelColor(caseItem.mlLabel)}`}>
                                    {caseItem.mlLabel.replace('_', ' ')} ({caseItem.mlScore.toFixed(2)})
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/investigator/cases/${caseItem.id}`} className="text-brand-primary hover:text-blue-400">View Case</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvestigatorDashboardPage;
