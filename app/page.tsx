import Link from "next/link";
import Reveal from "@/components/Reveal";
import { getClasses, getExamCourse } from "@/lib/content";
import Price from "@/components/Price";
export default async function Home() {
  const classes = await getClasses();
  const exam = await getExamCourse();
  return (
    <div className="wrap">
      <section className="hero">
        <span className="eyebrow">The Solution Academy · Nagpur</span>
        <h1>
          Learn with
          <br />
          <em>clarity.</em>
          <br />
          Move with
          <br />
          confidence.
        </h1>
        <div className="hero-bottom">
          <p>
            Strong fundamentals. Curious minds. A clear path from classroom
            learning to competitive-exam awareness.
          </p>
          <Link className="pill-link" href="/programs">
            Explore programs ↗
          </Link>
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">01 / Academic programs</span>
            <h2>
              Built around
              <br />
              understanding.
            </h2>
          </div>
          <p>
            Structured learning for Classes 6 through 10. Class and fee details
            are updated by the academy.
          </p>
        </div>
        {classes.length ? (
          <div className="cards">
            {classes.map((c) => (
              <Reveal key={c.id}>
                <Link
                  className="program-card"
                  href={`/programs/class-${c.grade}`}
                >
                  <div>
                    <span className="eyebrow">
                      Class {c.grade.toString().padStart(2, "0")}
                    </span>
                    <h3>{c.title || `Class ${c.grade}`}</h3>
                    <p>
                      {c.description ||
                        "Program details will be announced soon."}
                    </p>
                  </div>
                  <div className="card-bottom">
                    <span>
                      {c.pricing_model === "bundled" ? (
                        <Price amount={c.bundled_fee} />
                      ) : (
                        "Per-subject fees"
                      )}
                    </span>
                    <span>↗</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            Class programs are being prepared. Please check back soon or contact
            the academy for current details.
          </div>
        )}
      </section>
      <section className="feature-band">
        <span className="eyebrow">02 / Competitive exam awareness</span>
        <h2>Understand the exam landscape in one day.</h2>
        <p>
          A focused one-day preparation program introduces students to
          competitive exams, their formats, pathways, and preparation approach.
        </p>
        <Link className="pill-link" href="/competitive-exams">
          Explore the program ↗
        </Link>
      </section>
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">03 / Start a conversation</span>
            <h2>
              Your next step
              <br />
              starts here.
            </h2>
          </div>
          <p>
            Ask about class programs, subjects, or the competitive-exam
            preparation course.
          </p>
        </div>
        <Link className="pill-link" href="/contact">
          Make an inquiry ↗
        </Link>
      </section>
    </div>
  );
}
