"use client";
import { useState } from "react";
export default function AdminUnlock() {
  const [code, setCode] = useState(""),
    [error, setError] = useState("");
  return (
    <div className="auth-panel">
      <h2>Owner access</h2>
      <p>
        Enter the owner access code. Admin access uses a separate signed server
        session and does not use Google OAuth.
      </p>
      <form
        className="admin-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          const r = await fetch("/api/admin/unlock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });
          const j = await r.json();
          if (r.ok) location.reload();
          else setError(j.error || "Access denied.");
        }}
      >
        <label>
          Access code
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            minLength={1}
            maxLength={256}
            autoComplete="current-password"
          />
        </label>
        <button>Unlock console ↗</button>
        {error && <p role="alert">{error}</p>}
      </form>
    </div>
  );
}
