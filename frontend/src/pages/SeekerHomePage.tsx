import { Calculator, HeartHandshake, MessageSquare, Search, Sparkles, UserRoundCog } from "lucide-react";
import { FeatureCard } from "../components/ui/FeatureCard";
import { PageHeader } from "../components/ui/PageHeader";

export function SeekerHomePage() {
  return (
    <section>
      <PageHeader eyebrow="Seeker scope" title="Seeker Home" description="Search verified property offers, view recommendations, calculate fair prices, contact owners, and start deals." />
      <div className="feature-grid">
        <FeatureCard code="FR-06" title="Search for Property" description="Search by transaction, type, state, city, bedrooms, bathrooms, and price range." to="/seeker/search-for-property" icon={Search} />
        <FeatureCard code="FR-09" title="Offer Recommendation" description="Save preferences and receive matched property notifications." to="/seeker/offer-recommendation" icon={Sparkles} />
        <FeatureCard code="FR-10" title="Fair Price Average" description="Calculate average prices from similar listings in the same city." to="/seeker/fair-price-average" icon={Calculator} />
        <FeatureCard code="FR-12" title="Deals" description="Send requests, review status, complete deals, and rate users." to="/deals" icon={HeartHandshake} />
        <FeatureCard code="FR-11" title="Contact" description="Message owners directly from an active property offer." to="/contact" icon={MessageSquare} />
        <FeatureCard code="FR-03" title="Edit Information" description="Maintain owner profile information and secure contact details." to="/seeker/profile/edit-information" icon={UserRoundCog} />

      </div>
    </section>
  );
}
