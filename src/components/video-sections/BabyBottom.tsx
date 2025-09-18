// components/BabyCareConsultPanel.tsx
import React, { useState } from "react";

const IconLeaf = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <path
      d="M20 4c-5.5.5-9 2.7-11 6S6 18 4 20c4-1 8-3 10-6s3.5-5.5 6-10Z"
      fill="currentColor"
    />
  </svg>
);

const IconHeart = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
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
  >
    <path d="M11 5h2v14h-2z" fill="currentColor" />
    <path d="M5 11h14v2H5z" fill="currentColor" />
  </svg>
);

const Row: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-5"
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
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden pb-5">{children}</div>
      </div>
    </div>
  );
};

export default function BabyCareConsultPanel() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* LEFT PANEL */}
        <div className="bg-blue-50 rounded-2xl p-6 md:p-10">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-wide">
            Gentle Baby Care Essentials
          </h2>
          <p className="mt-2 text-gray-600 max-w-prose">
            Safe, dermatologist‑tested formulas designed for delicate skin—from bath time
            to diaper changes. Tell us about your little one and we’ll guide you to a
            simple, soothing routine.
          </p>

          {/* Rows */}
          <div className="mt-6">
            <Row icon={<IconLeaf />} title="DISCOVER GENTLE INGREDIENTS">
              <div className="flex flex-wrap gap-2">
                {[
                  "Colloidal Oatmeal",
                  "Calendula",
                  "Aloe Vera",
                  "Shea Butter",
                  "Ceramides",
                  "Zinc Oxide (non‑nano)",
                ].map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white px-3 py-1 text-sm text-gray-700 shadow-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Row>

            <Row icon={<IconHeart />} title="CONSULT ABOUT YOUR BABY’S SKIN">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget as HTMLFormElement);
                  // TODO: send to your API/Supabase
                  console.log(Object.fromEntries(data.entries()));
                  alert("Thanks! Your baby‑care request has been received.");
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Parent / Guardian Name</label>
                    <input
                      name="parentName"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <input
                      name="email"
                      type="email"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Baby’s Age</label>
                    <select
                      name="babyAge"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      <option>0–3 months</option>
                      <option>3–6 months</option>
                      <option>6–12 months</option>
                      <option>1–2 years</option>
                      <option>2+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Skin Type</label>
                    <select
                      name="skinType"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      <option>Normal</option>
                      <option>Dry</option>
                      <option>Sensitive</option>
                      <option>Eczema‑prone</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Primary Concern</label>
                    <select
                      name="concern"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      <option>Diaper Rash</option>
                      <option>Dry Patches</option>
                      <option>Eczema Flare‑ups</option>
                      <option>Cradle Cap</option>
                      <option>Sun Protection</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Known Allergies (optional)</label>
                    <input
                      name="allergies"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                      placeholder="e.g., fragrance, nuts, dairy"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">
                    Products you currently use
                    <span className="text-gray-400"> (optional)</span>
                  </label>
                  <input
                    name="routine"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                    placeholder="Baby wash, lotion, diaper cream…"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Comments</label>
                  <textarea
                    name="comments"
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                    placeholder="Share triggers, pediatrician guidance, or specific goals…"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full border border-gray-900 px-6 py-3 text-sm font-medium hover:bg-gray-900 hover:text-white transition"
                >
                  Get Recommendations
                </button>

                <p className="text-xs text-gray-500 mt-2">
                  *For informational purposes only. If symptoms persist or worsen, please
                  consult your pediatrician.
                </p>
              </form>
            </Row>
          </div>

          {/* Editorial cards */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <article>
                <h3 className="mt-3 font-medium">
                  Mineral Sunscreen for Babies: What to Know
                </h3>
                <a href="#" className="mt-1 inline-block text-sm underline">
                  READ MORE
                </a>
              </article>
              <article>
                <h3 className="mt-3 font-medium">Gentle Bath Time Routine (No Tears)</h3>
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
            src="/images/banner-3.jpg"
            alt="Parent cuddling a smiling baby"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}