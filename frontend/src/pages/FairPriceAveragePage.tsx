import { FormEvent, useState } from "react";
import { Calculator } from "lucide-react";
import { amanApi } from "../api/amanApi";
import { Field, SelectField } from "../components/forms/Field";
import { PageHeader } from "../components/ui/PageHeader";
import type { FairPriceAverageResult, Property, SearchCriteria } from "../types/aman";
import { PropertyCard } from "../components/properties/PropertyCard";

export function FairPriceAveragePage() {
  const [result, setResult] = useState<FairPriceAverageResult | null>(null);
  //const [results, setResults] = useState<Property[]>([]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(await amanApi.fairPriceAverage(Object.fromEntries(new FormData(event.currentTarget).entries()) as Partial<SearchCriteria> & { month: string }));
  }

  return (
    <section>
      <PageHeader eyebrow="FR-10 / UC-10" title="Fair Price Average" description="Calculate average property price using transaction type, month, property type, city, and bedrooms." />
      <form className="form-grid compact-form" onSubmit={onSubmit}>
        <SelectField id="transaction_type" name="transaction_type" label="Buy or rent" options={["Buy", "Rent"]} />
        <Field id="month" name="month" label="Month" type="month" min="2026-07"/>
        <SelectField id="property_type" name="property_type" label="Property type" options={["Apartment", "House", "Land"]} />
        <Field id="city" name="city" label="City" />
        <Field id="state" name="state" label="State" />
        <Field id="bedrooms" name="bedrooms" label="Bedrooms" type="number" min="0" />
        <button className="button form-submit" type="submit"><Calculator size={18} />Calculate</button>
      </form>
      {result ? (
        <div className="metric-strip">
          <div><span>Average price</span><strong>{result.average_price ? `${result.average_price.toLocaleString()} SDG` : "Insufficient data"}</strong></div>
          <div><span>Similar listings</span><strong>{result.listing_count}</strong></div>
          <div><span>Result</span><strong>{result.message}</strong></div>
        </div>
      ) : null}
      {result?.properties?.length ? (
        <>
            <h3 className="property-title">
                Offers Similar to Your Search Criteria
            </h3>
              <div className="property-grid">
                {result.properties.map((property) => <PropertyCard key={property.id} property={property} />)}
              </div>
        </>
      ) : null}
    </section>
  );
}
