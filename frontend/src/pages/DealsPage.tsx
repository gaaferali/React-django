import { useEffect, useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { amanApi } from "../api/amanApi";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { deals } from "../types/aman";

export function DealsPage() {
  const [deals, setDeals] = useState<deals[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [ratings, setRatings] = useState<Record<number, number>>({});

  useEffect(() => {
    amanApi
      .deals()
      .then(setDeals)
      .catch((apiError) =>
        setError(apiError instanceof Error ? apiError.message : "Failed to load deals.")
      );
  }, []);

  function replaceDeal(updatedDeal: deals) {
    setDeals((current) =>
      current.map((deal) =>
        deal.deal_id === updatedDeal.deal_id ? updatedDeal : deal
      )
    );
  }

  async function changeStatus(dealId: number, status: "Completed" | "Rejected") {
    try {
      const result = await amanApi.updateDealStatus(dealId, status);
      setMessage(result.message);
      setError("");
      replaceDeal(result.deal);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Deal update failed.");
    }
  }

  async function rateDeal(dealId: number) {
    try {
      const result = await amanApi.rateDeal(dealId, ratings[dealId] ?? 5);
      setMessage(result.message);
      setError("");
      replaceDeal(result.deal);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Rating failed.");
    }
  }

  const role = localStorage.getItem("role");

  return (
    <section>
      <PageHeader eyebrow="FR-12 / UC-12" title="Deals" description="Seeker deal requests, owner review, status tracking, completion, and rating." />
      {message ? <p className="notice">{message}</p> : null}
      {error ? <p className="notice danger">{error}</p> : null}
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
                <td>
                  {role === "Owner" && deal.status === "Requested" ? (
                    <>
                      <button className="icon-button" type="button" title="Complete deal" onClick={() => changeStatus(deal.deal_id, "Completed")}><CheckCircle2 size={18} /></button>
                      <button className="button secondary" type="button" onClick={() => changeStatus(deal.deal_id, "Rejected")}>Reject</button>
                    </>
                  ) : null}
                  {role === "Seeker" && deal.status === "Completed" && !deal.rating ? (
                    <>
                      <select
                        aria-label={`Rating for deal ${deal.deal_id}`}
                        value={ratings[deal.deal_id] ?? 5}
                        onChange={(event) =>
                          setRatings((current) => ({
                            ...current,
                            [deal.deal_id]: Number(event.target.value),
                          }))
                        }
                      >
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <option key={rating} value={rating}>{rating}</option>
                        ))}
                      </select>
                      <button className="button secondary" type="button" onClick={() => rateDeal(deal.deal_id)}>Rate</button>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
