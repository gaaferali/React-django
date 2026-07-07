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
  if (propertyId) {
    amanApi.offerDetails(Number(propertyId))
      .then(setProperty);
  }
}, [propertyId]);

  if (!property) return null;
  if (!property) return null;

const user = JSON.parse(
  localStorage.getItem("aman_user") || "{}"
);

const isOwner = user.id === property.owner_id;

const API_URL = "http://127.0.0.1:8000";

return (
  <section className="offer-details-page">
    <PageHeader
      eyebrow="FR-08 / UC-08"
      title={`${property.transaction_type} ${property.property_type} in ${property.city}`}
      description={property.description}
    />

    <div className="offer-details-container">

      <h2>Property Images</h2>

      <div className="property-gallery">
        {property.images.length > 0 ? (
          property.images.map((img) => (
            <img
              key={img.id}
              src={`${API_URL}${img.image}`}
              alt="Property"
              className="gallery-image"
            />
          ))
        ) : (
          <p>No images uploaded.</p>
        )}
      </div>

      <h2>Property Document</h2>

      {property.property_document ? (
        <img
          src={`${API_URL}${property.property_document}`}
          alt="Property Document"
          className="document-image"
        />
      ) : (
        <p>No property document uploaded.</p>
      )}

      <div className="property-info">

        <div>
          <strong>Price</strong>
          <p>{property.price.toLocaleString()} SDG</p>
        </div>

        <div>
          <strong>Property Type</strong>
          <p>{property.property_type}</p>
        </div>

        <div>
          <strong>Transaction</strong>
          <p>{property.transaction_type}</p>
        </div>

        <div>
          <strong>City</strong>
          <p>{property.city}</p>
        </div>

        <div>
          <strong>State</strong>
          <p>{property.state}</p>
        </div>

        <div>
          <strong>Bedrooms</strong>
          <p>{property.bedroom}</p>
        </div>

        <div>
          <strong>Bathrooms</strong>
          <p>{property.bathroom}</p>
        </div>

        <div className="description-block">
          <strong>Description</strong>
          <p>{property.description}</p>
        </div>

      </div>
      {!isOwner && (
      <div className="button-row">
        <Link className="button" to="/contact">
          <MessageCircle size={18} />
          Contact Owner
        </Link>

        <Link className="button button-secondary" to="/deals">
          <HeartHandshake size={18} />
          Send Deal Request
        </Link>
      </div>
      )}

    </div>
  </section>
);
}
