import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Soft page enter on route change. CSS handles the animation;
 * reduced-motion skips it via stylesheet.
 */
export function PageTransition({ children, className = "" }) {
  const location = useLocation();
  const [key, setKey] = useState(location.pathname);

  useEffect(() => {
    setKey(location.pathname);
  }, [location.pathname]);

  return (
    <div key={key} className={`gh-page-enter ${className}`}>
      {children}
    </div>
  );
}

/**
 * Scroll-linked reveal. Adds .gh-reveal--in when intersecting.
 */
export function Reveal({
  children,
  className = "",
  as: Tag = "div",
  delay = 0,
  ...rest
}) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`gh-reveal ${on ? "gh-reveal--in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Soft drift / parallax on scroll for decorative layers.
 * Uses data-speed (0–1). Disabled under reduced motion.
 */
export function useParallax() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = Array.from(document.querySelectorAll(".gh-parallax"));
    if (!nodes.length) return;

    let raf = 0;
    const update = () => {
      const vh = window.innerHeight;
      nodes.forEach((el) => {
        const speed = parseFloat(el.dataset.speed || "0.15");
        const rect = el.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const offset = (mid - vh / 2) * speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}

/** Mount once near app root to drive .gh-parallax elements. */
export function ParallaxDriver() {
  useParallax();
  return null;
}
