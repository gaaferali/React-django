export type UserRole = "Owner" | "Seeker" | "Admin" | "Guest";

export type User = {
  user_id: number;
  full_name: string;
  username: string;
  email: string;
  phone_number: string;
  id_number: string;
  role: UserRole;
};

/*export type Property = {
  property_id: number;
  owner_id: number;
  transaction_type: "Buy" | "Rent";
  property_type: "Apartment" | "House" | "Land";
  state: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  location: string;
  area: number;
  description: string;
  status: "Active" | "Inactive" | "Completed";
  updated_at: string;
  images: string[];
};*/

export type PropertyImage = {
  id: number;
  image: string;
};

export type Property = {
  id: number;
  owner_id: number;
  property_type: string;
  transaction_type: string;
  city: string;
  state: string;
  bedroom: number;
  bathroom: number;
  price: number;
  description: string;
  property_document: string | null;
  images: PropertyImage[];
};



export type SearchCriteria = {
  transaction_type: string;
  property_type: string;
  state: string;
  city: string;
  bedrooms: string;
  bathrooms: string;
  min_price: string;
  max_price: string;
};

export type Chat = {
  chat_id: number;
  property_id: number;
  seeker_id: number;
  owner_id: number;
  property_title: string;
  last_message: string;
  updated_at: string;
};

export type ChatMessage = {
  message_id: number;
  chat_id: number;
  sender_user_id: number;
  messages_text: string;
  created_at: string;
  read_at?: string;
};

export type Deal = {
  deal_id: number;
  seeker_id: number;
  owner_id: number;
  property_id: number;
  property_title: string;
  status: "Pending" | "Completed" | "Rejected";
  created_at: string;
  done_at?: string;
  rating?: number;
};

export type ReportType = "owners" | "seekers" | "properties";

export type ReportRow = {
  id: number;
  label: string;
  type: string;
  city: string;
  total: number;
};

export type FairPriceAverageResult = {
  average_price: number | null;
  listing_count: number;
  message: string;
};
