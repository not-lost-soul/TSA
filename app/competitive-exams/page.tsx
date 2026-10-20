import type { Metadata } from "next";
import { getExamCourse } from "@/lib/content";
import Price from "@/components/Price";
import InquiryForm from "@/components/InquiryForm";
export const metadata: Metadata = {
  title: "One-day competitive exam preparation",
};
export default async function Exams() {
  const course = await getExamCourse();
  return (
    <div className="wrap">
      <section className="page-title">
        <span className="eyebrow">Competitive exam program / One day</span>
        <h1>
          Know the exam.
          <br />
          <em>Plan the path.</em>
        </h1>
        <p>
          A one-day learning program that introduces students to competitive
          exams, exam formats, preparation approaches, and how to choose a
          direction.
        </p>
      </section>
      <section className="section detail-list">
        <div className="detail-card">
          <span className="eyebrow">What it covers</span>
          <h2>Explore the landscape.</h2>
          <p>
            JEE · NEET · CET · CUET · UPSC and other competitive examinations.
          </p>
          <p>
            Learn what each exam is for, how its format differs, and what
            preparation typically involves.
          </p>
        </div>
        <div className="detail-card">
          <span className="eyebrow">Program details</span>
          <h2>{course?.title || "One-day competitive exam preparation"}</h2>
          <p>
            {course?.description ||
              "Course details are being finalized by the academy."}
          </p>
          <p>
            <strong>{course?.duration_label || "One day"}</strong>
          </p>
          <p>
            <strong>
              <Price amount={course?.fee ?? null} />
            </strong>
          </p>
          <p className="gst-note">Fees inclusive of GST</p>
          <p>No online payment or checkout. Enroll by inquiry.</p>
        </div>
      </section>
      <section className="section inquiry-grid">
        <div>
          <span className="eyebrow">Enrollment inquiry</span>
          <h2>
            Start with
            <br />a question.
          </h2>
          <p>Share your interest and the academy will follow up.</p>
        </div>
        <InquiryForm course="One-day competitive exam preparation" />
      </section>
    </div>
  );
}
