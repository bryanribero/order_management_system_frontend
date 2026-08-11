import { motion } from 'framer-motion'

export default function ComponentTransition({ children, direction = 'right' }) {
  const initialX = direction === 'right' ? 20 : -20
  const exitX = direction === 'right' ? -20 : 20
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
        duration: 0.15,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.main>
  )
}
