import { FileBarChart2, UsersRound, Building2 } from "lucide-react";
import { FeatureCard } from "../components/ui/FeatureCard";
import { PageHeader } from "../components/ui/PageHeader";

export function AdminDashboardPage() {
  return (
    <section>
      <PageHeader eyebrow="Admin scope" title="Admin Dashboard" description="Admin portal for report generation and operational visibility without interfering with offers or users." />
      <div className="feature-grid">
        <FeatureCard code="FR-13" title="Owner Reports" description="Generate reports about owners and their property types." to="/admin/reports?type=owners" icon={UsersRound} />
        <FeatureCard code="FR-13" title="Seeker Reports" description="Generate reports about seekers and their property preferences." to="/admin/reports?type=seekers" icon={FileBarChart2} />
        <FeatureCard code="FR-13" title="Property Reports" description="Generate property reports filtered by a specific factor." to="/admin/reports?type=properties" icon={Building2} />
      </div>
    </section>
  );
}
