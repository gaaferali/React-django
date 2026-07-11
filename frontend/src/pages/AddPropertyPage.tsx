import { FormEvent, useState } from "react";
import { UploadCloud } from "lucide-react";
import { amanApi } from "../api/amanApi";
import { Field, SelectField, TextAreaField } from "../components/forms/Field";
import { PageHeader } from "../components/ui/PageHeader";

export function AddPropertyPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const form = event.currentTarget; // save ال refe

  const formData = new FormData(form);

  const input = form.querySelector(
    'input[name="images"]'
  ) as HTMLInputElement | null;

  if (input?.files?.length) {
    formData.delete("images");

    Array.from(input.files).forEach((file) => {
      formData.append("images", file);
    });
  }

  try {
    const result = await amanApi.addProperty(formData);

    setMessage(result.message ?? "New property offer created");
    setError("");

    form.reset(); // clear the inpots
  } catch (apiError) {
    setMessage("");
    setError(
      apiError instanceof Error
        ? apiError.message
        : "Property submission failed."
    );
  }
}

  return (
    <section>
      <PageHeader
        eyebrow="FR-04 / UC-04"
        title="Add Property"
        description="Owner form for creating a new property offer with details, images, and property document."
      />
      <form className="form-grid" onSubmit={onSubmit}>
        <SelectField id="transaction_type" name="transaction_type" label="Transaction type" options={["Buy", "Rent"]} required />
        <SelectField id="property_type" name="property_type" label="Property type" options={["Apartment", "House", "Land"]} required />
        <Field id="state" name="state" label="State" required />
        <Field id="city" name="city" label="City" required />
        <Field id="bedroom" name="bedroom" label="Bedrooms" type="number" min="0" required />
        <Field id="bathroom" name="bathroom" label="Bathrooms" type="number" min="0" required />
        <Field id="price" name="price" label="Price" type="number" min="0" required />
        <Field id="images" name="images" label="Property images" type="file" multiple />
        <Field id="property_document" name="property_document" label="Property document" type="file" />
        <TextAreaField id="description" name="description" label="Detailed description" rows={5} required />
        <button className="button form-submit" type="submit">
          <UploadCloud size={18} />
          Submit property
        </button>
      </form>
      {message ? <p className="notice">{message}</p> : null}
      {error ? <p className="notice danger">{error}</p> : null}
    </section>
  );
}
