import { useEffect, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { amanApi } from "../api/amanApi";
import { PropertyCard } from "../components/properties/PropertyCard";
import { PageHeader } from "../components/ui/PageHeader";
import type { Property } from "../types/aman";

export function ManagePropertyPage() {
  const [items, setItems] = useState<Property[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    amanApi
      .manageProperty()
      .then(setItems)
      .catch((apiError) =>
        setError(apiError instanceof Error ? apiError.message : "Failed to load properties.")
      );
  }, []);

  async function refreshValidity(propertyId: number) {
    try {
      const result = await amanApi.updatePropertyValidity(propertyId);
      setItems((current) =>
        current.map((property) =>
          property.id === propertyId
            ? { ...property, valid_until: result.valid_until }
            : property
        )
      );
      setMessage(result.message);
      setError("");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Renewal failed.");
    }
  }

  async function deleteProperty(propertyId: number) {
    try {
      const result = await amanApi.deleteProperty(propertyId);
      setItems((current) => current.filter((property) => property.id !== propertyId));
      setMessage(result.message);
      setError("");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Deletion failed.");
    }
  }

  return (
    <section>
      <PageHeader eyebrow="FR-05 / UC-05" title="Manage Property" description="Owner listing management with deletion and 30-day validity renewal actions." />
      {message ? <p className="notice">{message}</p> : null}
      {error ? <p className="notice danger">{error}</p> : null}
      <div className="stack">
        {items.map((property) => (
          <div className="management-row" key={property.id}>
            <PropertyCard property={property} />
            <div className="row-actions">
              <button className="icon-button" type="button" title="Update property validity" onClick={() => refreshValidity(property.id)}><RefreshCw size={18} /></button>
              <button className="icon-button danger" type="button" title="Delete property" onClick={() => deleteProperty(property.id)}><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
