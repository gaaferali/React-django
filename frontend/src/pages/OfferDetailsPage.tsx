import { useEffect, useState } from "react";
import { HeartHandshake, MapPinned, MessageCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { amanApi } from "../api/amanApi";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { Property } from "../types/aman";

export function OfferDetailsPage() {
  const { propertyId } = useParams();
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    amanApi.offerDetails(Number(propertyId)).then(setProperty);
  }, [propertyId]);

  if (!property) return null;

  return (
    <section>
      <PageHeader eyebrow="FR-08 / UC-08" title={`${property.transaction_type} ${property.property_type} in ${property.city}`} description={property.description} />
      <div className="details-layout">
        <div className="map-panel">
          <MapPinned size={34} />
          <strong>{property.location}</strong>
          <span>Map placeholder for backend geolocation integration</span>
        </div>
        <div className="details-panel">
          <StatusBadge status={property.status} />
          <dl>
            <dt>Price</dt><dd>{property.price.toLocaleString()} SDG</dd>
            <dt>Area</dt><dd>{property.area} m2</dd>
            <dt>Bedrooms</dt><dd>{property.bedrooms}</dd>
            <dt>Bathrooms</dt><dd>{property.bathrooms}</dd>
            <dt>Images</dt><dd>{property.images.join(", ")}</dd>
          </dl>
          <div className="button-row">
            <Link className="button" to="/contact"><MessageCircle size={18} />Contact Owner</Link>
            <Link className="button button-secondary" to="/deals"><HeartHandshake size={18} />Send Deal Request</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
