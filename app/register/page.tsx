"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Error al registrar");
        return;
      }

      setMessage("✅ Usuario registrado correctamente");
      setUsername("");
      setEmail("");
      setPassword("");

      // Redirigir al login después de registrar
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setMessage("❌ Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-navy-900 to-blue-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 backdrop-blur-sm p-8 shadow-2xl border border-blue-800/30">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">J</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Crear Cuenta
          </h1>
          <p className="text-blue-300/70 mt-2">Únete a JaviAI y comienza a chatear</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Usuario */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-blue-900/50 border border-blue-700/50 flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Nombre de usuario
              </div>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-800/70 border border-blue-800/30 px-4 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
              placeholder="Ingresa tu nombre de usuario"
            />
          </div>

          {/* Campo Email */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-blue-900/50 border border-blue-700/50 flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89-4.26a2 2 0 012.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                Correo electrónico
              </div>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-slate-800/70 border border-blue-800/30 px-4 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
              placeholder="tu@email.com"
            />
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-blue-900/50 border border-blue-700/50 flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                Contraseña
              </div>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-800/70 border border-blue-800/30 px-4 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
              placeholder="Crea una contraseña segura"
            />
          </div>

          {/* Mensaje de estado */}
          {message && (
            <div className={`rounded-xl px-4 py-3 border ${
              message.startsWith("✅") 
                ? "bg-green-900/20 border-green-700/30 text-green-400" 
                : "bg-red-900/20 border-red-700/30 text-red-400"
            }`}>
              <div className="flex items-center gap-2">
                {message.startsWith("✅") ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <p className="text-sm font-medium">{message}</p>
              </div>
            </div>
          )}

          {/* Botón de registro */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed px-6 py-4 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Registrando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Crear cuenta
              </>
            )}
          </button>
        </form>

        {/* Enlace a login */}
        <div className="mt-8 pt-6 border-t border-blue-800/30 text-center">
          <p className="text-blue-300/70">
            ¿Ya tienes una cuenta?{" "}
            <a 
              href="/login" 
              className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors"
            >
              Inicia sesión aquí
            </a>
          </p>
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center">
          <p className="text-xs text-blue-300/50">
            Al registrarte, aceptas nuestros{" "}
            <a href="#" className="underline hover:text-blue-300">Términos de servicio</a>{" "}
            y{" "}
            <a href="#" className="underline hover:text-blue-300">Política de privacidad</a>
          </p>
        </div>
      </div>
    </div>
  );
}