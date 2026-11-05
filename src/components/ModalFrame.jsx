import { useEffect, useRef } from 'react'

export default function ModalFrame({ children, title, onClose, compact = false, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    return () => { document.body.style.overflow = overflow; previous?.focus() }
  }, [])

  const onKeyDown = event => {
    if (event.key === 'Escape') { event.stopPropagation(); onClose(); return }
    if (event.key !== 'Tab') return
    const items = [...ref.current.querySelectorAll('button, input, select, textarea, a[href], [tabindex="0"]')].filter(el => !el.disabled && el.getClientRects().length)
    const first = items[0], last = items.at(-1)
    if (!first) { event.preventDefault(); return }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === ref.current)) { event.preventDefault(); first.focus() }
  }

  return <div className={`modal-backdrop backdrop-fade ${compact ? 'modal-compact' : ''}`} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <section ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} onKeyDown={onKeyDown} className={`modal-sheet slide-up ${className}`}>{children}</section>
  </div>
}
