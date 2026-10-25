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
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await amanApi.offerRecommendation(Object.fromEntries(new FormData(event.currentTarget).entries()) as Partial<SearchCriteria>);
      setMessage(result.message);
      setRecommendations(result.recommendations);
      setError("");
    } catch (apiError) {
      setMessage("");
      setError(apiError instanceof Error ? apiError.message : "Recommendation request failed.");
    }
  }

  return (
    <section>
      <PageHeader eyebrow="FR-09 / UC-09" title="Offer Recommendation" description="Save seeker preferences and review matching active properties." />
      <form className="form-grid" onSubmit={onSubmit}>
        <SelectField id="transaction_type" name="transaction_type" label="Buy or rent" options={["Buy", "Rent"]} />
        <SelectField id="property_type" name="property_type" label="Property type" options={["Apartment", "House", "Land"]} />
        <Field id="state" name="state" label="State" />
        <Field id="city" name="city" label="City" />
        <Field id="bedroom" name="bedroom" label="Bedrooms" type="number" min="0" />
        <Field id="bathroom" name="bathroom" label="Bathrooms" type="number" min="0" />
        <Field id="min_price" name="min_price" label="Minimum price" type="number" min="0" />
        <Field id="max_price" name="max_price" label="Preferred price" type="number" min="0" />
        <button className="button form-submit" type="submit"><BellPlus size={18} />Save preferences</button>
      </form>
      {message ? <p className="notice">{message}</p> : null}
      {error ? <p className="notice danger">{error}</p> : null}
      <div className="property-grid">
        {recommendations.map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>
    </section>
  );
}
