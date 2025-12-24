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

  // Estado para controlar si el sidebar está abierto o cerrado
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil/tablet y ajustar sidebar
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

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
    
    // En móvil, cerrar sidebar después de crear conversación
    if (isMobile) {
      setSidebarOpen(false);
    }
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

  // Función para seleccionar conversación (con manejo responsive)
  const selectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    fetchHistory(conversationId, localStorage.getItem("token")!);
    
    // En móvil, cerrar sidebar después de seleccionar
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-blue-900 text-gray-100 relative">

      {/* Overlay para móvil cuando sidebar está abierto */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR - Responsive y colapsable */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-30
        w-64 lg:w-64
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        border-r border-blue-800/30 bg-slate-900/95 backdrop-blur-sm p-4 flex flex-col
        h-full
      `}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="font-bold">J</span>
              </div>
              <h2 className="text-lg font-semibold">Conversaciones</h2>
            </div>
            
            {/* Botón para cerrar sidebar en móvil */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-slate-800/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <button
            onClick={createConversation}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-3 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl mb-4 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva conversación
          </button>
        </div>

        {/* CONVERSATIONS LIST WITH CUSTOM SCROLLBAR */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-800/50 scrollbar-thumb-blue-600/50 hover:scrollbar-thumb-blue-600 scrollbar-track-rounded-full scrollbar-thumb-rounded-full">
          <ul className="space-y-1 pr-2">
            {conversations.map((c) => (
              <li
                key={c._id}
                className={`group flex items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-200 ${
                  c._id === activeConversation
                    ? "bg-blue-900/50 border-l-4 border-blue-500 shadow-inner"
                    : "hover:bg-slate-800/50 border-l-4 border-transparent"
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
                    className="w-full rounded border border-blue-700 bg-slate-800 px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span
                    onClick={() => selectConversation(c._id)}
                    onDoubleClick={() => {
                      setEditingId(c._id);
                      setEditingTitle(c.title || "Conversación");
                    }}
                    className="flex-1 cursor-pointer truncate text-sm font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="truncate">{c.title || "Nueva conversación"}</span>
                    </div>
                  </span>
                )}

                {/* DELETE */}
                <button
                  onClick={() => deleteConversation(c._id)}
                  className="ml-2 hidden text-xs text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20 transition-colors group-hover:block"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {username && (
          <div className="mt-4 pt-4 border-t border-blue-800/30">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                <span className="font-semibold text-sm">{username?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{username}</p>
                <button
                  onClick={() => {
                    localStorage.clear();
                    router.push("/login");
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN CHAT AREA */}
      <div className="flex flex-1 flex-col w-full lg:w-auto">
        {/* HEADER */}
        <header className="border-b border-blue-800/30 bg-slate-900/80 backdrop-blur-sm p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Botón para abrir sidebar en móvil */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-800/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <span className="font-bold text-xl">J</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">JaviAI</h1>
                <p className="text-xs text-blue-300/70">Asistente inteligente</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!username ? (
              <>
                <button
                  onClick={() => router.push("/login")}
                  className="px-3 py-2 rounded-lg border border-blue-700 text-blue-300 hover:bg-blue-900/30 hover:text-blue-200 transition-colors text-sm font-medium"
                >
                  <span className="hidden sm:inline">Iniciar sesión</span>
                  <span className="sm:hidden">Login</span>
                </button>
                <button
                  onClick={() => router.push("/register")}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-200 text-sm font-medium shadow-lg"
                >
                  <span className="hidden sm:inline">Registrarse</span>
                  <span className="sm:hidden">Registro</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:block text-sm px-3 py-1.5 rounded-lg bg-blue-900/30 border border-blue-700/50">
                  <span className="hidden md:inline">👤 {username}</span>
                  <span className="md:hidden">👤 {username?.slice(0, 10)}{username?.length > 10 ? '...' : ''}</span>
                </div>
                <button
                  onClick={() => {
                    localStorage.clear();
                    router.push("/login");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all duration-200"
                >
                  <span className="hidden sm:inline">Cerrar sesión</span>
                  <span className="sm:hidden">Salir</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* MESSAGES CONTAINER WITH CUSTOM SCROLLBAR */}
        <main className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-900/50 to-navy-900/50 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-600/30 hover:scrollbar-thumb-blue-600/50 scrollbar-track-rounded-full scrollbar-thumb-rounded-full">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-800/30 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-blue-100 mb-2">Comienza una conversación</h3>
                <p className="text-blue-300/70">Escribe tu primer mensaje para empezar a chatear con JaviAI</p>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-xl rounded-2xl px-4 py-3 sm:px-5 sm:py-3 ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-br-none shadow-xl"
                      : "bg-slate-800/70 border border-blue-900/30 rounded-bl-none shadow-lg"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      m.role === "user" 
                        ? "bg-blue-800" 
                        : "bg-indigo-900"
                    }`}>
                      {m.role === "user" ? "👤" : "🤖"}
                    </div>
                    <span className="text-xs font-medium opacity-70">
                      {m.role === "user" ? username || "Tú" : "JaviAI"}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap break-words">{m.content}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/70 border border-blue-900/30 rounded-2xl rounded-bl-none px-4 py-3 sm:px-5 sm:py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span className="text-sm text-blue-300">Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* INPUT AREA */}
        <footer className="border-t border-blue-800/30 bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="max-w-3xl mx-auto flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                className="w-full rounded-xl bg-slate-800/70 border border-blue-800/30 px-4 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-12"
                placeholder="Escribe tu mensaje aquí..."
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed px-4 sm:px-6 py-3 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center gap-2 min-w-[80px] sm:min-w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </div>
          <div className="max-w-3xl mx-auto mt-2 text-center">
            <p className="text-xs text-blue-300/50">
              <span className="hidden sm:inline">Presiona Enter para enviar • Shift + Enter para nueva línea</span>
              <span className="sm:hidden">Enter = enviar, Shift+Enter = nueva línea</span>
            </p>
          </div>
        </footer>
      </div>

      {/* Estilos globales para scrollbar personalizado */}
      <style jsx global>{`
        /* Estilos para navegadores WebKit (Chrome, Safari, Edge) */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 10px;
          transition: background 0.2s ease;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
        
        /* Estilos para Firefox */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.3) transparent;
        }
        
        /* Estilos específicos para el área de mensajes */
        main::-webkit-scrollbar-track {
          background: transparent;
          margin: 4px 0;
        }
        
        main::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.2);
        }
        
        main::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.4);
        }
        
        /* Estilos específicos para la sidebar */
        aside > div:first-of-type::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 10px;
          margin: 2px;
        }
        
        aside > div:first-of-type::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.4);
        }
        
        aside > div:first-of-type::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.6);
        }
        
        /* Smooth scrolling */
        .overflow-y-auto {
          scroll-behavior: smooth;
        }
        
        /* Ajustes responsive */
        @media (max-width: 640px) {
          .max-w-3xl {
            max-width: 100%;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}