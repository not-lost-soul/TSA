import Link from "next/link";
export default function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong>THE SOLUTION ACADEMY</strong>
        <p>Build understanding. Build confidence.</p>
      </div>
      <div className="footer-links">
        <Link href="/privacy">Privacy</Link>
        <Link href="/contact">Contact</Link>
      </div>
      <small>
        © {new Date().getFullYear()} The Solution Academy. All rights reserved.
      </small>
    </footer>
  );
}
