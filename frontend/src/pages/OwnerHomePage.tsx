import { Building2, ClipboardList, PlusCircle, UserRoundCog } from "lucide-react";
import { FeatureCard } from "../components/ui/FeatureCard";
import { PageHeader } from "../components/ui/PageHeader";

export function OwnerHomePage() {
  return (
    <section>
      <PageHeader eyebrow="Owner scope" title="Owner Dashboard" description="Create property offers, manage listings, contact seekers, complete deals, and update account information." />
      <div className="feature-grid">
        <FeatureCard code="FR-04" title="Add Property" description="Create offers with type, city, price, location, area, description, images, and property document." to="/owner/add-property" icon={PlusCircle} />
        <FeatureCard code="FR-05" title="Manage Property" description="View, edit, delete, and refresh validity for active or inactive offers." to="/owner/manage-property" icon={ClipboardList} />
        <FeatureCard code="FR-11" title="Contact" description="Reply to seekers through stored conversations linked to a property." to="/contact" icon={Building2} />
        <FeatureCard code="FR-03" title="Edit Information" description="Maintain owner profile information and secure contact details." to="/profile/edit-information" icon={UserRoundCog} />
      </div>
    </section>
  );
}
