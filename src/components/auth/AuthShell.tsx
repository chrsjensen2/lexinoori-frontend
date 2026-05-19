import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

export function AuthScreen({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111111",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {children}
    </div>
  );
}

export function AuthHeader() {
  return (
    <div style={{ padding: "48px 24px 0" }}>
      <div
        style={{
          color: "#FFFFFF",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          lineHeight: 1.1,
        }}
      >
        lexinoori.
      </div>
      <div style={{ color: "#8E8E93", fontSize: 14, marginTop: 6 }}>
        Every angle. One story.
      </div>
    </div>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <h1
        style={{
          color: "#FFFFFF",
          fontSize: 26,
          fontWeight: 700,
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
      <div style={{ color: "#8E8E93", fontSize: 13, marginTop: 8 }}>{subtitle}</div>
    </>
  );
}

export function AuthInput({
  type = "text",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      type={type}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
      style={{
        width: "100%",
        height: 56,
        background: "#1C1C1E",
        border: `1px solid ${focused ? "#1A7A5E" : "#2C2C2E"}`,
        borderRadius: 12,
        color: "#FFFFFF",
        fontSize: 15,
        padding: "0 16px",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
}

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        {...props}
        type={show ? "text" : "password"}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={{
          width: "100%",
          height: 56,
          background: "#1C1C1E",
          border: `1px solid ${focused ? "#1A7A5E" : "#2C2C2E"}`,
          borderRadius: 12,
          color: "#FFFFFF",
          fontSize: 15,
          padding: "0 48px 0 16px",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          background: "transparent",
          border: "none",
          color: "#8E8E93",
          cursor: "pointer",
          padding: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        width: "100%",
        height: 56,
        background: "#1A7A5E",
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: 700,
        borderRadius: 24,
        border: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export function OrDivider() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "16px 0",
      }}
    >
      <div style={{ flex: 1, height: 1, background: "#2C2C2E" }} />
      <span style={{ color: "#8E8E93", fontSize: 13 }}>or</span>
      <div style={{ flex: 1, height: 1, background: "#2C2C2E" }} />
    </div>
  );
}

export function GoogleButton() {
  return (
    <button
      type="button"
      style={{
        width: "100%",
        height: 56,
        background: "#1C1C1E",
        border: "1px solid #2C2C2E",
        borderRadius: 24,
        color: "#FFFFFF",
        fontSize: 16,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.3-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 43.5c5 0 9.6-1.9 13.1-5l-6-5.1c-2 1.4-4.4 2.1-7.1 2.1-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39 16.2 43.5 24 43.5z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.2 5.4l6 5.1c-.4.4 6.4-4.7 6.4-14.5 0-1.2-.1-2.3-.3-3.5z" />
      </svg>
      <span>Continue with Google</span>
    </button>
  );
}
