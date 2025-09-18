// components/SkinConsultPanel.tsx
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

export default function SkinConsultPanel() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* LEFT PANEL */}
        <div className="bg-rose-50 rounded-2xl p-6 md:p-10">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-wide">
            Korean Skincare Products
          </h2>

          {/* Rows */}
          <div className="mt-6">
            <Row icon={<IconLeaf />} title="DISCOVER OUR INGREDIENTS">
              <div className="flex flex-wrap gap-2">
                {[
                  "Ginseng",
                  "Green Tea",
                  "Rice Bran",
                  "Niacinamide",
                  "Propolis",
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

            <Row icon={<IconHeart />} title="CONSULT ABOUT YOUR SKIN">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(
                    e.currentTarget as HTMLFormElement
                  );
                  // TODO: send to your API/Supabase
                  // eslint-disable-next-line no-console
                  console.log(Object.fromEntries(data.entries()));
                  alert("Thanks! We’ll get back to you shortly.");
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <input
                      name="name"
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
                      <option>Oily</option>
                      <option>Combination</option>
                      <option>Sensitive</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Primary Concern
                    </label>
                    <select
                      name="concern"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                      defaultValue=""
                      required
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
                  <label className="text-sm text-gray-600">
                    Routine / Products you currently use (optional)
                  </label>
                  <input
                    name="routine"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                    placeholder="Cleanser, toner, serum…"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Comments</label>
                  <textarea
                    name="comments"
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                    placeholder="Tell us more about your skin goals…"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full border border-gray-900 px-6 py-3 text-sm font-medium hover:bg-gray-900 hover:text-white transition"
                >
                  Submit
                </button>
              </form>
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
                <h3 className="mt-3 font-medium">
                  The Simplest Guide to Double Cleansing
                </h3>
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
            src="/images/banner-1.jpeg"
            alt="Models with radiant skin"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
