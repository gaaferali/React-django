import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { amanApi } from "../api/amanApi";
//import { currentUser } from "../data/mockData";
import { Field } from "../components/forms/Field";
import { PageHeader } from "../components/ui/PageHeader";
//import type { User } from "../types/aman";
import { useNavigate } from "react-router-dom";

export function ResetPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  //const [profile, setProfile] = useState<Profile | null>(null);

 /* useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const data = await amanApi.getUserProfile() as User;
        if (isMounted) {
          setProfile({
          //  id: data.id,
            full_name: data.first_name + " " + data.last_name,
            username: data.username,
            email: data.email,
            phone_number: data.phone_number,
          //  role: data.role,
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);
*/
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget; // Save the form reference
    const formData = new FormData(form);
    const payload = Object.fromEntries(
      Array.from(formData.entries()).filter(([, value]) => value !== "")
    );

    try {
      const result = await amanApi.resetpassword(payload as never);
      setMessage(result.message);
      setError("");
      //form.reset();
        try {
          console.log(localStorage.getItem("aman_refresh_token"));
              await amanApi.logout();
       }catch (error) {
              console.log("Logout error:", error);
       }

      localStorage.removeItem("aman_access_token");
      localStorage.removeItem("aman_refresh_token");

      navigate("/login");
      }
    catch (apiError) {
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
        <Field id="current_password" name="current_password" label="Current password" type="password" />
        <Field id="password" name="password" label="New password" type="password" minLength={8} />
        <Field id="confirm_password" name="confirm_password" label="Confirm new password" type="password" minLength={8} />
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
