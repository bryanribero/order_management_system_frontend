import { motion } from 'framer-motion'

export default function PageTransition({ children, direction = 'right' }) {
  const initialX = direction === 'right' ? 100 : -100
  const exitX = direction === 'right' ? -100 : 100
  return (
    <motion.main
      initial={{
        opacity: 0,
        x: initialX,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
        x: exitX,
      }}
      transition={{
        duration: 0.4,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.main>
  )
}
