import { useEffect, useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { amanApi } from "../api/amanApi";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { deals } from "../types/aman";

export function DealsPage() {
  const [deals, setDeals] = useState<deals[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    amanApi.deals().then(setDeals);
  }, []);

  async function completeDeal(dealId: number) {
    const result = await amanApi.updateDealStatus(dealId, "Completed");
    setMessage(result.message);
  }

  return (
    <section>
      <PageHeader eyebrow="FR-12 / UC-12" title="Deals" description="Seeker deal requests, owner review, status tracking, completion, and rating." />
      {message ? <p className="notice">{message}</p> : null}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Deal</th><th>Property</th><th>Status</th><th>Created</th><th>Rating</th><th>Action</th></tr></thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal.deal_id}>
                <td>#{deal.deal_id}</td>
                <td>{deal.property_title}</td>
                <td><StatusBadge status={deal.status} /></td>
                <td>{deal.created_at}</td>
                <td>{deal.rating ? <span className="rating"><Star size={16} />{deal.rating}</span> : "Not rated"}</td>
                <td><button className="icon-button" type="button" title="Confirm deal" onClick={() => completeDeal(deal.deal_id)}><CheckCircle2 size={18} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
