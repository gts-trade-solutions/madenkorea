// src/ScrollToTop.tsx
import { useEffect, PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop({ children }: PropsWithChildren) {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    // Stop the browser from restoring old scroll positions
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // If navigating to a hash (#section), jump to that element
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
    }

    // Otherwise, always start at the top
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, key]); // also handles back/forward

  return <>{children}</>;
}
