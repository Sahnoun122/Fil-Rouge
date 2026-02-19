"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { redirectAfterLogin } from "@/src/utils/roleRedirect";

export default function LoginPage() {
  const router = useRouter();
  const { login, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    clearError();
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      router.replace(redirectAfterLogin(user));
    } catch (err: any) {
      setFormError(err?.message || "Erreur lors de la connexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Login</h1>

      {(formError || error) && (
        <p style={{ color: "red" }}>{formError || error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
        />
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "..." : "Login"}
        </button>
      </form>
    </div>
  );
}
