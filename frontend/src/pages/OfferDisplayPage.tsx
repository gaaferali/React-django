import { useEffect, useState } from "react";
import { amanApi } from "../api/amanApi";
import { PropertyCard } from "../components/properties/PropertyCard";
import { PageHeader } from "../components/ui/PageHeader";
import type { Property } from "../types/aman";

export function OfferDisplayPage() {
  const [offers, setOffers] = useState<Property[]>([]);

  useEffect(() => {
    amanApi.offerDisplay().then(setOffers);
  }, []);

  return (
    <section>
      <PageHeader eyebrow="FR-08 / UC-08" title="Offer Display" description="All active property offers with price, area, location, images, and description." />
      <div className="property-grid">
        {offers.map((property) => <PropertyCard key={property.property_id} property={property} />)}
      </div>
    </section>
  );
}
