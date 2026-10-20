import type { Metadata } from "next";
export const metadata: Metadata = { title: "About" };
export default function About() {
  return (
    <div className="wrap">
      <section className="page-title">
        <span className="eyebrow">About the academy</span>
        <h1>
          Learn deeply.
          <br />
          <em>Grow steadily.</em>
        </h1>
        <p>
          The Solution Academy supports school learning and competitive-exam
          awareness with a focus on clear concepts, thoughtful practice, and
          confidence built over time.
        </p>
      </section>
      <section className="section">
        <div className="detail-card">
          <span className="eyebrow">Our approach</span>
          <h2>Clarity before complexity.</h2>
          <p>
            Learning should help students understand why an idea works—not only
            remember an answer. Program information and fees are published by
            the academy and may be updated over time.
          </p>
        </div>
      </section>
    </div>
  );
}
