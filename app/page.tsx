"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  role: "user" | "bot";
  content: string;
};

export default function Home() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  // 🔐 Proteger ruta + cargar historial
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (!token) {
      setUsername(null);
      return;
    }

    if (storedUsername) {
      setUsername(storedUsername);
    }

    fetchHistory(token);
  }, []);

  // 📜 Obtener historial
  const fetchHistory = async (token: string) => {
    try {
      const res = await fetch("http://localhost:3000/chat/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error cargando historial");
      }

      setMessages(data.messages);
    } catch (error) {
      console.error("Error cargando historial:", error);
    }
  };

  // 💬 Enviar mensaje
  const sendMessage = async () => {
    if (!input.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: input },
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: input }],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error en el chat");
      }

      setMessages([
        ...newMessages,
        { role: "bot", content: data.reply },
      ]);
    } catch (error) {
      console.error("Error enviando mensaje:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      {/* HEADER */}
      <header className="border-b bg-white p-4 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-lg font-bold">ChatBot 🤖</h1>

          {username ? (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                {username}
              </span>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("username");
                  router.push("/login");
                }}
                className="rounded border px-3 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="flex gap-3 text-sm">
              <button
                onClick={() => router.push("/login")}
                className="rounded border px-3 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Iniciar sesión
              </button>

              <button
                onClick={() => router.push("/register")}
                className="rounded bg-black px-3 py-1 text-white hover:opacity-90 dark:bg-white dark:text-black"
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MENSAJES */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-xl rounded-lg px-4 py-2 ${
              m.role === "user"
                ? "ml-auto bg-black text-white dark:bg-white dark:text-black"
                : "mr-auto bg-zinc-200 dark:bg-zinc-800"
            }`}
          >
            {m.content}
          </div>
        ))}

        {loading && (
          <div className="mr-auto max-w-xl rounded-lg bg-zinc-200 px-4 py-2 dark:bg-zinc-800">
            Escribiendo...
          </div>
        )}
      </main>

      {/* INPUT */}
      <footer className="border-t bg-white p-4 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1 rounded border px-3 py-2"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim() || !username}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            Enviar
          </button>
        </div>
      </footer>
    </div>
  );
}
