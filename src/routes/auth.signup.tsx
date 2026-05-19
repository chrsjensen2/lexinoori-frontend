import { createFileRoute, Link } from "@tanstack/react-router";
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

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Create account — lexinoori." }] }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <AuthScreen>
      <AuthHeader />
      <form
        onSubmit={(e) => e.preventDefault()}
        style={{ padding: "0 32px", marginTop: 32 }}
      >
        <AuthHeading
          title="Create your account"
          subtitle="Free to start. No card required."
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
          <AuthInput type="email" placeholder="Email address" autoComplete="email" />
          <PasswordInput placeholder="Password" autoComplete="new-password" />
        </div>
        <div style={{ marginTop: 20 }}>
          <PrimaryButton type="submit">Create account</PrimaryButton>
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
        Already have an account?{" "}
        <Link
          to="/auth/login"
          style={{ color: "#1A7A5E", fontWeight: 700, textDecoration: "none" }}
        >
          Log in
        </Link>
      </div>
    </AuthScreen>
  );
}
