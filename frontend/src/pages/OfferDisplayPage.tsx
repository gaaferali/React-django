import { useEffect, useState } from "react";
import { amanApi } from "../api/amanApi";
import { PropertyCard } from "../components/properties/PropertyCard";
import { PageHeader } from "../components/ui/PageHeader";
import type { Property } from "../types/aman";

export function OfferDisplayPage() {
  const [offers, setOffers] = useState<Property[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    amanApi
      .offerDisplay()
      .then(setOffers)
      .catch((apiError) =>
        setError(apiError instanceof Error ? apiError.message : "Failed to load offers.")
      );
  }, []);

  return (
    <section>
      <PageHeader eyebrow="FR-08 / UC-08" title="Offer Display" description="All active property offers with price, location, images, and description." />
      {error ? <p className="notice danger">{error}</p> : null}
      <div className="property-grid">
        {offers.map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>
    </section>
  );
}
