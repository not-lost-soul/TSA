"use client";
import { useState } from "react";
export default function InquiryForm({ course }: { course: string }) {
  const [state, setState] = useState("idle");
  return (
    <form
      className="inquiry-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("sending");
        const f = new FormData(e.currentTarget);
        try {
          const r = await fetch("/api/inquiries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: f.get("name"),
              phone: f.get("phone"),
              email: f.get("email"),
              message: f.get("message"),
              course,
            }),
          });
          setState(r.ok ? "sent" : "error");
        } catch {
          setState("error");
        }
      }}
    >
      <label>
        Your name
        <input required name="name" maxLength={100} />
      </label>
      <label>
        Phone number
        <input required name="phone" inputMode="tel" maxLength={20} />
      </label>
      <label>
        Email (optional)
        <input name="email" type="email" maxLength={200} />
      </label>
      <label>
        What would you like to know?
        <textarea name="message" rows={3} maxLength={1500} />
      </label>
      <button disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send inquiry ↗"}
      </button>
      {state === "sent" && (
        <p role="status">Thanks — your inquiry has been received.</p>
      )}
      {state === "error" && (
        <p role="alert">
          Could not send inquiry. Please try again or contact the academy
          directly.
        </p>
      )}
      <small>No payment is collected on this website.</small>
    </form>
  );
}
