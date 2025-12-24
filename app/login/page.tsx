"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }

      // Guardar token
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);

      // Redirigir al chat
      router.push("/");
    } catch (err) {
      setError("Error de conexión con el servidor");
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
            Bienvenido de nuevo
          </h1>
          <p className="text-blue-300/70 mt-2">Accede a tu cuenta de JaviAI</p>
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
              autoComplete="username"
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
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
          </div>

          

          {/* Mensaje de error */}
          {error && (
            <div className="rounded-xl bg-red-900/20 border border-red-700/30 px-4 py-3">
              <div className="flex items-center gap-2 text-red-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Botón de inicio de sesión */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed px-6 py-4 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Iniciando sesión...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Acceder a la cuenta
              </>
            )}
          </button>
        </form>

        {/* Enlace a registro */}
        <div className="mt-8 pt-6 border-t border-blue-800/30 text-center">
          <p className="text-blue-300/70">
            ¿No tienes una cuenta?{" "}
            <a 
              href="/register" 
              className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors"
            >
              Regístrate aquí
            </a>
          </p>
        </div>



        {/* Información adicional */}
        <div className="mt-6 text-center">
          <p className="text-xs text-blue-300/50">
            Al iniciar sesión, aceptas nuestros{" "}
            <a href="#" className="underline hover:text-blue-300">Términos de servicio</a>{" "}
            y{" "}
            <a href="#" className="underline hover:text-blue-300">Política de privacidad</a>
          </p>
        </div>
      </div>
    </div>
  );
}