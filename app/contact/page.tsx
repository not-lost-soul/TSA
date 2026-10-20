import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";
export const metadata: Metadata = { title: "Contact and inquiries" };
export default function Contact() {
  return (
    <div className="wrap">
      <section className="page-title">
        <span className="eyebrow">Contact / Admissions</span>
        <h1>
          Tell us what
          <br />
          you’re looking for.
        </h1>
        <p>
          Ask about Classes 6–10, subjects and fees, or the one-day
          competitive-exam program. This form is an inquiry only and does not
          collect payment.
        </p>
      </section>
      <section className="section inquiry-grid">
        <div>
          <span className="eyebrow">Inquiry form</span>
          <h2>
            We’ll take it
            <br />
            from here.
          </h2>
        </div>
        <InquiryForm course="General academy inquiry" />
      </section>
    </div>
  );
}
