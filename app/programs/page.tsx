import type { Metadata } from "next";
import Link from "next/link";
import { getClasses } from "@/lib/content";
import Price from "@/components/Price";
export const metadata: Metadata = { title: "Programs" };
export default async function Programs() {
  const classes = await getClasses();
  return (
    <div className="wrap">
      <section className="page-title">
        <span className="eyebrow">Academic programs / 06–10</span>
        <h1>
          Find your
          <br />
          next level.
        </h1>
        <p>
          Explore the academic programs currently published by The Solution
          Academy. Details and fees are maintained by the academy.
        </p>
      </section>
      <section className="section">
        {classes.length ? (
          <div className="cards">
            {classes.map((c) => (
              <Link
                key={c.id}
                className="program-card"
                href={`/programs/class-${c.grade}`}
              >
                <div>
                  <span className="eyebrow">Class {c.grade}</span>
                  <h3>{c.title || `Class ${c.grade}`}</h3>
                  <p>{c.description || "Details coming soon."}</p>
                </div>
                <div className="card-bottom">
                  <span>
                    {c.pricing_model === "bundled" ? (
                      <Price amount={c.bundled_fee} />
                    ) : (
                      "Per-subject pricing"
                    )}
                  </span>
                  <span>↗</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            No class programs have been published yet. Please return later or{" "}
            <Link href="/contact">
              <u>contact the academy</u>
            </Link>
            .
          </div>
        )}
      </section>
    </div>
  );
}
