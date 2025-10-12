import React, { useEffect, useState } from "react";
import { getReports, submitReport, Report } from "../services/reportService";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    getReports().then(setReports).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newReport = await submitReport({ title, description, status: "NEW" });
    setReports([...reports, newReport]);
    setTitle("");
    setDescription("");
  };

  return (
    <div>
      <h1>Reports</h1>

      <form onSubmit={handleSubmit}>
        <input value={title} placeholder="Title" onChange={(e) => setTitle(e.target.value)} required />
        <textarea value={description} placeholder="Description" onChange={(e) => setDescription(e.target.value)} required />
        <button type="submit">Submit</button>
      </form>

      <ul>
        {reports.map((r) => (
          <li key={r.id}>
            <b>{r.title}</b> - {r.description} [{r.status}]
          </li>
        ))}
      </ul>
    </div>
  );
}
