
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SubmitPage from './pages/SubmitPage';
import FollowupPage from './pages/FollowupPage';
import InvestigatorLoginPage from './pages/InvestigatorLoginPage';
import InvestigatorDashboardPage from './pages/InvestigatorDashboardPage';
import InvestigatorCasePage from './pages/InvestigatorCasePage';
import ReportsPage from "./pages/ReportsPage";





const Header: React.FC = () => {
    const location = useLocation();
    const isInvestigatorArea = location.pathname.startsWith('/investigator');

    return (
        <header className="bg-brand-secondary shadow-md">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-brand-primary">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Vault Voice
                    </div>
                </Link>
                <div>
                    {!isInvestigatorArea && (
                        <>
                            <Link to="/submit" className="px-4 py-2 text-brand-text hover:text-brand-primary transition-colors duration-200">Submit Report</Link>
                            <Link to="/followup" className="px-4 py-2 text-brand-text hover:text-brand-primary transition-colors duration-200">Follow Up</Link>
                        </>
                    )}
                     <Link to="/investigator/login" className="ml-4 px-4 py-2 bg-brand-accent rounded-md text-brand-text hover:bg-gray-600 transition-colors duration-200">Investigator Portal</Link>
                </div>
            </nav>
        </header>
    );
};

const Footer: React.FC = () => (
    <footer className="bg-brand-secondary mt-auto py-4">
        <div className="container mx-auto px-6 text-center text-brand-text-secondary text-sm">
            <p>&copy; {new Date().getFullYear()} Vault Voice. All rights reserved.</p>
            <p className="mt-1">Your security and anonymity are our highest priority.</p>
        </div>
    </footer>
);


function App() {
  return <ReportsPage />;
  return (
    <HashRouter>
        <div className="min-h-screen flex flex-col bg-brand-dark">
            <Header />
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/submit" element={<SubmitPage />} />
                    <Route path="/followup" element={<FollowupPage />} />
                    <Route path="/investigator/login" element={<InvestigatorLoginPage />} />
                    <Route path="/investigator/cases" element={<InvestigatorDashboardPage />} />
                    <Route path="/investigator/cases/:caseId" element={<InvestigatorCasePage />} />
                </Routes>
            </main>
            <Footer />
        </div>
    </HashRouter>
  );
}

export default App;
