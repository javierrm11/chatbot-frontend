"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  role: "user" | "bot";
  content: string;
};

type Conversation = {
  _id: string;
  title: string;
};

export default function Home() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // 🔐 INIT
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (!token) return;

    setUsername(storedUsername);
    fetchConversations(token);
  }, []);

  // 📂 CONVERSATIONS
  const fetchConversations = async (token: string) => {
    const res = await fetch("http://localhost:3000/api/conversation", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setConversations(Array.isArray(data) ? data : []);

    if (data.length > 0) {
      setActiveConversation(data[0]._id);
      fetchHistory(data[0]._id, token);
    }
  };

  // 📜 HISTORY
  const fetchHistory = async (conversationId: string, token: string) => {
    try {
      const res = await fetch(
        `http://localhost:3000/chat/history/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    }
  };

  // 🆕 CREATE CONVERSATION
  const createConversation = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("http://localhost:3000/api/conversation", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const conv = await res.json();
    setConversations([conv, ...conversations]);
    setActiveConversation(conv._id);
    setMessages([]);
  };

  // 💬 SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim()) return;
  
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
  
    // 🔹 Si no hay conversación activa, crear una nueva
    let conversationId = activeConversation;
    if (!conversationId) {
      const res = await fetch("http://localhost:3000/api/conversation", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const conv = await res.json();
  
      setConversations((prev) => [conv, ...prev]);
      setActiveConversation(conv._id);
      setMessages([]);
      conversationId = conv._id;
    }
  
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
  
    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          messages: [userMessage],
        }),
      });
  
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: data.reply },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // RENAME CONVERSATION
  const renameConversation = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token || !editingTitle.trim()) return;
  
    const res = await fetch(`http://localhost:3000/api/conversation/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: editingTitle }),
    });
  
    const updated = await res.json();
  
    setConversations((prev) =>
      prev.map((c) => (c._id === id ? updated : c))
    );
  
    setEditingId(null);
  };

  // DELETE CONVERSATION
  const deleteConversation = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    if (!confirm("¿Eliminar esta conversación?")) return;
  
    await fetch(`http://localhost:3000/api/conversation/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    setConversations((prev) => prev.filter((c) => c._id !== id));
  
    if (activeConversation === id) {
      setActiveConversation(null);
      setMessages([]);
    }
  };
  

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black">

      {/* SIDEBAR */}
      <aside className="w-64 border-r bg-white p-4 dark:bg-zinc-900">
        <button
          onClick={createConversation}
          className="mb-4 w-full rounded bg-black py-2 text-white dark:bg-white dark:text-black"
        >
          + Nueva conversación
        </button>

        <ul className="space-y-2 text-sm">
  {conversations.map((c) => (
    <li
      key={c._id}
      className={`group flex items-center justify-between rounded px-2 py-1 ${
        c._id === activeConversation
          ? "bg-zinc-200 dark:bg-zinc-800"
          : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
      }`}
    >
      {/* TITLE */}
      {editingId === c._id ? (
        <input
          autoFocus
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onBlur={() => renameConversation(c._id)}
          onKeyDown={(e) => e.key === "Enter" && renameConversation(c._id)}
          className="w-full rounded border px-1 text-sm"
        />
      ) : (
        <span
          onClick={() => {
            setActiveConversation(c._id);
            fetchHistory(c._id, localStorage.getItem("token")!);
          }}
          onDoubleClick={() => {
            setEditingId(c._id);
            setEditingTitle(c.title || "Conversación");
          }}
          className="flex-1 cursor-pointer truncate"
        >
          {c.title || "Conversación"}
        </span>
      )}

      {/* DELETE */}
      <button
        onClick={() => deleteConversation(c._id)}
        className="ml-2 hidden text-xs text-red-500 group-hover:block"
        title="Eliminar"
      >
        🗑️
      </button>
    </li>
  ))}
</ul>

      </aside>

      {/* CHAT */}
      <div className="flex flex-1 flex-col">

        {/* HEADER */}
        <header className="border-b bg-white p-4 dark:bg-zinc-900 flex justify-between">
          <h1 className="font-bold">ChatBot 🤖</h1>

            {username ? (
            <div className="flex items-center gap-2">
              <span className="text-sm flex items-center gap-1">
              <span>👤</span> {username}
              </span>
              <button
              onClick={() => {
              localStorage.clear();
              router.push("/login");
              }}
              className="text-sm"
              >
              Cerrar sesión
              </button>
            </div>
            ) : (
            <div className="flex items-center gap-2">
              <button
              onClick={() => router.push("/login")}
              className="text-sm"
              >
              Iniciar sesión
              </button>
              <button
              onClick={() => router.push("/register")}
              className="text-sm"
              >
              Registrarse
              </button>
            </div>
            )}
        </header>

        {/* MESSAGES */}
        <main className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-xl rounded px-4 py-2 ${
                m.role === "user"
                  ? "ml-auto bg-black text-white dark:bg-white dark:text-black"
                  : "mr-auto bg-zinc-200 dark:bg-zinc-800"
              }`}
            >
              {m.content}
            </div>
          ))}

          {loading && <div className="text-sm">Escribiendo...</div>}
        </main>

        {/* INPUT */}
        <footer className="border-t bg-white p-4 dark:bg-zinc-900 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 rounded border px-3 py-2"
            placeholder="Escribe un mensaje..."
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
          >
            Enviar
          </button>
        </footer>
      </div>
    </div>
  );
}
