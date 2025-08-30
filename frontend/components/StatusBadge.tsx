
import React from 'react';
import { CaseStatus } from '../types';

interface StatusBadgeProps {
    status: CaseStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const statusStyles: Record<CaseStatus, { text: string; bg: string; dot: string }> = {
        [CaseStatus.NEW]: { text: 'text-blue-300', bg: 'bg-blue-900', dot: 'bg-blue-400' },
        [CaseStatus.IN_REVIEW]: { text: 'text-yellow-300', bg: 'bg-yellow-900', dot: 'bg-yellow-400' },
        [CaseStatus.CLOSED]: { text: 'text-gray-400', bg: 'bg-gray-700', dot: 'bg-gray-500' },
    };

    const styles = statusStyles[status];

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}>
            <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${styles.dot}`} fill="currentColor" viewBox="0 0 8 8">
                <circle cx={4} cy={4} r={3} />
            </svg>
            {status.replace('_', ' ')}
        </span>
    );
};

export default StatusBadge;
