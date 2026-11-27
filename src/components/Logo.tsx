import { useId } from "react";

// Tilted orbit (ellipse rx 29, ry 10, rotated -30° around the centre) as a path, so the satellite can travel along it.
const ORBIT = "M57.1 17.5 A29 10 -30 1 1 6.9 46.5 A29 10 -30 1 1 57.1 17.5";

/**
 * OMNIA "Orbit" mark: a thick gradient O with a glowing core, and a satellite on a tilted orbit — always watching.
 * Vector, so it stays sharp at any size. `animated` draws it in and sets the satellite moving (page transition).
 */
export function LogoMark({ className = "h-9 w-9", animated = false }: { className?: string; animated?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 64" className={`${className} ${animated ? "logo-draw" : ""}`} role="img" aria-label="OMNIA">
      <defs>
        <linearGradient id={`g${id}`} x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset=".5" stopColor="#6366f1" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id={`c${id}`} cx="32" cy="32" r="7" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ecfeff" />
          <stop offset=".45" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* orbit sits behind the ring, so the thick O hides its far side */}
      <path d={ORBIT} fill="none" stroke="#22d3ee" strokeOpacity=".75" strokeWidth="1.8" pathLength={100} className="logo-orbit" />
      <circle cx="32" cy="32" r="18.5" fill="none" stroke={`url(#g${id})`} strokeWidth="7.5" pathLength={100} transform="rotate(-90 32 32)" className="logo-o" />
      <circle cx="32" cy="32" r="7" fill={`url(#c${id})`} className="logo-core" />
      <circle cx="32" cy="32" r="3.2" fill="#ecfeff" className="logo-core" />
      {animated ? (
        <circle r="3.4" fill="#ecfeff" className="logo-sat">
          <animateMotion dur="1.6s" repeatCount="indefinite" path={ORBIT} />
        </circle>
      ) : (
        <circle cx="57.1" cy="17.5" r="3.4" fill="#ecfeff" />
      )}
    </svg>
  );
}

/** Mark + wordmark lockup. */
export const Logo = ({ className = "", markClass = "h-9 w-9", textClass = "text-lg" }: { className?: string; markClass?: string; textClass?: string }) => (
  <span className={`flex items-center gap-2.5 ${className}`}>
    <LogoMark className={markClass} />
    <span className={`font-display font-bold tracking-tight ${textClass}`}>OMNIA</span>
  </span>
);
