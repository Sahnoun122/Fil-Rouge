"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Target,
  CalendarDays,
  BarChart3,
  TrendingUp,
  Shield,
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { redirectAfterLogin } from "@/src/utils/roleRedirect";

export default function LoginPage() {
  const router = useRouter();
  const { login, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    clearError();
    setIsSubmitting(true);

    try {
      const user = await login({
        email: email.trim().toLowerCase(),
        password,
      });
      router.replace(redirectAfterLogin(user));
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Erreur lors de la connexion"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex">

      {/* ── Left panel (decorative) ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 flex-col justify-between relative overflow-hidden bg-linear-to-br from-violet-950 via-violet-900 to-purple-950 p-12">
        {/* Grid texture */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,92,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.08) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -top-32 -right-20 w-96 h-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 rounded-full bg-purple-600/15 blur-3xl" />

        {/* Logo */}
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" fill="white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">
              MarketPlan <span className="text-violet-300">IA</span>
            </span>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-semibold text-violet-200 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Welcome back
            </div>
            <h1 className="text-3xl xl:text-4xl font-black leading-tight text-white mb-4">
              Ready to grow
              <br />
              <span className="bg-linear-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
                your business
              </span>
              <br />
              today?
            </h1>
            <p className="text-sm text-violet-200/80 leading-relaxed">
              Sign in to access your AI-powered marketing strategies,
              content calendar, and growth analytics.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: BarChart3, label: 'Strategies', value: '10K+' },
              { icon: TrendingUp, label: 'Avg. growth', value: '+38%' },
              { icon: Shield, label: 'Uptime', value: '99.9%' },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center"
              >
                <Icon className="w-4 h-4 text-violet-300 mx-auto mb-1" />
                <p className="text-lg font-black text-white">{value}</p>
                <p className="text-[10px] text-slate-400 font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {[
              { icon: Sparkles, text: 'AI-generated marketing strategy' },
              { icon: Target, text: 'Automated SWOT analysis' },
              { icon: CalendarDays, text: 'Smart content calendar' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-400/20 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-violet-300" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom note */}
        <div className="relative">
          <p className="text-xs text-slate-500">
            © 2026 MarketPlan IA · Secure login · 256-bit encryption
          </p>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 py-12 sm:px-10 lg:px-16 xl:px-20">

        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-4.5 h-4.5 text-white" fill="white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              MarketPlan <span className="text-violet-600">IA</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Enter your credentials to continue
            </p>
          </div>

          {/* Error banner */}
          {(formError || error) && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3">
              <span className="text-red-500 mt-0.5 shrink-0">✕</span>
              <p className="text-sm text-red-600">{formError || error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-violet-600 font-semibold hover:text-violet-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 px-5 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-1"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Register link */}
            <p className="text-center text-sm text-slate-500 pt-1">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-violet-600 font-semibold hover:text-violet-500 transition-colors"
              >
                Create one for free
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
