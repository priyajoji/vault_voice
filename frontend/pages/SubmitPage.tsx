import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const SubmitPage: React.FC = () => {
  const [report, setReport] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!report.trim() || !passphrase.trim()) {
      setError("Please fill out both the report and passphrase fields.");
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Use a unique title to ensure each report is distinct
      const title = `Anonymous Report ${Date.now()}`;

      const response = await fetch('http://localhost:8080/api/report/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: report,
          status: 'NEW',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit report: ${response.status}`);
      }

      const savedReport = await response.json();
      console.log('Report saved:', savedReport);

      setConfirmation(`Report submitted successfully! ID: ${savedReport.id}`);
      setReport('');
      setPassphrase('');

    } catch (err: any) {
      console.error('SubmitPage error:', err);
      setError('Failed to submit report. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (confirmation) {
    return (
      <div className="max-w-2xl mx-auto bg-brand-secondary p-8 rounded-lg shadow-xl text-center">
        <h2 className="text-2xl font-bold text-green-400 mb-4">{confirmation}</h2>
        <Button onClick={() => { setConfirmation(null); navigate('/followup'); }} className="mt-6 w-full">
          Go to Follow-Up Page
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Submit a New Anonymous Report</h1>
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
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div>
          <Button type="submit" isLoading={isLoading} className="w-full">
            Submit Report
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SubmitPage;

