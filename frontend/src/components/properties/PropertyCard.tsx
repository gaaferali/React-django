import { MapPin, Ruler, ShowerHead, BedDouble } from "lucide-react";
import { Link } from "react-router-dom";
import type { Property } from "../../types/aman";
import { StatusBadge } from "../ui/StatusBadge";

type PropertyCardProps = {
  property: Property;
  detailPath?: string;
};

export function PropertyCard({ property, detailPath = `/seeker/offer-display/${property.property_id}` }: PropertyCardProps) {
  return (
    <article className="property-card">
      <div className="property-media">
        <span>{property.property_type}</span>
      </div>
      <div className="property-body">
        <div className="property-title-row">
          <h3>{property.transaction_type} {property.property_type} in {property.city}</h3>
          <StatusBadge status={property.status} />
        </div>
        <p>{property.description}</p>
        <div className="property-facts">
          <span><MapPin size={16} />{property.location}</span>
          <span><BedDouble size={16} />{property.bedrooms}</span>
          <span><ShowerHead size={16} />{property.bathrooms}</span>
          <span><Ruler size={16} />{property.area} m2</span>
        </div>
        <div className="property-footer">
          <strong>{property.price.toLocaleString()} SDG</strong>
          <Link className="button button-secondary" to={detailPath}>View details</Link>
        </div>
      </div>
    </article>
  );
}
