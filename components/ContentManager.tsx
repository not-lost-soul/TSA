"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
type Row = Record<string, any>;
export default function ContentManager({
  classes,
  subjects,
  exam,
}: {
  classes: Row[];
  subjects: Row[];
  exam: Row | null;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  async function send(body: Row) {
    setNotice("Saving…");
    try {
      const r = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (r.ok) {
        setNotice("Saved.");
        router.refresh();
      } else setNotice(j.error || "Save failed.");
    } catch {
      setNotice("Save failed. Check the connection and try again.");
    }
  }
  return (
    <div className="console-panel">
      <h2>Classes & subjects</h2>
      <p>
        Class data starts empty. Add a class first, then add subjects with its
        class ID. Fees are numeric INR values inclusive of GST.
      </p>
      {classes.map((c) => (
        <details
          key={c.id}
          style={{ padding: "12px 0", borderBottom: "1px solid #ddd" }}
        >
          <summary>
            <strong>Class {c.grade}</strong> — {c.title || "Untitled"} (
            {c.pricing_model})
          </summary>
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              send({
                kind: "class",
                id: c.id,
                title: f.get("title"),
                description: f.get("description"),
                pricing_model: f.get("pricing_model"),
                bundled_fee:
                  f.get("bundled_fee") === ""
                    ? null
                    : Number(f.get("bundled_fee")),
              });
            }}
          >
            <input
              name="title"
              defaultValue={c.title}
              placeholder="Class title"
              required
            />
            <textarea
              name="description"
              defaultValue={c.description}
              placeholder="Description"
            />
            <div className="inline-fields">
              <select name="pricing_model" defaultValue={c.pricing_model}>
                <option value="bundled">Bundled fee</option>
                <option value="per_subject">Per-subject fees</option>
              </select>
              <input
                name="bundled_fee"
                type="number"
                min="0"
                step="0.01"
                defaultValue={c.bundled_fee ?? ""}
                placeholder="Bundle fee (₹)"
              />
            </div>
            <button>Save class</button>
          </form>
          <h4>Subjects</h4>
          {subjects
            .filter((s) => s.class_id === c.id)
            .map((s) => (
              <form
                key={s.id}
                className="admin-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  send({
                    kind: "subject",
                    id: s.id,
                    name: f.get("name"),
                    description: f.get("description"),
                    fee: f.get("fee") === "" ? null : Number(f.get("fee")),
                    sort_order: Number(f.get("sort_order")),
                  });
                }}
              >
                <div className="inline-fields">
                  <input name="name" defaultValue={s.name} required />
                  <input
                    name="fee"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={s.fee ?? ""}
                    placeholder="Fee (₹)"
                  />
                </div>
                <input
                  name="description"
                  defaultValue={s.description}
                  placeholder="Description"
                />
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={s.sort_order}
                />
                <button>Save subject</button>
              </form>
            ))}
        </details>
      ))}
      <h3>Add a class (Classes 6–10)</h3>
      <form
        className="admin-form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          send({
            kind: "new_class",
            grade: Number(f.get("grade")),
            title: f.get("title"),
            description: f.get("description"),
            pricing_model: f.get("pricing_model"),
            bundled_fee:
              f.get("bundled_fee") === "" ? null : Number(f.get("bundled_fee")),
          });
        }}
      >
        <div className="inline-fields">
          <select name="grade">
            {[6, 7, 8, 9, 10]
              .filter((g) => !classes.some((c) => c.grade === g))
              .map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
          </select>
          <select name="pricing_model">
            <option value="bundled">Bundled</option>
            <option value="per_subject">Per-subject</option>
          </select>
        </div>
        <input name="title" placeholder="Program title" required />
        <textarea name="description" placeholder="Description" />
        <input
          name="bundled_fee"
          type="number"
          min="0"
          step="0.01"
          placeholder="Bundled fee (₹, optional)"
        />
        <button>Add class</button>
      </form>
      <h3>Add subject</h3>
      <form
        className="admin-form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          send({
            kind: "new_subject",
            class_id: f.get("class_id"),
            name: f.get("name"),
            description: f.get("description"),
            fee: f.get("fee") === "" ? null : Number(f.get("fee")),
            sort_order: Number(f.get("sort_order") || 0),
          });
        }}
      >
        <select name="class_id" required>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              Class {c.grade} · {c.title}
            </option>
          ))}
        </select>
        <input name="name" required placeholder="Subject name" />
        <textarea name="description" placeholder="Subject description" />
        <input
          name="fee"
          type="number"
          min="0"
          step="0.01"
          placeholder="Subject fee (₹)"
        />
        <input name="sort_order" type="number" defaultValue="0" />
        <button>Add subject</button>
      </form>
      <h2>One-day competitive exam program</h2>
      {exam && (
        <form
          className="admin-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            send({
              kind: "exam",
              id: exam.id,
              title: f.get("title"),
              description: f.get("description"),
              fee: f.get("fee") === "" ? null : Number(f.get("fee")),
              duration_label: f.get("duration_label"),
              exams: String(f.get("exams"))
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              cta_label: f.get("cta_label"),
            });
          }}
        >
          <input name="title" defaultValue={exam.title} required />
          <textarea name="description" defaultValue={exam.description} />
          <div className="inline-fields">
            <input
              name="fee"
              type="number"
              min="0"
              step="0.01"
              defaultValue={exam.fee ?? ""}
              placeholder="Fee (₹)"
            />
            <input name="duration_label" defaultValue={exam.duration_label} />
          </div>
          <input name="exams" defaultValue={(exam.exams ?? []).join(", ")} />
          <input name="cta_label" defaultValue={exam.cta_label} />
          <button>Save exam program</button>
        </form>
      )}
      <p role="status">{notice}</p>
    </div>
  );
}
