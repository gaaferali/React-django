import type { Chat, ChatMessage, Deal, Property, ReportRow, User } from "../types/aman";

{/*export const currentUser: User = {
  user_id: 7,
  full_name: "Amani Hassan",
  username: "amani_owner",
  email: "amani@example.com",
  phone_number: "+249912345678",
  id_number: "SD-998812",
  role: "Owner"
};*/}


export const chats: Chat[] = [
  {
    chat_id: 501,
    property_id: 101,
    seeker_id: 22,
    owner_id: 7,
    property_title: "Rent Apartment in Omdurman",
    last_message: "Can we confirm the property document?",
    updated_at: "2026-06-29"
  }
];

export const chatMessages: ChatMessage[] = [
  {
    message_id: 1,
    chat_id: 501,
    sender_user_id: 22,
    messages_text: "I am interested in this apartment.",
    created_at: "2026-06-29 10:15"
  },
  {
    message_id: 2,
    chat_id: 501,
    sender_user_id: 7,
    messages_text: "The offer is active and the document is uploaded.",
    created_at: "2026-06-29 10:24",
    read_at: "2026-06-29 10:25"
  }
];

export const deals: Deal[] = [
  {
    deal_id: 701,
    seeker_id: 22,
    owner_id: 7,
    property_id: 101,
    property_title: "Rent Apartment in Omdurman",
    status: "Pending",
    created_at: "2026-06-29"
  },
  {
    deal_id: 702,
    seeker_id: 24,
    owner_id: 9,
    property_id: 102,
    property_title: "Buy House in Bahri",
    status: "Completed",
    created_at: "2026-06-18",
    done_at: "2026-06-22",
    rating: 5
  }
];

export const reportRows: ReportRow[] = [
  { id: 1, label: "Verified owners", type: "Owner", city: "Khartoum", total: 18 },
  { id: 2, label: "Active seekers", type: "Seeker", city: "Omdurman", total: 44 },
  { id: 3, label: "Rental apartments", type: "Property", city: "Bahri", total: 12 }
];
