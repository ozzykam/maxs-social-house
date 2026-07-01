"use client";
import { useState } from "react";
import Link from "next/link";
import { submitPrivateEventInquiry } from "@/lib/actions";

const EVENT_TYPES = [
  "Birthday",
  "Anniversary",
  "Corporate Event",
  "Wedding Reception",
  "Holiday Party",
  "Other",
];

const inputClass =
  "w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-xl text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition-colors";

const labelClass = "block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2";

export default function PrivateEventInquirePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await submitPrivateEventInquiry({ name, email, phone, eventType, eventDate, guestCount, message });
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
          Thank you, {name}. We&apos;ve received your inquiry and will be in touch within 1–2 business days.
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
        <Link href="/private-events" className="text-sm text-neutral-500 hover:text-white transition-colors">
          ← Private Events
        </Link>
        <p className="text-amber-400 text-xs tracking-[0.25em] uppercase mt-6 mb-3">Host Your Event</p>
        <h1 className="font-serif text-4xl font-bold text-white">Private Event Inquiry</h1>
        <p className="text-neutral-500 mt-3 text-sm leading-relaxed">
          Fill out the form below and our events team will follow up within 1–2 business days.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-neutral-900 border border-white/5 rounded-2xl p-8 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
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
              placeholder="jane@example.com"
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
            <label className={labelClass}>Event Type *</label>
            <select
              required
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className={`${inputClass} appearance-none`}
            >
              <option value="">Select type…</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Preferred Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Estimated Guest Count</label>
            <input
              type="number"
              min="1"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              placeholder="e.g. 75"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Tell us about your vision *</label>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Share any details about your event — theme, special requests, catering preferences, etc."
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
