export const T = {
  bg:      "#0E0B1A",
  card:    "#181330",
  raised:  "#221B3D",
  muted:   "#221B3D",
  chip:    "#352C5C",
  text:    "#F5F3FF",
  textSec: "#C4BEE0",
  textMut: "#8A84A8",
  border:  "rgba(255,255,255,0.07)",

  orange:  "#FF6B4A",
  purple:  "#8B7CFF",
  green:   "#34D399",
  yellow:  "#FBBF24",

  gradient:  "linear-gradient(135deg, #FF6B4A 0%, #FF8E53 100%)",
  gradientPurple: "linear-gradient(135deg, #8B7CFF 0%, #B06AB3 100%)",
  cardGradient: "linear-gradient(160deg, #1E1839 0%, #151029 100%)",
  shadow:  "0 8px 24px rgba(0,0,0,0.35)",
  glow:    "0 6px 20px rgba(255,107,74,0.4)",
}

export const TYPE_CONFIG = {
  Party:        { bg: "rgba(255,107,74,0.14)",  color: "#FF8A70", border: "rgba(255,107,74,0.28)",  dot: "#FF6B4A" },
  Trip:         { bg: "rgba(52,211,153,0.14)",  color: "#5EE0B0", border: "rgba(52,211,153,0.28)",  dot: "#34D399" },
  Outing:       { bg: "rgba(139,124,255,0.16)", color: "#B4A9FF", border: "rgba(139,124,255,0.3)",  dot: "#8B7CFF" },
  "Food Run":   { bg: "rgba(251,191,36,0.14)",  color: "#FBBF24", border: "rgba(251,191,36,0.28)",  dot: "#FBBF24" },
  Sports:       { bg: "rgba(56,189,248,0.14)",  color: "#7DD3FC", border: "rgba(56,189,248,0.28)",  dot: "#38BDF8" },
  "Study Sesh": { bg: "rgba(244,114,182,0.14)", color: "#F9A8D4", border: "rgba(244,114,182,0.28)", dot: "#F472B6" },
  Other:        { bg: "rgba(196,190,224,0.10)", color: "#C4BEE0", border: "rgba(196,190,224,0.2)",  dot: "#8A84A8" },
}

export const AVATAR_COLORS = ["#8B7CFF", "#FF6B4A", "#34D399", "#FBBF24", "#F472B6", "#38BDF8"]

export function getAvatarColor(str) {
  if (!str) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" })
  } catch { return dateStr }
}