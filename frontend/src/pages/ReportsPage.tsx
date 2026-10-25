import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { amanApi } from "../api/amanApi";
import { PageHeader } from "../components/ui/PageHeader";
import type { ReportRow, ReportType } from "../types/aman";

export function ReportsPage() {
  const [params, setParams] = useSearchParams();
  const requestedType = params.get("type");
  const selectedType: ReportType = ["owners", "seekers", "properties"].includes(
    requestedType ?? ""
  )
    ? (requestedType as ReportType)
    : "owners";
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    amanApi
      .reports(selectedType)
      .then((result) => {
        setRows(result);
        setError("");
      })
      .catch((apiError) =>
        setError(apiError instanceof Error ? apiError.message : "Failed to load report.")
      );
  }, [selectedType]);

  return (
    <section>
      <PageHeader eyebrow="FR-13 / UC-13" title="Reports" description="Admin reports dashboard for owner, seeker, and property report generation." />
      <div className="segmented-control" role="tablist" aria-label="Report type">
        {(["owners", "seekers", "properties"] as ReportType[]).map((type) => (
          <button key={type} className={selectedType === type ? "active" : ""} type="button" onClick={() => setParams({ type })}>{type}</button>
        ))}
      </div>
      {error ? <p className="notice danger">{error}</p> : null}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Report item</th><th>Type</th><th>City</th><th>Total</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}><td>{row.label}</td><td>{row.type}</td><td>{row.city}</td><td>{row.total}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
