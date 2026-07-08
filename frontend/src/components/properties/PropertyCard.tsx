import { MapPin, ShowerHead, BedDouble } from "lucide-react";
import { Link } from "react-router-dom";
import type { Property } from "../../types/aman";

type PropertyCardProps = {
  property: Property;
  detailPath?: string;
};

const API_URL = "http://127.0.0.1:8000";
const role = localStorage.getItem("role") || "";
export function PropertyCard({
  property,
  detailPath = `/${role}/offerDetails/${property.id}`,
}: PropertyCardProps) {

  // use first property image
  const mainImage =
    property.images.length > 0
      ? `${API_URL}${property.images[0].image}`
      : null;


  return (
    <article className="property-card">

      <div className="property-media">

        {mainImage ? (
          <img
            src={mainImage}
            alt={property.property_type}
          />
        ) : (
          <span>{property.property_type}</span>
        )}

      </div>


      <div className="property-body">

        <div className="property-title-row">

          <h3>
            {property.transaction_type} {property.property_type} in {property.city}
          </h3>

        </div>


        <p>{property.description}</p>


        <div className="property-facts">

          <span>
            <MapPin size={16} />
            {property.city}, {property.state}
          </span>


          <span>
            <BedDouble size={16} />
            {property.bedroom}
          </span>


          <span>
            <ShowerHead size={16} />
            {property.bathroom}
          </span>

        </div>


        <div className="property-footer">

          <strong>
            {property.price.toLocaleString()} SDG
          </strong>


          <Link
            className="button button-secondary"
            to={detailPath}
          >
            View details
          </Link>

        </div>

      </div>

    </article>
  );
}