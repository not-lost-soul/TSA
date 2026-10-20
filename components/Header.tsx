import Link from "next/link";
export default function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="The Solution Academy home">
        <span className="brand-mark">S</span>
        <span>
          THE SOLUTION
          <br />
          ACADEMY
        </span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/programs">Programs</Link>
        <Link href="/competitive-exams">Competitive exams</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link className="nav-cta" href="/sign-in">
          Student sign in ↗
        </Link>
      </nav>
    </header>
  );
}
