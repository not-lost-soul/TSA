import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getClasses } from "@/lib/content";
import Price from "@/components/Price";
import InquiryForm from "@/components/InquiryForm";
type Props = { params: Promise<{ class: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { class: slug } = await params;
  return { title: slug.replace("class-", "Class ").replace("-", " ") };
}
export default async function ClassPage({ params }: Props) {
  const { class: slug } = await params;
  const grade = Number(slug.replace("class-", ""));
  if (
    !Number.isInteger(grade) ||
    grade < 6 ||
    grade > 10 ||
    !slug.startsWith("class-")
  )
    notFound();
  const c = (await getClasses()).find((x) => x.grade === grade);
  return (
    <div className="wrap">
      <section className="page-title">
        <span className="eyebrow">Academic programs / Class {grade}</span>
        <h1>
          {c?.title || `Class ${grade}`}
          <br />
          <em>{c ? "Build your base." : "Coming soon."}</em>
        </h1>
        <p>
          {c?.description ||
            "Program details and subject offerings for this class have not been published yet. Contact the academy for information."}
        </p>
        <Link className="pill-link" href="/contact">
          Ask about Class {grade} ↗
        </Link>
      </section>
      <section className="section">
        <span className="eyebrow">Subjects & fees</span>
        <h2>What you’ll study.</h2>
        {!c ? (
          <div className="empty-state">
            No class information has been published yet.
          </div>
        ) : (
          <div className="detail-card">
            <h3>
              {c.pricing_model === "bundled"
                ? "All-subject bundle"
                : "Per-subject fees"}
            </h3>
            {c.pricing_model === "bundled" ? (
              <p>
                <strong>
                  <Price amount={c.bundled_fee} />
                </strong>
              </p>
            ) : null}
            {c.subjects?.length ? (
              <ul className="subject-list">
                {c.subjects.map((s) => (
                  <li key={s.id}>
                    <span>
                      <strong>{s.name}</strong>
                      {s.description && (
                        <>
                          <br />
                          <small>{s.description}</small>
                        </>
                      )}
                    </span>
                    {c.pricing_model === "per_subject" && (
                      <strong>
                        <Price amount={s.fee} />
                      </strong>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                Subjects have not been added yet.
              </div>
            )}
            <p className="gst-note">All displayed fees are inclusive of GST.</p>
          </div>
        )}
      </section>
      <section className="section inquiry-grid">
        <div>
          <span className="eyebrow">Admissions inquiry</span>
          <h2>
            Let’s talk
            <br />
            about learning.
          </h2>
          <p>Submit an inquiry; no payment is collected online.</p>
        </div>
        <InquiryForm course={`Class ${grade}`} />
      </section>
    </div>
  );
}
