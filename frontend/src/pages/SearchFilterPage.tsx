import { FormEvent, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { amanApi } from "../api/amanApi";
import { Field } from "../components/forms/Field";
import { PropertyCard } from "../components/properties/PropertyCard";
import { PageHeader } from "../components/ui/PageHeader";
import type { Property, SearchCriteria } from "../types/aman";

export function SearchFilterPage() {
  const [results, setResults] = useState<Property[]>([]);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setResults(await amanApi.searchFilter(Object.fromEntries(new FormData(event.currentTarget).entries()) as Partial<SearchCriteria>));
      setError("");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Filtering failed.");
    }
  }

  return (
    <section>
      <PageHeader eyebrow="FR-07 / UC-07" title="Search Filter" description="Refine search results using price range, bedrooms, and bathrooms." />
      <form className="form-grid compact-form" onSubmit={onSubmit}>
        <Field id="min_price" name="min_price" label="Minimum price" type="number" min="0" />
        <Field id="max_price" name="max_price" label="Maximum price" type="number" min="0" />
        <Field id="bedroom" name="bedroom" label="Bedrooms" type="number" min="0" />
        <Field id="bathroom" name="bathroom" label="Bathrooms" type="number" min="0" />
        <button className="button form-submit" type="submit"><SlidersHorizontal size={18} />Apply filters</button>
      </form>
      {error ? <p className="notice danger">{error}</p> : null}
      <div className="property-grid">
        {results.map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>
    </section>
  );
}
