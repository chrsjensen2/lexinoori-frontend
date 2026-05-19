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

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Log in — lexinoori." }] }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthScreen>
      <AuthHeader />
      <form
        onSubmit={(e) => e.preventDefault()}
        style={{ padding: "0 32px", marginTop: 32 }}
      >
        <AuthHeading title="Welcome back." subtitle="Good to have you back." />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
          <AuthInput type="email" placeholder="Email address" autoComplete="email" />
          <PasswordInput placeholder="Password" autoComplete="current-password" />
        </div>
        <div style={{ marginTop: 8, textAlign: "right" }}>
          <Link
            to="/auth/forgot"
            style={{ color: "#1A7A5E", fontSize: 13, textDecoration: "none" }}
          >
            Forgot password?
          </Link>
        </div>
        <div style={{ marginTop: 20 }}>
          <PrimaryButton type="submit">Log in</PrimaryButton>
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
