import { useEffect, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { amanApi } from "../api/amanApi";
import { PropertyCard } from "../components/properties/PropertyCard";
import { PageHeader } from "../components/ui/PageHeader";
import type { Property } from "../types/aman";

export function ManagePropertyPage() {
  const [items, setItems] = useState<Property[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    amanApi.manageProperty().then(setItems);
  }, []);

  async function refreshValidity(propertyId: number) {
    const result = await amanApi.updatePropertyValidity(propertyId);
    setMessage(result.message);
  }

  async function deleteProperty(propertyId: number) {
    const result = await amanApi.deleteProperty(propertyId);
    setItems((current) => current.filter((property) => property.property_id !== propertyId));
    setMessage(result.message);
  }

  return (
    <section>
      <PageHeader eyebrow="FR-05 / UC-05" title="Manage Property" description="Owner listing management with edit, delete, and 30-day validity refresh actions." />
      {message ? <p className="notice">{message}</p> : null}
      <div className="stack">
        {items.map((property) => (
          <div className="management-row" key={property.property_id}>
            <PropertyCard property={property} />
            <div className="row-actions">
              <button className="icon-button" type="button" title="Update property validity" onClick={() => refreshValidity(property.property_id)}><RefreshCw size={18} /></button>
              <button className="icon-button danger" type="button" title="Delete property" onClick={() => deleteProperty(property.property_id)}><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
