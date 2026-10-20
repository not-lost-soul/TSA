"use client";
import { useEffect } from "react";
export default function LockPage() {
  useEffect(() => {
    fetch("/api/admin/lock", { method: "POST" }).then(() =>
      location.replace("/private-console"),
    );
  }, []);
  return (
    <div className="wrap">
      <p>Locking console…</p>
    </div>
  );
}
