import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { amanApi } from "../api/amanApi";
import { Field } from "../components/forms/Field";
import { PageHeader } from "../components/ui/PageHeader";
import { useNavigate } from "react-router-dom";

type Profile = {
  full_name: string;
  username: string;
  email: string;
  phone_number: string;
};

export function EditInformationPage() {
  const navigate = useNavigate();
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
            full_name: data.full_name,
            username: data.username,
            email: data.email,
            phone_number: data.phone_number,
          });
        }
      } catch (apiError) {
        if (isMounted) {
          setError(
            apiError instanceof Error ? apiError.message : "Failed to load profile."
          );
        }
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const role = localStorage.getItem("role");
  function onResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(role === "Owner" ? "/owner/reset-password" : "/seeker/reset-password");
  }



  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(
      Array.from(formData.entries()).filter(([, value]) => value !== "")
    );

    try {
      const result = await amanApi.editInformation(payload as never);
      setMessage(result.message);
      setError("");
      localStorage.setItem("aman_user", JSON.stringify(result.user));
      setProfile({
        full_name: result.user.full_name,
        username: result.user.username,
        email: result.user.email,
        phone_number: result.user.phone_number,
      });
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
        <p className={`notice${error ? " danger" : ""}`}>
          {error || "Loading your profile..."}
        </p>
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
      <form className="form-grid" onSubmit={onResetPassword}>
          <button className="button form-submit" type="submit">
          <Save size={18} />
          Reset password
        </button>
      </form>
      <form className="form-grid" onSubmit={onSubmit}>
        <Field id="full_name" name="full_name" label="Full name" defaultValue={profile.full_name} />
        <Field id="username" name="username" label="Username" defaultValue={profile.username} />
        <Field id="email" name="email" label="Email" type="email" defaultValue={profile.email} />
        <Field id="phone_number" name="phone_number" label="Phone number" defaultValue={profile.phone_number} />
        <Field id="current_password" name="current_password" label="Current password" type="password" />
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
