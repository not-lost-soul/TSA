"use client";
export default function SignInButton() {
  return (
    <button
      onClick={async () => {
        const r = await fetch("/api/auth/google", { method: "POST" });
        const j = await r.json();
        if (j.url) window.location.assign(j.url);
        else alert(j.error || "Sign-in is not configured.");
      }}
    >
      Continue with Google ↗
    </button>
  );
}
