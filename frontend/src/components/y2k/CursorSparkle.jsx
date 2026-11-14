import { useEffect, useState } from "react";
import Sparkle from "./Sparkle.jsx";

/** Creative addition: sparkle that follows the pointer (desktop). */
export default function CursorSparkle() {
  const [pos, setPos] = useState({ x: -40, y: -40, on: false });

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduce || !fine) return undefined;

    const move = (e) => setPos({ x: e.clientX, y: e.clientY, on: true });
    const leave = () => setPos((p) => ({ ...p, on: false }));
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
    };
  }, []);

  if (!pos.on) return null;

  return (
    <div
      className="y2k-cursor-sparkle"
      style={{ left: pos.x, top: pos.y }}
      aria-hidden="true"
    >
      <Sparkle size={18} />
    </div>
  );
}
