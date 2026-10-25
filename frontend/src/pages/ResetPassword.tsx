import { FormEvent, useState } from "react";
import { Save } from "lucide-react";
import { amanApi } from "../api/amanApi";
import { Field } from "../components/forms/Field";
import { PageHeader } from "../components/ui/PageHeader";
import { useNavigate } from "react-router-dom";

export function ResetPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(
      Array.from(formData.entries()).filter(([, value]) => value !== "")
    );

    try {
      const result = await amanApi.resetPassword(payload as never);
      setMessage(result.message);
      setError("");
      try {
        await amanApi.logout();
      } catch {}

      localStorage.removeItem("aman_access_token");
      localStorage.removeItem("aman_refresh_token");
      localStorage.removeItem("aman_user");
      localStorage.removeItem("role");

      navigate("/login");
    } catch (apiError) {
      setMessage("");
      setError(apiError instanceof Error ? apiError.message : "Update failed.");
    }
  }
  return (
    <section>
      <PageHeader
        eyebrow="FR-03 / UC-03"
        title="Reset Password"
        description="Update your password."
      />
      <form className="form-grid" onSubmit={onSubmit}>
        <Field id="current_password" name="current_password" label="Current password" type="password" required />
        <Field id="password" name="password" label="New password" type="password" minLength={8} required />
        <Field id="confirm_password" name="confirm_password" label="Confirm new password" type="password" minLength={8} required />
        <button className="button form-submit" type="submit">
          <Save size={18} />
          Reset password
        </button>
      </form>
      {message ? <p className="notice">{message}</p> : null}
      {error ? <p className="notice danger">{error}</p> : null}
    </section>
  );
}
