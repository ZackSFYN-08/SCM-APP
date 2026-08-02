"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuthStore } from "@/lib/stores/authStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Globe, AlertTriangle, ShieldCheck, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { t, locale, toggleLocale } = useTranslation();
  const { user, signIn, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await signIn(userCredential.user);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setErrorMsg(locale === "id" ? "Email atau password salah." : "Invalid email or password.");
      } else {
        setErrorMsg(err.message || "An error occurred during authentication.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await signIn(userCredential.user);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Google Login error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setErrorMsg(err.message || "An error occurred with Google SSO.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      {/* Header Bar */}
      <header className="flex justify-between items-center px-6 py-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="font-bold text-base">F</span>
          </div>
          <span className="font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            FlowChain
          </span>
        </div>
        
        {/* Language switch */}
        <button
          onClick={toggleLocale}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-outline hover:text-inverse-primary hover:bg-white/5 rounded-lg transition-colors border border-outline-variant/10 font-mono"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{locale.toUpperCase()}</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md glass-panel p-8 rounded-2xl border border-white/10"
        >
          <div className="text-center mb-8">
            <h1 className="text-headline-lg font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
              {locale === "id" ? "Selamat Datang Kembali" : "Welcome Back"}
            </h1>
            <p className="text-body-sm text-outline mt-2">
              {locale === "id"
                ? "Masuk ke dashboard Inteligensi Supply Chain Anda"
                : "Sign in to your Supply Chain Intelligence dashboard"}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-error/15 border border-error/30 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
              <p className="text-body-sm text-error/90 font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input
                  type="email"
                  required
                  placeholder="admin@flowchain.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input rounded-lg pl-10 pr-4 py-2.5 text-body-sm text-white placeholder:text-outline/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                {locale === "id" ? "Kata Sandi" : "Password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input rounded-lg pl-10 pr-4 py-2.5 text-body-sm text-white placeholder:text-outline/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-2.5 rounded-lg text-body-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                locale === "id" ? "Masuk dengan Email" : "Sign In with Email"
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0D0E15] px-3 text-outline font-semibold">
                {locale === "id" ? "atau masuk dengan" : "or continue with"}
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all text-body-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>Google SSO</span>
          </button>
        </motion.div>
      </main>

      {/* Footer Info */}
      <footer className="py-6 text-center text-xs text-outline/50 relative z-10">
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary-container" />
          <span className="font-semibold text-outline/70">Secure Enterprise Portal</span>
        </div>
        <p>© 2026 FlowChain Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
