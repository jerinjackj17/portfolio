import { useState } from "react";
import { profile } from "../data";

/* "send a message": posts via the FormSubmit AJAX endpoint, no page reload.
   NOTE FOR THE OWNER: FormSubmit sends a one-time activation email to
   jerinjack28@gmail.com the first time this form is used. Messages will
   NOT deliver until that email is confirmed. */

type State = "idle" | "sending" | "sent" | "error";

const inputCls =
  "w-full border border-rule bg-paper px-3 py-2.5 text-[15px] text-ink placeholder:text-faint focus:border-ink focus:outline-none";

export default function MessageForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<State>("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("https://formsubmit.co/ajax/jerinjack28@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          _honey: "",
          _subject: "portfolio message",
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success === "true") {
        setState("sent");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="mt-8 border border-ink/70 p-6">
        <p className="font-display text-2xl font-medium text-ink">
          Message sent.
        </p>
        <p className="mt-2 text-[15px] text-ink/85">
          Jerin will reply. Usually within a day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 border-t border-ink/70 pt-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
        send a message
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
            your name
          </span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
            your email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={inputCls}
          />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
          message
        </span>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className={`${inputCls} resize-y`}
        />
      </label>
      {/* honeypot: humans never see it, bots fill it */}
      <input
        type="text"
        name="_honey"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-0 w-0 overflow-hidden opacity-0"
        onChange={() => {}}
      />
      {state === "error" && (
        <p className="mt-4 font-mono text-xs text-flame-deep">
          Something broke.{" "}
          <a href={`mailto:${profile.email}`} className="u-link">
            Email him directly →
          </a>
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-5 border border-ink bg-ink px-6 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-paper transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {state === "sending" ? "sending…" : "send →"}
      </button>
    </form>
  );
}
