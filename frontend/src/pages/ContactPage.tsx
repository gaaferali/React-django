import { FormEvent, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { amanApi } from "../api/amanApi";
import { Field } from "../components/forms/Field";
import { PageHeader } from "../components/ui/PageHeader";
import type { Chat, ChatMessage } from "../types/aman";

export function ContactPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    amanApi.contact().then((result) => {
      setChats(result.chats);
      setMessages(result.messages);
    });
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries()) as { chat_id: string; messages_text: string };
    const result = await amanApi.sendMessage({ chat_id: Number(payload.chat_id), messages_text: payload.messages_text });
    setNotice(result.message);
    event.currentTarget.reset();
  }

  return (
    <section>
      <PageHeader eyebrow="FR-11 / UC-11" title="Contact" description="Messaging interface for seekers and owners, linked to active property offers." />
      <div className="conversation-layout">
        <aside className="conversation-list">
          {chats.map((chat) => (
            <button key={chat.chat_id} className="conversation-item" type="button">
              <strong>{chat.property_title}</strong>
              <span>{chat.last_message}</span>
            </button>
          ))}
        </aside>
        <div className="message-panel">
          <div className="message-list">
            {messages.map((message) => (
              <p key={message.message_id} className="message-bubble">{message.messages_text}<span>{message.created_at}</span></p>
            ))}
          </div>
          <form className="message-form" onSubmit={onSubmit}>
            <input type="hidden" name="chat_id" value={chats[0]?.chat_id ?? 501} />
            <Field id="messages_text" name="messages_text" label="Message" required />
            <button className="icon-button" type="submit" title="Send message"><Send size={18} /></button>
          </form>
          {notice ? <p className="notice">{notice}</p> : null}
        </div>
      </div>
    </section>
  );
}
