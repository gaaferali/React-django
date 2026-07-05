import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { amanApi } from "../api/amanApi";
import { currentUser } from "../data/mockData";
import { Field } from "../components/forms/Field";
import { PageHeader } from "../components/ui/PageHeader";

type Profile = {
  full_name: string;
  username: string;
  email: string;
  phone_number: string;
  role?: string;
};

export function EditInformationPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const data = await amanApi.getUserProfile();
        if (isMounted) {
          setProfile({
            full_name: data.full_name ?? currentUser.full_name,
            username: data.username ?? currentUser.username,
            email: data.email ?? currentUser.email,
            phone_number: data.phone_number ?? currentUser.phone_number,
            role: data.role,
          });
        }
      } catch {
        if (isMounted) {
          setProfile(currentUser);
        }
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget; // Save the form reference
    const formData = new FormData(form);
    const payload = Object.fromEntries(
      Array.from(formData.entries()).filter(([, value]) => value !== "")
    );

    try {
      const result = await amanApi.editInformation(payload as never);
      setMessage(result.message);
      setError("");
      form.reset();
    } catch (apiError) {
      setMessage("");
      setError(apiError instanceof Error ? apiError.message : "Update failed.");
    }
  }

  if (!profile) {
    return (
      <section>
        <PageHeader
          eyebrow="FR-03 / UC-03"
          title="Edit Information"
          description="Update profile information for Owner and Seeker users."
        />
        <p className="notice">Loading your profile...</p>
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        eyebrow="FR-03 / UC-03"
        title="Edit Information"
        description="Update profile information for Owner and Seeker users."
      />
      <form className="form-grid" onSubmit={onSubmit}>
        <Field id="full_name" name="full_name" label="Full name" defaultValue={profile.full_name} />
        <Field id="username" name="username" label="Username" defaultValue={profile.username} />
        <Field id="email" name="email" label="Email" type="email" defaultValue={profile.email} />
        <Field id="phone_number" name="phone_number" label="Phone number" defaultValue={profile.phone_number} />
        <Field id="current_password" name="current_password" label="Current password" type="password" />
        <Field id="password" name="password" label="New password" type="password" minLength={8} />
        <Field id="confirm_password" name="confirm_password" label="Confirm new password" type="password" minLength={8} />
        <button className="button form-submit" type="submit">
          <Save size={18} />
          Save changes
        </button>
      </form>
      {message ? <p className="notice">{message}</p> : null}
      {error ? <p className="notice danger">{error}</p> : null}
    </section>
  );
}
