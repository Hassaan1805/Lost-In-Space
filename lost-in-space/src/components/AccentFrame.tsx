import React, { type HTMLAttributes } from "react";
import "../styles/accent-frame.css";

// ---- Types -------------------------------------------------

export type AFColor = "cyan" | "pink" | "green" | (string & {});

export type AFHoverEffect =
  | "expand"
  | "glow"
  | "pulse"
  | "flicker"
  | "trace"
  | "none";

export type AFGlowIntensity = "low" | "medium" | "high";
export type AFBgVariant = "none" | "subtle" | "solid";
export type AFCornerStyle = "square" | "rounded";

// ---- Maps --------------------------------------------------

const COLOR_PRESETS: Record<string, string> = {
  cyan: "#00ffcc", // Adapted to Lost In Space primary cyan
  pink: "#ff00ff",
  green: "#39ff14",
};

// ---- Props -------------------------------------------------

export interface AccentFrameProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  color?: AFColor;
  colorB?: AFColor;
  cornerLength?: number;
  cornerThickness?: number;
  hoverLength?: number;
  transitionDuration?: number;
  cornerStyle?: AFCornerStyle;
  mode?: "duo" | "quad";
  hoverEffect?: AFHoverEffect;
  glowIntensity?: AFGlowIntensity;
  animated?: boolean;
  bgVariant?: AFBgVariant;
}

// ---- Component ---------------------------------------------

export const AccentFrame: React.FC<AccentFrameProps> = ({
  children,
  className = "",
  color = "cyan",
  colorB,
  cornerLength = 16,
  cornerThickness = 2,
  hoverLength = 32,
  transitionDuration = 300,
  cornerStyle = "square",
  mode = "duo",
  hoverEffect = "expand",
  glowIntensity = "medium",
  animated = false,
  bgVariant = "none",
  style,
  ...props
}) => {
  const resolvedA = COLOR_PRESETS[color] ?? color;
  const resolvedB = colorB ? (COLOR_PRESETS[colorB] ?? colorB) : resolvedA;

  const wrapperClasses = [
    "af-wrapper",
    hoverEffect !== "expand" && hoverEffect !== "none" ? `af-hover-${hoverEffect}` : "",
    `af-glow-${glowIntensity}`,
    animated ? "af-animated" : "",
    bgVariant === "subtle" ? "af-bg-subtle" : "",
    bgVariant === "solid" ? "af-bg-solid" : "",
    className,
  ].filter(Boolean).join(" ");

  const shouldExpand = hoverEffect === "expand";
  const off = `-${cornerThickness / 2}px`;

  const cornerBase = "af-corner";
  const cornerClass = cornerStyle === "rounded" ? "af-corner-rounded" : "";

  // Horizontal bracket piece (controls width axis)
  const H = (posClass: string, isB = false) =>
    [
      cornerBase,
      isB ? "af-corner-b af-bg-b" : "af-bg-a",
      posClass,
      "af-h-thickness af-w-length",
      shouldExpand ? "af-hover-w-expand" : "",
      cornerClass,
    ].filter(Boolean).join(" ");

  // Vertical bracket piece (controls height axis)
  const V = (posClass: string, isB = false) =>
    [
      cornerBase,
      isB ? "af-corner-b af-bg-b" : "af-bg-a",
      posClass,
      "af-w-thickness af-h-length",
      shouldExpand ? "af-hover-h-expand" : "",
      cornerClass,
    ].filter(Boolean).join(" ");

  return (
    <div
      className={wrapperClasses}
      style={{
        "--af-color-a": resolvedA,
        "--af-color-b": resolvedB,
        "--af-corner-length": `${cornerLength}px`,
        "--af-hover-length": `${hoverLength}px`,
        "--af-thickness": `${cornerThickness}px`,
        "--af-duration": `${transitionDuration}ms`,
        ...style,
      } as React.CSSProperties}
      {...props}
    >
      {/* Top-left — primary color */}
      <div className={H("af-top-0 af-left-0")} style={{ marginTop: off, marginLeft: off }} />
      <div className={V("af-top-0 af-left-0")} style={{ marginTop: off, marginLeft: off }} />

      {/* Bottom-right — secondary color */}
      <div className={H("af-bottom-0 af-right-0", true)} style={{ marginBottom: off, marginRight: off }} />
      <div className={V("af-bottom-0 af-right-0", true)} style={{ marginBottom: off, marginRight: off }} />

      {mode === "quad" && (
        <>
          {/* Top-right — secondary color */}
          <div className={H("af-top-0 af-right-0", true)} style={{ marginTop: off, marginRight: off }} />
          <div className={V("af-top-0 af-right-0", true)} style={{ marginTop: off, marginRight: off }} />

          {/* Bottom-left — primary color */}
          <div className={H("af-bottom-0 af-left-0")} style={{ marginBottom: off, marginLeft: off }} />
          <div className={V("af-bottom-0 af-left-0")} style={{ marginBottom: off, marginLeft: off }} />
        </>
      )}

      <div className="af-content">{children}</div>
    </div>
  );
};

export default AccentFrame;
