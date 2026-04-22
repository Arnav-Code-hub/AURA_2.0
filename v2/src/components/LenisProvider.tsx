"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const skipLenis = pathname === "/admin" || pathname?.startsWith("/admin/");
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (skipLenis) return;

    let lenis: import("lenis").default | null = null;

    const init = async () => {
      const Lenis = (await import("lenis")).default;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        smoothWheel: true,
      });

      function raf(time: number) {
        lenis?.raf(time);
        rafRef.current = requestAnimationFrame(raf);
      }
      rafRef.current = requestAnimationFrame(raf);
    };

    init();
    return () => {
      cancelAnimationFrame(rafRef.current);
      lenis?.destroy();
    };
  }, [skipLenis]);

  return <>{children}</>;
}
