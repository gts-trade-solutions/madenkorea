// src/pages/WholesaleProcessPage.tsx
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import React from "react";

/* ===================== Inline Illustrations (rich, no external requests) ===================== */
/* Palette */
const indigo = "#6366f1";
const indigoDark = "#4f46e5";
const slate100 = "#f1f5f9";
const slate200 = "#e2e8f0";
const slate300 = "#cbd5e1";
const slate700 = "#334155";
const yellow = "#f59e0b";
const yellowSoft = "#fde68a";
const teal = "#06b6d4";
const green = "#22c55e";
const rose = "#f43f5e";

/* 1) Place Order — person + cart + phone */
const PlaceArt = () => (
  <svg viewBox="0 0 320 220" className="w-[260px] h-auto" role="img" aria-label="Place order illustration">
    <defs>
      <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#eef2ff" />
        <stop offset="1" stopColor={slate100} />
      </linearGradient>
    </defs>
    <rect width="320" height="220" rx="16" fill="url(#bg1)" />

    {/* phone */}
    <rect x="32" y="30" width="72" height="140" rx="12" fill="#fff" stroke={slate300} />
    <rect x="44" y="46" width="48" height="14" rx="7" fill={slate200} />
    <rect x="44" y="66" width="48" height="14" rx="7" fill={slate200} />
    <rect x="44" y="86" width="48" height="38" rx="10" fill={indigo} />
    <rect x="59" y="100" width="18" height="8" rx="4" fill="#fff" />
    <rect x="44" y="130" width="48" height="22" rx="6" fill={slate200} />

    {/* person */}
    <circle cx="205" cy="88" r="16" fill={rose} />
    <rect x="182" y="100" width="46" height="54" rx="10" fill={slate700} />
    <rect x="190" y="110" width="30" height="10" rx="5" fill="#fff" opacity=".2" />
    {/* arm waving */}
    <path d="M210 104c8-16 20-22 28-10" stroke={rose} strokeWidth="4" fill="none" strokeLinecap="round" />
    {/* legs */}
    <rect x="188" y="152" width="10" height="34" rx="3" fill={slate700} />
    <rect x="208" y="152" width="10" height="34" rx="3" fill={slate700} />
    <rect x="184" y="184" width="18" height="6" rx="3" fill={slate300} />
    <rect x="204" y="184" width="18" height="6" rx="3" fill={slate300} />

    {/* cart */}
    <rect x="228" y="124" width="64" height="34" rx="6" fill="#fff" stroke={slate300} />
    <line x1="232" y1="124" x2="288" y2="158" stroke={slate300} />
    <line x1="288" y1="124" x2="232" y2="158" stroke={slate300} />
    <circle cx="238" cy="164" r="6" fill={slate300} />
    <circle cx="282" cy="164" r="6" fill={slate300} />

    {/* sparkles */}
    <circle cx="120" cy="34" r="3" fill={indigo} />
    <circle cx="108" cy="44" r="2" fill={teal} />
    <circle cx="122" cy="54" r="2" fill={yellow} />
  </svg>
);

/* 2) Confirm — phone UI + big check */
const ConfirmArt = () => (
  <svg viewBox="0 0 320 220" className="w-[260px] h-auto" role="img" aria-label="Confirm illustration">
    <rect width="320" height="220" rx="16" fill={slate100} />
    {/* phone card */}
    <rect x="64" y="30" width="192" height="136" rx="16" fill="#fff" stroke={slate300} />
    <rect x="84" y="54" width="152" height="12" rx="6" fill={slate200} />
    <rect x="84" y="74" width="128" height="10" rx="5" fill={slate200} />
    <rect x="84" y="92" width="116" height="10" rx="5" fill={slate200} />
    <rect x="84" y="110" width="92" height="10" rx="5" fill={slate200} />
    {/* CTA */}
    <rect x="104" y="136" width="112" height="30" rx="8" fill={indigo} />
    <path d="M118 150 l8 8 l18-18" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
    {/* floating big check */}
    <circle cx="250" cy="160" r="32" fill={indigo} opacity=".1" />
    <circle cx="250" cy="160" r="20" fill={green} />
    <path d="M242 160 l6 6 l12 -12" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

/* 3) Payment — invoice + QR + card + coins */
const PaymentArt = () => (
  <svg viewBox="0 0 320 220" className="w-[260px] h-auto" role="img" aria-label="Payment illustration">
    <rect width="320" height="220" rx="16" fill="#fbfdff" />
    {/* invoice */}
    <rect x="44" y="36" width="164" height="136" rx="14" fill="#fff" stroke={slate300} />
    <rect x="60" y="54" width="98" height="10" rx="5" fill={slate200} />
    <rect x="60" y="72" width="120" height="8" rx="4" fill={slate200} />
    <rect x="60" y="88" width="120" height="8" rx="4" fill={slate200} />
    {/* QR */}
    <rect x="144" y="106" width="46" height="46" rx="6" fill={slate200} />
    <rect x="150" y="112" width="10" height="10" fill={slate700} />
    <rect x="166" y="112" width="8" height="8" fill={slate700} />
    <rect x="150" y="128" width="8" height="8" fill={slate700} />
    <rect x="164" y="132" width="12" height="12" fill={slate700} />

    {/* card */}
    <rect x="190" y="90" width="86" height="54" rx="10" fill={indigoDark} />
    <rect x="198" y="98" width="30" height="6" rx="3" fill="#fff" opacity=".7" />
    <rect x="198" y="114" width="58" height="8" rx="4" fill="#fff" opacity=".2" />

    {/* coins */}
    <circle cx="214" cy="164" r="14" fill={yellow} />
    <circle cx="236" cy="174" r="10" fill={yellowSoft} />
    <text x="210" y="168" fontSize="10" fontWeight="700" fill="#7c2d12">$</text>
  </svg>
);

/* 4) Shipping — stacked boxes + clipboard + shield */
const ShippingArt = () => (
  <svg viewBox="0 0 320 220" className="w-[260px] h-auto" role="img" aria-label="Shipping illustration">
    <rect width="320" height="220" rx="16" fill={slate100} />
    {/* boxes */}
    <rect x="42" y="126" width="72" height="54" rx="8" fill={yellowSoft} stroke={yellow} />
    <rect x="120" y="106" width="72" height="74" rx="8" fill={yellowSoft} stroke={yellow} />
    <rect x="198" y="126" width="72" height="54" rx="8" fill={yellowSoft} stroke={yellow} />
    {/* box labels */}
    <rect x="60" y="148" width="28" height="6" rx="3" fill={yellow} opacity=".5" />
    <rect x="138" y="128" width="28" height="6" rx="3" fill={yellow} opacity=".5" />
    <rect x="216" y="148" width="28" height="6" rx="3" fill={yellow} opacity=".5" />
    {/* clipboard */}
    <rect x="132" y="36" width="56" height="40" rx="8" fill={indigo} />
    <rect x="146" y="46" width="28" height="20" rx="4" fill="#fff" />
    <path d="M152 56 l6 6 l10-10" stroke={green} strokeWidth="3" fill="none" strokeLinecap="round" />
    {/* shield */}
    <path d="M262 36 l22 8 v18c0 18-10 30-22 36c-12-6-22-18-22-36V44z" fill="#10b981" opacity=".2" />
    <path d="M262 44 l14 6 v12c0 12-7 20-14 24c-7-4-14-12-14-24V50z" fill="#10b981" />
    <path d="M254 59 l6 6 l10-10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

/* ===================== Data ===================== */
type Step = {
  id: number;
  title: string;
  desc: string;
  art: React.ReactNode;
};

const STEPS: Step[] = [
  {
    id: 1,
    title: "Place Order",
    desc:
      "Explore our product selection and add items to your cart to complete your order.",
    art: <PlaceArt />,
  },
  {
    id: 2,
    title: "Confirm",
    desc:
      "Your personal sales consultant will be in touch to confirm and refine your order.",
    art: <ConfirmArt />,
  },
  {
    id: 3,
    title: "Payment",
    desc:
      "Complete the payment after receiving the Proforma Invoice (PI).",
    art: <PaymentArt />,
  },
  {
    id: 4,
    title: "Packing & Shipping",
    desc:
      "We carefully pack your order and arrange delivery to your address.",
    art: <ShippingArt />,
  },
];

/* ===================== Card ===================== */
const Card: React.FC<{ step: Step }> = ({ step }) => (
  <div
    className="
      group relative flex flex-col items-center text-center
      rounded-[28px] border border-slate-200 bg-white/90 backdrop-blur
      shadow-[0_10px_30px_rgba(2,6,23,0.06)] hover:shadow-[0_16px_40px_rgba(2,6,23,0.10)]
      transition-all duration-300 ease-out p-8 sm:p-10
    "
  >
    {/* step badge */}
    <div
      className="
        absolute -top-4 left-1/2 -translate-x-1/2
        h-10 w-10 rounded-full
        bg-indigo-600 text-white text-base font-bold grid place-items-center
        shadow-lg
      "
      aria-hidden
    >
      {step.id}
    </div>

    <h3 className="mt-4 text-2xl font-semibold text-slate-900">{step.title}</h3>
    <p className="mt-4 text-slate-600 leading-relaxed max-w-[38ch]">
      {step.desc}
    </p>

    <div className="mt-8 drop-shadow-sm group-hover:scale-[1.02] transition-transform duration-300">
      {step.art}
    </div>
  </div>
);

/* ===================== Page ===================== */
const WholesaleProcessPage: React.FC = () => {
  return (
    <>
    <Header />
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="container mx-auto px-4 pt-10 sm:pt-14">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Wholesale Processing
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
            A quick overview of how your bulk orders move from cart to door—clear,
            simple, and fast.
          </p>
        </div>

        <div className="mt-10 sm:mt-14 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
          {STEPS.map((s) => (
            <Card key={s.id} step={s} />
          ))}
        </div>

        <div className="mt-10 sm:mt-14 flex justify-center">
          <a
            href="/"
            className="
              inline-flex items-center gap-2 rounded-xl
              bg-indigo-600 text-white px-6 py-3 font-semibold
              shadow-[0_10px_24px_rgba(79,70,229,0.25)]
              hover:bg-indigo-700 transition
            "
          >
            Start Your Order
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
              <path d="M13.172 12 8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
            </svg>
          </a>
        </div>

        <div className="h-16" />
      </section>
    </main>
    <Footer />
    </>
  );
};

export default WholesaleProcessPage;
