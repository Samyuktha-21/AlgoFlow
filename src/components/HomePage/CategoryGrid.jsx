import { motion } from 'framer-motion'
import CategoryCard from './CategoryCard'
import categories from '../../data/categories.json'

export default function CategoryGrid() {
  return (
    <section className="relative py-20"
      style={{ background: 'linear-gradient(180deg, #0A0E27 0%, #0d1130 50%, #0A0E27 100%)' }}>
      {/* Section header */}
      <div className="max-w-[1400px] mx-auto px-6 mb-12 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-sm font-semibold tracking-widest uppercase mb-3"
          style={{ color: '#64748b' }}
        >
          Browse by Category
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="gradient-text font-black text-4xl md:text-5xl mb-4"
          style={{ backgroundSize: '200% 200%' }}
        >
          Explore Algorithm Categories
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-base max-w-xl mx-auto"
          style={{ color: '#64748b' }}
        >
          Each category has a unique visual theme — water, stars, forest, circuits and more.
          Click to explore algorithms with immersive visualizations.
        </motion.p>
      </div>

      {/* Cards grid */}
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(0deg, #060810, transparent)' }} />
    </section>
  )
}
