import { useState } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { amanApi } from "../api/amanApi";
import { PageHeader } from "../components/ui/PageHeader";

export function LogoutPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  function clearSession() {
    localStorage.removeItem("aman_access_token");
    localStorage.removeItem("aman_refresh_token");
    localStorage.removeItem("aman_user");
    localStorage.removeItem("role");
  }

  async function confirmLogout() {
    try {
      const result = await amanApi.logout();
      setMessage(result.message);
      window.setTimeout(() => {
        clearSession();
        navigate("/login");
      }, 500);
    } catch {
      clearSession();
      navigate("/login");
    }
  }

  return (
    <section>
      <PageHeader eyebrow="FR-14 / UC-14" title="Logout" description="Terminate the current session and redirect the user to the login screen." />
      <div className="logout-panel">
        <p>Confirm logout to end the active AMAN session.</p>
        <button className="button" type="button" onClick={confirmLogout}><LogOut size={18} />Confirm logout</button>
      </div>
      {message ? <p className="notice">{message}</p> : null}
    </section>
  );
}
