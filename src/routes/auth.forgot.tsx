import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AuthScreen,
  AuthHeader,
  AuthHeading,
  AuthInput,
  PrimaryButton,
} from "@/components/auth/AuthShell";

export const Route = createFileRoute("/auth/forgot")({
  head: () => ({ meta: [{ title: "Reset password — lexinoori." }] }),
  component: ForgotPage,
});

function ForgotPage() {
  return (
    <AuthScreen>
      <AuthHeader />
      <form
        onSubmit={(e) => e.preventDefault()}
        style={{ padding: "0 32px", marginTop: 32 }}
      >
        <AuthHeading
          title="Reset your password"
          subtitle="We'll send a reset link to your email."
        />
        <div style={{ marginTop: 20 }}>
          <AuthInput type="email" placeholder="Email address" autoComplete="email" />
        </div>
        <div style={{ marginTop: 20 }}>
          <PrimaryButton type="submit">Send reset link</PrimaryButton>
        </div>
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
