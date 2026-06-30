import { FormEvent, useState } from "react";
import { Save } from "lucide-react";
import { amanApi } from "../api/amanApi";
import { currentUser } from "../data/mockData";
import { Field } from "../components/forms/Field";
import { PageHeader } from "../components/ui/PageHeader";

export function EditInformationPage() {
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await amanApi.editInformation(Object.fromEntries(new FormData(event.currentTarget).entries()));
    setMessage(result.message);
  }

  return (
    <section>
      <PageHeader eyebrow="FR-03 / UC-03" title="Edit Information" description="Update profile information for Owner and Seeker users." />
      <form className="form-grid" onSubmit={onSubmit}>
        <Field id="full_name" name="full_name" label="Full name" defaultValue={currentUser.full_name} />
        <Field id="email" name="email" label="Email" type="email" defaultValue={currentUser.email} />
        <Field id="phone_number" name="phone_number" label="Phone number" defaultValue={currentUser.phone_number} />
        <Field id="password" name="password" label="New password" type="password" />
        <button className="button form-submit" type="submit"><Save size={18} />Save changes</button>
      </form>
      {message ? <p className="notice">{message}</p> : null}
    </section>
  );
}
