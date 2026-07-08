import { FormEvent, useState } from "react";
import { Filter, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { amanApi } from "../api/amanApi";
import { Field, SelectField } from "../components/forms/Field";
import { PropertyCard } from "../components/properties/PropertyCard";
import { PageHeader } from "../components/ui/PageHeader";
import type { Property, SearchCriteria } from "../types/aman";

export function SearchForPropertyPage() {
  const [results, setResults] = useState<Property[]>([]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const criteria = Object.fromEntries(new FormData(event.currentTarget).entries()) as SearchCriteria;
    setResults(await amanApi.searchForProperty(criteria));
  }

  return (
    <section>
      <PageHeader
        eyebrow="FR-06 / UC-06"
        title="Search for Property"
        description="Search properties by transaction, type, state, city, bedrooms, bathrooms, and price range."
        actions={<Link className="button button-secondary" to="/seeker/search-filter"><Filter size={18} />Filter results</Link>}
      />
      <form className="form-grid" onSubmit={onSubmit}>
        <SelectField id="transaction_type" name="transaction_type" label="Transaction type" options={["Buy", "Rent"]} />
        <SelectField id="property_type" name="property_type" label="Property type" options={["Apartment", "House", "Land"]} />
        <Field id="state" name="state" label="State" />
        <Field id="city" name="city" label="City" />
        <Field id="bedroom" name="bedrooms" label="Bedrooms" type="number" min="0" />
        <Field id="bathroom" name="bathrooms" label="Bathrooms" type="number" min="0" />
        <Field id="min_price" name="min_price" label="Minimum price" type="number" min="0" />
        <Field id="max_price" name="max_price" label="Maximum price" type="number" min="0" />
        <button className="button form-submit" type="submit"><Search size={18} />Search</button>
      </form>
      <div className="property-grid">
        {results.map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>
    </section>
  );
}
