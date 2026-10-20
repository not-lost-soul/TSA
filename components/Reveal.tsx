"use client";
import { useEffect, useRef } from "react";

// Content is visible by default (works without JS). The animation only hides it
// right before it animates in, so a script failure can never leave the page blank.
export default function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    let cancelled = false;
    let observer: IntersectionObserver | undefined;
    let animation: { pause?: () => void } | undefined;

    import("animejs")
      .then(({ animate }) => {
        if (cancelled) return;
        el.style.opacity = "0";
        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              animation = animate(el, {
                opacity: [0, 1],
                translateY: [24, 0],
                duration: 650,
                ease: "out(3)",
              });
              observer?.disconnect();
            }
          },
          { threshold: 0.12 },
        );
        observer.observe(el);
      })
      .catch(() => {
        el.style.opacity = "1";
      });

    return () => {
      cancelled = true;
      observer?.disconnect();
      animation?.pause?.();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
