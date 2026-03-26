/**
 * Shared Framer Motion primitives for CareBridge landing sections.
 * Import from here rather than redefining locally in each component.
 */
import type { Variants } from 'framer-motion'

/** CareBridge standard spring easing — use for enter/exit transitions */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Stagger container — hides itself, staggers children on entry.
 * @param staggerChildren  seconds between each child animation
 * @param delayChildren    seconds before first child starts
 */
export function makeContainerVariants(
  staggerChildren: number,
  delayChildren = 0
): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren, delayChildren } },
  }
}

/**
 * Fade-up child variant — accepts a custom delay via `custom` prop.
 * Usage: <motion.div variants={fadeUpVariants} custom={0.2} />
 */
export function makeFadeUpVariants(y = 24, duration = 0.5): Variants {
  return {
    hidden: { opacity: 0, y },
    visible: (delay: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration, ease: EASE, delay },
    }),
  }
}

/** Simple fade-up without custom delay */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}
