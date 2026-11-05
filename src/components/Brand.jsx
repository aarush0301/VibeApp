import { Radio } from 'lucide-react'

export default function Brand() {
  return <div className="brand" aria-label="Vibe App"><span className="brand-mark"><Radio size={23} strokeWidth={2} aria-hidden="true" /></span>vibe<span style={{ color: 'var(--accent)', marginLeft: -9 }}>.</span></div>
}
