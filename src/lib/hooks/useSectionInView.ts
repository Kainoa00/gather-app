import { useRef } from 'react'
import { useInView } from 'framer-motion'

/**
 * Combines useRef + useInView with CareBridge standard options.
 * @param margin  IntersectionObserver root margin (default '-80px')
 */
export function useSectionInView(margin: `${number}px` | `${number}px ${number}px` = '-80px') {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin })
  return { ref, inView }
}
