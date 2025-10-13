import { motion } from 'framer-motion'

const TrustedSection = () => {
  const logos = [
    'Allianz', 'AXA', 'OpenAI', 'Databricks', 'Hugging Face', 'Microsoft'
  ]

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-8">
            Trusted by Innovators in Insurance and AI
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full animate-glow"></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center"
        >
          {logos.map((logo, index) => (
            <motion.div
              key={logo}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.1 }}
              className="glass rounded-2xl p-6 hover-lift cursor-pointer"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm mx-auto mb-3">
                {logo.slice(0, 2)}
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">{logo}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default TrustedSection