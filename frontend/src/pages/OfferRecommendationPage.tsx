import { FormEvent, useState } from "react";
import { BellPlus } from "lucide-react";
import { amanApi } from "../api/amanApi";
import { Field, SelectField } from "../components/forms/Field";
import { PropertyCard } from "../components/properties/PropertyCard";
import { PageHeader } from "../components/ui/PageHeader";
import type { Property, SearchCriteria } from "../types/aman";

export function OfferRecommendationPage() {
  const [message, setMessage] = useState("");
  const [recommendations, setRecommendations] = useState<Property[]>([]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await amanApi.offerRecommendation(Object.fromEntries(new FormData(event.currentTarget).entries()) as Partial<SearchCriteria>);
    setMessage(result.message);
    setRecommendations(result.recommendations);
  }

  return (
    <section>
      <PageHeader eyebrow="FR-09 / UC-09" title="Offer Recommendation" description="Save seeker preferences and notify the seeker when matching active properties become available." />
      <form className="form-grid" onSubmit={onSubmit}>
        <SelectField id="transaction_type" name="transaction_type" label="Buy or rent" options={["Buy", "Rent"]} />
        <SelectField id="property_type" name="property_type" label="Property type" options={["Apartment", "House"]} />
        <Field id="city" name="city" label="City" />
        <Field id="bedrooms" name="bedrooms" label="Bedrooms" type="number" min="0" />
        <Field id="bathrooms" name="bathrooms" label="Bathrooms" type="number" min="0" />
        <Field id="max_price" name="max_price" label="Preferred price" type="number" min="0" />
        <button className="button form-submit" type="submit"><BellPlus size={18} />Save preferences</button>
      </form>
      {message ? <p className="notice">{message}</p> : null}
      <div className="property-grid">
        {recommendations.map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>
    </section>
  );
}
