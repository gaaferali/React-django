import { FormEvent, useState } from "react";
import { UploadCloud } from "lucide-react";
import { amanApi } from "../api/amanApi";
import { Field, SelectField, TextAreaField } from "../components/forms/Field";
import { PageHeader } from "../components/ui/PageHeader";

export function AddPropertyPage() {
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await amanApi.addProperty(new FormData(event.currentTarget));
    setMessage(result.message);
  }

  return (
    <section>
      <PageHeader eyebrow="FR-04 / UC-04" title="Add Property" description="Owner form for creating a new property offer with details, images, and property document." />
      <form className="form-grid" onSubmit={onSubmit}>
        <SelectField id="transaction_type" name="transaction_type" label="Transaction type" options={["Buy", "Rent"]} required />
        <SelectField id="property_type" name="property_type" label="Property type" options={["Apartment", "House", "Land"]} required />
        <Field id="state" name="state" label="State" required />
        <Field id="city" name="city" label="City" required />
        <Field id="bedrooms" name="bedrooms" label="Bedrooms" type="number" min="0" required />
        <Field id="bathrooms" name="bathrooms" label="Bathrooms" type="number" min="0" required />
        <Field id="price" name="price" label="Price" type="number" min="0" required />
        <Field id="location" name="location" label="Location" required />
        <Field id="area" name="area" label="Area in m2" type="number" min="0" required />
        <Field id="property_images" name="property_images" label="Property images" type="file" multiple />
        <Field id="property_document" name="property_document" label="Property document" type="file" />
        <TextAreaField id="description" name="description" label="Detailed description" rows={5} required />
        <button className="button form-submit" type="submit"><UploadCloud size={18} />Submit property</button>
      </form>
      {message ? <p className="notice">{message}</p> : null}
    </section>
  );
}
