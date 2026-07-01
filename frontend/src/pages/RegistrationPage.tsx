import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { amanApi } from "../api/amanApi";
import { Field, SelectField } from "../components/forms/Field";
import { PageHeader } from "../components/ui/PageHeader";

export function RegistrationPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
try {
  const result = await amanApi.registration(
    Object.fromEntries(formData.entries()) as never
  );

  setMessage(result.message);
  setError("");

  // 1. خذ role من response
  const role = result.user.role;

  // 2. خزنه
  if (role) {
    localStorage.setItem("role", role);
    
    // 3. routes mapping
    const routes: Record<string, string> = {
      Admin: "/admin/dashboard",
      Seeker: "/seeker/home",
      Owner: "/owner/home",
    };

    // 4. redirect حسب role
    navigate(routes[role] || "/");
  }

} catch (apiError) {
  setMessage("");
  setError(
    apiError instanceof Error ? apiError.message : "Registration failed."
  );
} 
  }

  return (
    <section>
      <PageHeader
        eyebrow="FR-01 / UC-01"
        title="Registration"
        description="Create Owner or Seeker accounts with full name, email, username, strong password, phone number, and ID number."
      />
      <form className="form-grid" onSubmit={onSubmit}>
        <Field id="full_name" name="full_name" label="Quadruple full name" required />
        <Field id="email" name="email" label="Email" type="email" required />
        <Field id="username" name="username" label="Username" required />
        <Field id="phone_number" name="phone_number" label="Phone number" required />
        {/*<Field id="id_number" name="id_number" label="ID number" required />*/}
        <SelectField id="role" name="role" label="Account type" options={["Owner", "Seeker","Admin"]} required />
        <Field id="password" name="password" label="Password" type="password" minLength={8} required />
        <Field id="confirm_password" name="confirm_password" label="Confirm password" type="password" minLength={8} required />
        <button className="button form-submit" type="submit"><UserPlus size={18} />Create account</button>
      </form>
      {message ? <p className="notice">{message}</p> : null}
      {error ? <p className="notice danger">{error}</p> : null}
    </section>
  );
}
