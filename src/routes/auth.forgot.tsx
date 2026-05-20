import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AuthScreen,
  AuthHeader,
  AuthHeading,
  AuthInput,
  PrimaryButton,
} from "@/components/auth/AuthShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/forgot")({
  head: () => ({ meta: [{ title: "Reset password — lexinoori." }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
  };

  return (
    <AuthScreen>
      <AuthHeader />
      <form onSubmit={onSubmit} style={{ padding: "0 32px", marginTop: 32 }}>
        <AuthHeading
          title="Reset your password"
          subtitle="We'll send a reset link to your email."
        />
        <div style={{ marginTop: 20 }}>
          <AuthInput
            type="email"
            placeholder="Email address"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
        </div>
        <div style={{ marginTop: 20 }}>
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </PrimaryButton>
        </div>
        {success && (
          <div style={{ color: "#1A7A5E", fontSize: 13, marginTop: 12, textAlign: "center" }}>
            Check your email for a reset link.
          </div>
        )}
        {error && (
          <div style={{ color: "#FF3B30", fontSize: 13, marginTop: 12, textAlign: "center" }}>
            {error}
          </div>
        )}
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Link
            to="/auth/login"
            style={{ color: "#1A7A5E", fontSize: 14, textDecoration: "none" }}
          >
            ← Back to log in
          </Link>
        </div>
      </form>
    </AuthScreen>
  );
}
