export const T = {
  bg:      "#FFF9F4",
  card:    "#FFFFFF",
  raised:  "#F6EDE6",
  muted:   "#F7F1EC",
  chip:    "#DCCDC3",
  text:    "#322B29",
  textSec: "#685C56",
  textMut: "#786A62",
  border:  "#E9DDD4",

  orange:  "#B94732",
  purple:  "#70528E",
  green:   "#26734E",
  yellow:  "#865E0D",
  accent:  "#F4A18B",
  peach:   "#FBE0D5",
  blue:    "#315F80",
  blueSoft:"#DDECF6",
  lavender:"#EEE4F5",
  success: "#E3F1E7",
  danger:  "#B6363D",
  dangerBg:"#FCE8E6",
  onAccent:"#FFFFFF",

  gradient:  "#B94732",
  gradientPurple: "#315F80",
  cardGradient: "#FFFFFF",
  shadow:  "0 12px 36px rgba(73,45,31,0.08)",
  glow:    "none",
}

export const TYPE_CONFIG = {
  Party:        { bg: "#FBE0D5", color: "#9E3F2C", border: "#F0BEAE", dot: "#B94732" },
  Trip:         { bg: "#E3F1E7", color: "#286742", border: "#BFDDC7", dot: "#26734E" },
  Outing:       { bg: "#EEE4F5", color: "#70528E", border: "#D9C5E7", dot: "#70528E" },
  "Food Run":   { bg: "#FAEDCB", color: "#805A0E", border: "#E8D59F", dot: "#865E0D" },
  Sports:       { bg: "#DDECF6", color: "#315F80", border: "#BED8EB", dot: "#315F80" },
  "Study Sesh": { bg: "#F9E3EA", color: "#934363", border: "#E8BED0", dot: "#934363" },
  Other:        { bg: "#F1EAE4", color: "#685C56", border: "#DCCDC3", dot: "#685C56" },
}

export const AVATAR_COLORS = ["#70528E", "#AE513C", "#377552", "#826013", "#984B6A", "#386B8F"]

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
