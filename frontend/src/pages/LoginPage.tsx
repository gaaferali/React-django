import { FormEvent, useState } from "react";
import { LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { amanApi } from "../api/amanApi";
import { Field, SelectField } from "../components/forms/Field";
import { PageHeader } from "../components/ui/PageHeader";
//import { c } from "vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf";

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries()) as { username: string; password: string; };
    try {const result = await amanApi.login(payload);
    localStorage.setItem("aman_access_token", result.access);
    localStorage.setItem("aman_refresh_token", result.refresh);
    const accountInfo = await amanApi.getuserprofile() as { role: string; message?: string; };
    if (accountInfo.role === "Admin") navigate("/admin/dashboard");
    else if (accountInfo.role === "Owner") navigate("/owner/home");
    else navigate("/seeker/home");
    setError("");}
    catch (err) {
      setError("Invalid Username, Or password.  Please try again.");
    }
  }

  return (
    <section>
      <PageHeader
        eyebrow="FR-02 / UC-02"
        title="Login"
        description="Authenticate Admin, Seeker, and Owner users through the Django REST Framework JWT endpoint."
      />
      <form className="form-grid compact-form" onSubmit={onSubmit}>
        <Field id="username" name="username" label="Username" required />
        {/*<Field id="email" name="email" label="Email" type="email" /> */}
        <Field id="password" name="password" label="Password" type="password" required />
        {/* <SelectField id="role" name="role" label="Role" options={["Seeker", "Owner", "Admin"]} required /> */}
        <button className="button form-submit" type="submit"><LogIn size={18} />Login</button>
      </form>
      <p className="helper-link">No account yet? <Link to="/registration">Create a new AMAN account</Link>.</p>
      {error ? <p className="notice danger">{error}</p> : null}
    </section>
  );
}
