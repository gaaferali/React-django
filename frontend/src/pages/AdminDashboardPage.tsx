import { FileBarChart2, UsersRound, Building2 } from "lucide-react";
import { FeatureCard } from "../components/ui/FeatureCard";
import { PageHeader } from "../components/ui/PageHeader";

export function AdminDashboardPage() {
  return (
    <section>
      <PageHeader eyebrow="Admin scope" title="Admin Dashboard" description="Admin portal for report generation and operational visibility without interfering with offers or users." />
      <div className="feature-grid">
        <FeatureCard code="FR-13" title="Owner Reports" description="Review owners and the number of listings they manage." to="/admin/reports?type=owners" icon={UsersRound} />
        <FeatureCard code="FR-13" title="Seeker Reports" description="Review seekers and their deal activity." to="/admin/reports?type=seekers" icon={FileBarChart2} />
        <FeatureCard code="FR-13" title="Property Reports" description="Review property inventory grouped by city and property type." to="/admin/reports?type=properties" icon={Building2} />
      </div>
    </section>
  );
}
