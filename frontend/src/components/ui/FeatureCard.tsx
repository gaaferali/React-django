import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

type FeatureCardProps = {
  title: string;
  code: string;
  description: string;
  to: string;
  icon: LucideIcon;
};

export function FeatureCard({ title, code, description, to, icon: Icon }: FeatureCardProps) {
  return (
    <Link className="feature-card" to={to}>
      <div className="feature-icon">
        <Icon size={20} aria-hidden="true" />
      </div>
      <span>{code}</span>
      <strong>{title}</strong>
      <p>{description}</p>
    </Link>
  );
}
