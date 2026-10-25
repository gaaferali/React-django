import { useEffect, useState } from "react";
import { HeartHandshake, MessageCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { amanApi } from "../api/amanApi";
import { PageHeader } from "../components/ui/PageHeader";
import type { Property } from "../types/aman";

function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("aman_user") || "{}");
    return typeof user.id === "number" ? user.id : null;
  } catch {
    return null;
  }
}

export function OfferDetailsPage() {
  const { propertyId } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const id = Number(propertyId);
    if (!Number.isInteger(id) || id <= 0) {
      setError("Invalid property identifier.");
      return;
    }

    amanApi
      .offerDetails(id)
      .then(setProperty)
      .catch((apiError) =>
        setError(
          apiError instanceof Error ? apiError.message : "Failed to load property."
        )
      );
  }, [propertyId]);

  if (!property) {
    return (
      <section>
        <PageHeader
          eyebrow="FR-08 / UC-08"
          title="Offer Details"
          description="Review the complete property offer."
        />
        <p className={`notice${error ? " danger" : ""}`}>
          {error || "Loading property..."}
        </p>
      </section>
    );
  }

  const isOwner = getCurrentUserId() === property.owner_id;
  const canContactOwner = localStorage.getItem("role") === "Seeker" && !isOwner;

  async function handleDealRequest(propertyId: number) {
    try {
      const result = await amanApi.sendDealRequest(propertyId);
      setMessage(result.message);
      setError("");
    } catch (apiError) {
      setMessage("");
      setError(
        apiError instanceof Error ? apiError.message : "Failed to send deal request."
      );
    }
  }

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
          {property.images.length ? (
            property.images.map((image) => (
              <img
                key={image.id}
                src={image.image}
                alt={`${property.property_type} in ${property.city}`}
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
            src={property.property_document}
            alt="Property document"
            className="document-image"
          />
        ) : (
          <p>No property document uploaded.</p>
        )}

        <div className="property-info">
          <div><strong>Price</strong><p>{property.price.toLocaleString()} SDG</p></div>
          <div><strong>Property Type</strong><p>{property.property_type}</p></div>
          <div><strong>Transaction</strong><p>{property.transaction_type}</p></div>
          <div><strong>City</strong><p>{property.city}</p></div>
          <div><strong>State</strong><p>{property.state}</p></div>
          <div><strong>Bedrooms</strong><p>{property.bedroom}</p></div>
          <div><strong>Bathrooms</strong><p>{property.bathroom}</p></div>
          <div><strong>Valid Until</strong><p>{new Date(property.valid_until).toLocaleDateString()}</p></div>
          <div className="description-block">
            <strong>Description</strong>
            <p>{property.description}</p>
          </div>
        </div>

        {canContactOwner ? (
          <div className="button-row">
            <Link className="button" to={`/seeker/contact?property_id=${property.id}`}>
              <MessageCircle size={18} />
              Contact Owner
            </Link>
            <button className="button button-secondary" type="button" onClick={() => handleDealRequest(property.id)}>
              <HeartHandshake size={18} />
              Send Deal Request
            </button>
          </div>
        ) : null}
      </div>

      {message ? <p className="notice">{message}</p> : null}
      {error ? <p className="notice danger">{error}</p> : null}
    </section>
  );
}
