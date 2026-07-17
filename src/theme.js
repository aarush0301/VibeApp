export const T = {
  bg:      "#0B1133",
  card:    "#1E264A",
  muted:   "#2A3260",
  chip:    "#4C547D",
  text:    "#FFFFFF",
  textSec: "#B2BAE2",
  textMut: "#8F94B0",
  border:  "#2A3260",
  orange:  "#D85A30",
  purple:  "#7F77DD",
  green:   "#1D9E75",
  yellow:  "#EF9F27",
}

export const TYPE_CONFIG = {
  Party:        { bg: "#2D1810", color: "#FF8060", border: "#4A2A1A", dot: "#D85A30" },
  Trip:         { bg: "#0D2820", color: "#50D4A0", border: "#1A4535", dot: "#1D9E75" },
  Outing:       { bg: "#1A1840", color: "#A09EFF", border: "#2E2A60", dot: "#7F77DD" },
  "Food Run":   { bg: "#2A2008", color: "#FFD060", border: "#4A3800", dot: "#EF9F27" },
  Sports:       { bg: "#0D2810", color: "#70E870", border: "#1A4520", dot: "#52B535" },
  "Study Sesh": { bg: "#0D1828", color: "#70C0FF", border: "#1A3050", dot: "#378ADD" },
  Other:        { bg: "#1A1C2A", color: "#9898B8", border: "#2A2C40", dot: "#9E9B96" },
}

export const AVATAR_COLORS = [
  "#7F77DD", "#D85A30", "#1D9E75", "#EF9F27", "#D4537E", "#378ADD"
]

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