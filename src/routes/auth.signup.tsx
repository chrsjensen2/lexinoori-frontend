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
import { useLanguage } from "@/lib/lang";
import { translations } from "@/lib/i18n";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Create account — lexinoori." }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const lang = useLanguage();
  const t = translations[lang];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
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
        <AuthHeading title={t.signupTitle} subtitle={t.signupSubtitle} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
          <AuthInput
            type="email"
            placeholder={t.emailPlaceholder}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <PasswordInput
            placeholder={t.passwordPlaceholder}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
        </div>
        {error && (
          <div style={{ color: "#FF3B30", fontSize: 13, marginTop: 12 }}>{error}</div>
        )}
        <div style={{ marginTop: 20 }}>
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? t.creating : t.createAccountLink}
          </PrimaryButton>
        </div>
        <OrDivider />
        <GoogleButton
          onClick={async () => {
            setError(null);
            const { error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: window.location.origin },
            });
            if (error) setError(error.message);
          }}
        />
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
        {t.alreadyAccount}{" "}
        <Link
          to="/auth/login"
          style={{ color: "#1A7A5E", fontWeight: 700, textDecoration: "none" }}
        >
          {t.signInLink}
        </Link>
      </div>
    </AuthScreen>
  );
}
