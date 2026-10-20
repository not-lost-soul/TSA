import type { Metadata } from "next";
import SignInButton from "@/components/SignInButton";
import { createClient } from "@/lib/supabase/server";
export const metadata: Metadata = {
  title: "Student sign in",
  robots: { index: false, follow: false },
};
export default async function SignIn() {
  const db = await createClient();
  const { data } = db ? await db.auth.getUser() : { data: { user: null } };
  return (
    <div className="wrap">
      <section className="page-title">
        <span className="eyebrow">Student access</span>
        <h1>
          Make space
          <br />
          for questions.
        </h1>
        <p>
          Sign in with Google to use the study helpbox. Helpbox conversations
          are stored for educational support and may be reviewed by authorized
          academy staff. See our{" "}
          <a href="/privacy">
            <u>privacy notice</u>
          </a>
          .
        </p>
      </section>
      <div className="auth-panel">
        {data.user ? (
          <>
            <h2>You’re signed in.</h2>
            <p>{data.user.email}</p>
            <form action="/auth/signout" method="post">
              <button>Sign out</button>
            </form>
          </>
        ) : (
          <>
            <h2>Continue with Google</h2>
            <p>Only Google sign-in is enabled for students.</p>
            <SignInButton />
          </>
        )}
      </div>
    </div>
  );
}
