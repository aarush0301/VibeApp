import { PartyPopper, Mountain, Coffee, Utensils, Volleyball, BookOpen, Compass } from 'lucide-react'

const icons = { Party: PartyPopper, Trip: Mountain, Outing: Coffee, 'Food Run': Utensils, Sports: Volleyball, 'Study Sesh': BookOpen }
export default function ActivityIcon({ type, size = 15 }) {
  const Icon = icons[type] || Compass
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />
}
