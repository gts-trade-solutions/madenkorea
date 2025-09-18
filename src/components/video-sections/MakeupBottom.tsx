// components/SkinConsultPanel.tsx
import React, { useId, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const IconLeaf = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      d="M20 4c-5.5.5-9 2.7-11 6S6 18 4 20c4-1 8-3 10-6s3.5-5.5 6-10Z"
      fill="currentColor"
    />
  </svg>
);

const IconHeart = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      d="M12 21s-7-4.35-9.33-8A5.33 5.33 0 0 1 12 6.67 5.33 5.33 0 0 1 21.33 13C19 16.65 12 21 12 21Z"
      fill="currentColor"
    />
  </svg>
);

const IconPlus: React.FC<{ open?: boolean }> = ({ open }) => (
  <svg
    viewBox="0 0 24 24"
    className={`h-5 w-5 transition-transform ${open ? "rotate-45" : ""}`}
    aria-hidden="true"
  >
    <path d="M11 5h2v14h-2z" fill="currentColor" />
    <path d="M5 11h14v2H5z" fill="currentColor" />
  </svg>
);

const Row: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ icon, title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className="border-t border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-5"
        aria-expanded={open}
        aria-controls={contentId}
      >
        <span className="flex items-center gap-3 text-lg">
          <span className="text-gray-700">{icon}</span>
          <span className="font-medium">{title}</span>
        </span>
        <span className="text-gray-700">
          <IconPlus open={open} />
        </span>
      </button>

      <div
        id={contentId}
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden pb-5">{children}</div>
      </div>
    </div>
  );
};

type Payload = {
  name: string;
  email: string;
  skinType: string;
  concern: string;
  routine?: string;
  comments?: string;
  // optional extra fields you might store
  source?: string;
};

export default function MakeupColsult() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot for bots
    const hp = (data.get("_hp") as string) || "";
    if (hp.trim()) {
      // silently drop
      return;
    }

    const payload: Payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      skinType: String(data.get("skinType") || ""),
      concern: String(data.get("concern") || ""),
      routine: String(data.get("routine") || "").trim() || undefined,
      comments: String(data.get("comments") || "").trim() || undefined,
      source: "skin_consult_panel",
    };

    // Basic front-end guard (native required also helps)
    if (!payload.name || !payload.email || !payload.skinType || !payload.concern) {
      toast({
        title: "Missing info",
        description: "Please fill in the required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create table if you haven't already:
      // Table: skin_consults
      // Columns: id (uuid, pk, default uuid_generate_v4()), created_at (timestamptz, default now()),
      // name (text), email (text), skin_type (text), concern (text), routine (text), comments (text), source (text), status (text default 'new')
      const { error } = await supabase.from("skin_consults").insert({
        name: payload.name,
        email: payload.email,
        skin_type: payload.skinType,
        concern: payload.concern,
        routine: payload.routine,
        comments: payload.comments,
        source: payload.source,
        status: "new",
      });

      if (error) {
        console.error(error);
        toast({
          title: "Couldn’t submit",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setSubmitted(true);
      form.reset();
      toast({
        title: "Thanks! ✨",
        description: "We’ve received your details. Our team will reach out soon.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* LEFT PANEL */}
        <div className="bg-rose-50 rounded-2xl p-6 md:p-10">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-wide">
           Authentic Korean Makeup 
          </h2>

          {/* Rows */}
          <div className="mt-6">
            <Row icon={<IconLeaf />} title="DISCOVER OUR INGREDIENTS">
              <div className="flex flex-wrap gap-2" aria-label="Popular ingredients">
                {["Ginseng", "Green Tea", "Rice Bran", "Niacinamide", "Propolis"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white px-3 py-1 text-sm text-gray-700 shadow-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Row>

            <Row icon={<IconHeart />} title="CONSULT ABOUT YOUR SKIN" defaultOpen>
              {submitted ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                  <p className="font-medium">Your request has been submitted.</p>
                  <p className="text-sm opacity-90">
                    We’ll review your details and get back to you shortly. 💌
                  </p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={onSubmit} noValidate>
                  {/* Honeypot (hidden) */}
                  <input
                    type="text"
                    name="_hp"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="text-sm text-gray-600">
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        autoComplete="name"
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm text-gray-600">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="skinType" className="text-sm text-gray-600">
                        Skin Type
                      </label>
                      <select
                        id="skinType"
                        name="skinType"
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                        defaultValue=""
                        required
                        disabled={submitting}
                      >
                        <option value="" disabled>
                          Select…
                        </option>
                        <option>Normal</option>
                        <option>Dry</option>
                        <option>Oily</option>
                        <option>Combination</option>
                        <option>Sensitive</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="concern" className="text-sm text-gray-600">
                        Primary Concern
                      </label>
                      <select
                        id="concern"
                        name="concern"
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                        defaultValue=""
                        required
                        disabled={submitting}
                      >
                        <option value="" disabled>
                          Select…
                        </option>
                        <option>Acne &amp; Blemishes</option>
                        <option>Dark Spots</option>
                        <option>Redness / Sensitivity</option>
                        <option>Fine Lines &amp; Wrinkles</option>
                        <option>Dryness</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="routine" className="text-sm text-gray-600">
                      Routine / Products you currently use (optional)
                    </label>
                    <input
                      id="routine"
                      name="routine"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                      placeholder="Cleanser, toner, serum…"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="comments" className="text-sm text-gray-600">
                      Comments
                    </label>
                    <textarea
                      id="comments"
                      name="comments"
                      rows={4}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                      placeholder="Tell us more about your skin goals…"
                      disabled={submitting}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-gray-500">
                      By submitting, you agree to be contacted about your skin consultation.
                    </p>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="rounded-full"
                    >
                      {submitting ? "Submitting…" : "Submit"}
                    </Button>
                  </div>
                </form>
              )}
            </Row>
          </div>

          {/* Editorial cards */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <article>
                <h3 className="mt-3 font-medium">
                  Korean Authentic Skincare: Tinted Mineral Sunscreen Launch
                </h3>
                <a href="#" className="mt-1 inline-block text-sm underline">
                  READ MORE
                </a>
              </article>
              <article>
                <h3 className="mt-3 font-medium">The Simplest Guide to Double Cleansing</h3>
                <a href="#" className="mt-1 inline-block text-sm underline">
                  READ MORE
                </a>
              </article>
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="rounded-2xl overflow-hidden">
          <img
            src="/images/banner-2.jpeg"
            alt="Models with radiant skin"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
