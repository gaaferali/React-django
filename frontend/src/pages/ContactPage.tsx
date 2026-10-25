import { FormEvent, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { amanApi } from "../api/amanApi";
import { Field } from "../components/forms/Field";
import { PageHeader } from "../components/ui/PageHeader";
import type { Chat, ChatMessage } from "../types/aman";


const configuredWsUrl = import.meta.env.VITE_WS_BASE_URL?.replace(/\/$/, "");
const WS_BASE_URL =
  configuredWsUrl ||
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;

function newMessageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ContactPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notice, setNotice] = useState("");
  const [messageText, setMessageText] = useState("");
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const pendingMessageRef = useRef<{
    id: string;
    chatId: number;
    text: string;
  } | null>(null);
  const sendTimeoutRef = useRef<number | null>(null);
  const [searchParams] = useSearchParams();

  const propertyIdParam = searchParams.get("property_id");
  const propertyId = propertyIdParam ? Number(propertyIdParam) : null;

  useEffect(() => {
    let active = true;
    amanApi
      .contact(propertyId ?? undefined)
      .then((result) => {
        if (!active) return;
        setChats(result.chats);
        setMessages(result.messages);
        const propertyChat = propertyId
          ? result.chats.find((chat) => chat.property_id === propertyId)
          : undefined;
        setSelectedChatId(propertyChat?.id ?? result.chats[0]?.id ?? null);
      })
      .catch((error) => {
        if (active) {
          setNotice(error instanceof Error ? error.message : "Failed to load chats.");
        }
      });
    return () => {
      active = false;
    };
  }, [propertyId]);

  useEffect(() => {
    const token = localStorage.getItem("aman_access_token");
    if (!token) {
      setNotice("You are not authenticated.");
      return;
    }

    const socket = new WebSocket(
      `${WS_BASE_URL}/ws/chat/?token=${encodeURIComponent(token)}`
    );
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      setNotice("Connected to chat.");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat_joined") return;
      if (data.error) {
        setNotice(data.error);
        setSending(false);
        if (pendingMessageRef.current) {
          setMessageText(pendingMessageRef.current.text);
        }
        return;
      }

      const newMessage: ChatMessage = {
        id: data.message_id,
        chat: data.chat_id,
        sender: data.sender_user_id,
        client_message_id: data.client_message_id,
        messages_text: data.messages_text,
        created_at: data.created_at,
        read_at: data.read_at,
      };
      setMessages((previous) =>
        previous.some((message) => message.id === newMessage.id)
          ? previous
          : [...previous, newMessage]
      );

      const pendingMessage = pendingMessageRef.current;
      if (pendingMessage && data.client_message_id === pendingMessage.id) {
        const acknowledgedText = pendingMessage.text;
        pendingMessageRef.current = null;
        setMessageText((current) =>
          current === acknowledgedText ? "" : current
        );
        setSending(false);
        if (sendTimeoutRef.current !== null) {
          window.clearTimeout(sendTimeoutRef.current);
          sendTimeoutRef.current = null;
        }
      }
    };

    socket.onclose = () => {
      setConnected(false);
      setSending(false);
      if (pendingMessageRef.current) {
        setMessageText(pendingMessageRef.current.text);
      }
      setNotice("Chat connection closed.");
    };
    socket.onerror = () => {
      setConnected(false);
      setSending(false);
      if (pendingMessageRef.current) {
        setMessageText(pendingMessageRef.current.text);
      }
      setNotice("Chat connection error.");
    };

    return () => {
      if (sendTimeoutRef.current !== null) {
        window.clearTimeout(sendTimeoutRef.current);
      }
      socket.close();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!selectedChatId || !socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ action: "join_chat", chat_id: selectedChatId }));
  }, [selectedChatId, connected]);

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = messageText.trim();
    const socket = socketRef.current;
    if (!selectedChatId) {
      setNotice("Select a chat first.");
      return;
    }
    if (!text || sending) return;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setNotice("Chat is not connected.");
      return;
    }

    const pendingMessage = pendingMessageRef.current;
    const clientMessageId =
      pendingMessage?.chatId === selectedChatId && pendingMessage.text === text
        ? pendingMessage.id
        : newMessageId();
    pendingMessageRef.current = {
      id: clientMessageId,
      chatId: selectedChatId,
      text,
    };
    setSending(true);
    socket.send(
      JSON.stringify({
        action: "send_message",
        chat_id: selectedChatId,
        client_message_id: clientMessageId,
        messages_text: text,
      })
    );
    setMessageText("");
    sendTimeoutRef.current = window.setTimeout(() => {
      setSending(false);
      if (pendingMessageRef.current?.id === clientMessageId) {
        setMessageText(pendingMessageRef.current.text);
      }
      setNotice("Message acknowledgement timed out. You can try again.");
    }, 10000);
  }

  let currentUserId: number | null = null;
  try {
    currentUserId = JSON.parse(localStorage.getItem("aman_user") || "{}").id ?? null;
  } catch {
    currentUserId = null;
  }

  return (
    <section>
      <PageHeader
        eyebrow="FR-11 / UC-11"
        title="Contact"
        description="Messaging interface for seekers and owners, linked to active property offers."
      />
      <div className="conversation-layout">
        <aside className="conversation-list">
          {chats.map((chat) => {
            const otherUserName =
              chat.seeker_id === currentUserId ? chat.owner_name : chat.seeker_name;
            return (
              <button
                key={chat.id}
                className="conversation-item"
                type="button"
                onClick={() => {
                  setSelectedChatId(chat.id);
                  setNotice("");
                }}
              >
                <strong>{otherUserName ?? "Unknown user"}</strong>
                <span>{chat.property_title}</span>
                <span>{chat.last_message}</span>
              </button>
            );
          })}
        </aside>

        <div className="message-panel">
          <div className="message-list">
            {messages
              .filter((message) => message.chat === selectedChatId)
              .map((message) => (
                <p key={message.id} className="message-bubble">
                  {message.messages_text}
                  <span>{new Date(message.created_at).toLocaleString()}</span>
                </p>
              ))}
          </div>

          <form className="message-form" onSubmit={sendMessage}>
            <Field
              id="messages_text"
              name="messages_text"
              label="Message"
              required
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
            />
            <button
              className="icon-button"
              type="submit"
              title="Send message"
              disabled={!connected || !selectedChatId || sending}
            >
              <Send size={18} />
            </button>
          </form>
          {notice ? <p className="notice">{notice}</p> : null}
        </div>
      </div>
    </section>
  );
}
