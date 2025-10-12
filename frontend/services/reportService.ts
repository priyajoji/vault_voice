// reportService.ts
export interface Report {
  id: number;
  title: string;
  description: string;
  status: string;
}

export async function getReports(): Promise<Report[]> {
  const res = await fetch("http://localhost:8080/api/report");
  if (!res.ok) throw new Error(`Failed to fetch reports: ${res.statusText}`);
  return res.json();
}

export async function submitReport(report: Omit<Report, "id">): Promise<Report> {
  const res = await fetch("http://localhost:8080/api/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report),
  });
  if (!res.ok) throw new Error(`Failed to submit report: ${res.statusText}`);
  return res.json();
}
