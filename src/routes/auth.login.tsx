import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AuthScreen,
  AuthHeader,
  AuthHeading,
  AuthInput,
  PasswordInput,
  PrimaryButton,
  OrDivider,
  GoogleButton,
} from "@/components/auth/AuthShell";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Log in — lexinoori." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/" });
  };

  return (
    <AuthScreen>
      <AuthHeader />
      <form onSubmit={onSubmit} style={{ padding: "0 32px", marginTop: 32 }}>
        <AuthHeading title="Welcome back." subtitle="Good to have you back." />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
          <AuthInput
            type="email"
            placeholder="Email address"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <PasswordInput
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
        </div>
        {error && (
          <div style={{ color: "#FF3B30", fontSize: 13, marginTop: 12 }}>{error}</div>
        )}
        <div style={{ marginTop: 8, textAlign: "right" }}>
          <Link
            to="/auth/forgot"
            style={{ color: "#1A7A5E", fontSize: 13, textDecoration: "none" }}
          >
            Forgot password?
          </Link>
        </div>
        <div style={{ marginTop: 20 }}>
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Log in"}
          </PrimaryButton>
        </div>
        <OrDivider />
        <GoogleButton />
      </form>
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: "calc(32px + env(safe-area-inset-bottom))",
          textAlign: "center",
          fontSize: 14,
          color: "#8E8E93",
        }}
      >
        Don't have an account?{" "}
        <Link
          to="/auth/signup"
          style={{ color: "#1A7A5E", fontWeight: 700, textDecoration: "none" }}
        >
          Sign up
        </Link>
      </div>
    </AuthScreen>
  );
}
