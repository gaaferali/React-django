import { FormEvent, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { amanApi } from "../api/amanApi";
import { Field } from "../components/forms/Field";
import { PageHeader } from "../components/ui/PageHeader";
import type { Chat, ChatMessage} from "../types/aman";
import { useSearchParams } from "react-router-dom";

const WS_BASE_URL =
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;
export function ContactPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notice, setNotice] = useState("");
  const [messageText, setMessageText] = useState("");
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

  const [searchParams] = useSearchParams();

  const propertyIdParam =
  searchParams.get("property_id");

  const propertyId = propertyIdParam
  ? Number(propertyIdParam)
  : null;
  /*
   * 1. Load chats and previous messages through HTTP
   */
  /*useEffect(() => {
    amanApi.contact().then((result) => {
      setChats(result.chats);
      setMessages(result.messages);
    });
  }, []);*/

useEffect(() => {

  amanApi
    .contact(propertyId ?? undefined)
    .then((result) => {

      setChats(result.chats);

      setMessages(result.messages);

      // ------------------------------------
      // Property was selected
      // ------------------------------------

      if (propertyId) {

        const propertyChat =
          result.chats.find(
            (chat) =>
              chat.property_id === propertyId
          );

        if (propertyChat) {

          setSelectedChatId(
            propertyChat.id
          );
        }

      }

      // ------------------------------------
      // Contact page opened normally
      // ------------------------------------

      else {

        setSelectedChatId(
          null
        );
      }

    })
    .catch((error) => {

      console.error(
        "Failed to load chats:",
        error
      );

      setNotice(
        "Failed to load chats."
      );

    });

}, [propertyId]);
/*
  amanApi
    .contact(propertyId)
    .then((result) => {
      setChats(result.chats);
      setMessages(result.messages);

      if (result.chats.length > 0) {
        setSelectedChatId(result.chats[0].chat_id);
      }
    })
    .catch((error) => {
      console.error("Failed to load chat:", error);
      setNotice("Failed to load chat.");
    });
}, [propertyId]);*/


  /*
   * 2. Open WebSocket connection
   */
  useEffect(() => {
  const token = localStorage.getItem(
    "aman_access_token"
  );

  if (!token) {
    setNotice("You are not authenticated.");
    return;
  }

  const socket = new WebSocket(
  `${WS_BASE_URL}/ws/chat/?token=${encodeURIComponent(token)}`
);

  socketRef.current = socket;

socket.onopen = () => {

  console.log(
    "WebSocket connected"
  );

  setConnected(true);

  setNotice(
    "Connected to chat."
  );
};

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    console.log(
      "WebSocket message:",
      data
    );

    if (data.type === "chat_joined") {
      console.log(
        "Joined chat:",
        data.chat_id
      );

      return;
    }

    if (data.error) {
      setNotice(data.error);
      return;
    }

    const newMessage: ChatMessage = {
     id: data.message_id,
    chat: data.chat_id,
    sender: data.sender_user_id,
    messages_text: data.messages_text,
    created_at: data.created_at,
    read_at: data.read_at,
};

    setMessages((previous) => [
      ...previous,
      newMessage,
    ]);
  };

  socket.onclose = (event) => {
  console.log("WebSocket disconnected");
  console.log("Code:", event.code);
  console.log("Reason:", event.reason);
  console.log("Clean:", event.wasClean);

  setConnected(false);
  setNotice(
    `Chat connection closed. Code: ${event.code}`
  );
};

  socket.onerror = (error) => {
    console.error(
      "WebSocket error:",
      error
    );

    setConnected(false);
    setNotice(
      "Chat connection error."
    );
  };

  return () => {
    socket.close();
    socketRef.current = null;
  };
}, []);


/*useEffect(() => {
  const socket = socketRef.current;

  if (
    !socket ||
    socket.readyState !== WebSocket.OPEN ||
    !selectedChatId
  ) {
    return;
  }

  socket.send(
    JSON.stringify({
      action: "join_chat",
      chat_id: selectedChatId,
    })
  );

  console.log(
    "Joining chat:",
    selectedChatId
  );

}, [selectedChatId, connected]);*/



useEffect(() => {

  if (!selectedChatId) {
    return;
  }

  const socket = socketRef.current;

  if (
    !socket ||
    socket.readyState !== WebSocket.OPEN
  ) {
    return;
  }

  socket.send(
    JSON.stringify({
      action: "join_chat",
      chat_id: selectedChatId,
    })
  );

}, [selectedChatId, connected]);
/*useEffect(() => {

  if (!selectedChatId) {
    return;
  }

  const socket = socketRef.current;

  if (
    !socket ||
    socket.readyState !== WebSocket.OPEN
  ) {
    return;
  }

  console.log(
    "Joining chat:",
    selectedChatId
  );

  socket.send(
    JSON.stringify({
      action: "join_chat",
      chat_id: selectedChatId,
    })
  );

}, [selectedChatId, connected]);*/


  /*
   * 3. Send message through WebSocket
   */
  function sendMessage(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  if (!selectedChatId) {
    setNotice("Select a chat first.");
    return;
  }

  if (!messageText.trim()) {
    return;
  }

  const socket = socketRef.current;

  if (
    !socket ||
    socket.readyState !== WebSocket.OPEN
  ) {
    setNotice("Chat is not connected.");
    return;
  }

  socket.send(
    JSON.stringify({
      action: "send_message",
      chat_id: selectedChatId,
      messages_text: messageText.trim(),
    })
  );

  setMessageText("");
}


const currentUserId = Number(
  localStorage.getItem("aman_user_id")
);
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
      chat.seeker_id === currentUserId
        ? chat.seeker_name
        : chat.owner_name ;

    return (

      <button
        key={chat.id}
        className="conversation-item"
        type="button"
        onClick={() => {

          setSelectedChatId(
            chat.id
          );

          setNotice("");
        }}
      >

        <strong>
          {otherUserName ?? "Unknown user"}
        </strong>

        <span>
          {chat.property_title}
        </span>

        <span>
          {chat.last_message}
        </span>

      </button>

    );

  })}

</aside>

        <div className="message-panel">

          <div className="message-list">

  {messages
    .filter(
      (message) =>
        message.chat === selectedChatId
    )
    .map((message) => (

      <p
        key={message.id}
        className="message-bubble"
      >

        {message.messages_text}

        <span>
          {message.created_at}
        </span>

      </p>

    ))}

</div>

          <form
            className="message-form"
            onSubmit={sendMessage}
          >
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
              disabled={!connected}
            >
              <Send size={18} />
            </button>
          </form>

          {notice ? (
            <p className="notice">
              {notice}
            </p>
          ) : null}

        </div>
      </div>
    </section>
  );
}