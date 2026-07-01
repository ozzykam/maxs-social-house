"use client";
import { useState } from "react";
import Link from "next/link";
import { submitTalentInquiry } from "@/lib/actions";

const inputClass =
  "w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-xl text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition-colors";

const labelClass = "block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2";

export default function TalentInquirePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [actName, setActName] = useState("");
  const [genre, setGenre] = useState("");
  const [availability, setAvailability] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await submitTalentInquiry({ name, email, phone, actName, genre, availability, message });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or contact us directly.");
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="text-4xl mb-6">✓</div>
        <h2 className="font-serif text-3xl font-bold text-white mb-4">Inquiry Received</h2>
        <p className="text-neutral-400 leading-relaxed mb-8">
          Thank you, {name}. We&apos;ve received your booking inquiry and will be in touch soon.
        </p>
        <Link
          href="/"
          className="inline-block text-sm text-amber-400 hover:text-amber-300 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <Link href="/talent" className="text-sm text-neutral-500 hover:text-white transition-colors">
          ← Perform at Max&apos;s
        </Link>
        <p className="text-amber-400 text-xs tracking-[0.25em] uppercase mt-6 mb-3">Join Our Lineup</p>
        <h1 className="font-serif text-4xl font-bold text-white">Booking Inquiry</h1>
        <p className="text-neutral-500 mt-3 text-sm leading-relaxed">
          Tell us about your act and we&apos;ll be in touch if there&apos;s a match for our upcoming calendar.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-neutral-900 border border-white/5 rounded-2xl p-8 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Your Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 000-0000"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Act / Artist Name *</label>
            <input
              required
              value={actName}
              onChange={(e) => setActName(e.target.value)}
              placeholder="The Blue Note Quartet"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Genre / Style</label>
          <input
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="e.g. Jazz, R&B, Electronic, Soul…"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Typical Availability</label>
          <textarea
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            rows={3}
            placeholder="e.g. Available Friday & Saturday evenings, most weekends in summer…"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className={labelClass}>Tell us about your act *</label>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Share links to your music, videos, press kit, or anything that helps us get a feel for your performance style."
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-amber-400 text-neutral-950 text-sm font-semibold rounded-xl hover:bg-amber-300 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Sending…" : "Submit Inquiry"}
        </button>
      </form>
    </div>
  );
}
