import { motion } from 'framer-motion'
import { Code, Database, Cloud, Cpu, FileText, Zap } from 'lucide-react'

const IntegrationsSection = () => {
  const integrations = [
    { name: 'React', icon: Code, color: 'from-blue-400 to-blue-600' },
    { name: 'Flask', icon: Database, color: 'from-green-400 to-green-600' },
    { name: 'Supabase', icon: Cloud, color: 'from-emerald-400 to-emerald-600' },
    { name: 'Python', icon: Cpu, color: 'from-yellow-400 to-yellow-600' },
    { name: 'CSV', icon: FileText, color: 'from-gray-400 to-gray-600' },
    { name: 'Hugging Face', icon: Zap, color: 'from-purple-400 to-purple-600' }
  ]

  return (
    <section id="integrations" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6">
            <span className="gradient-text">Integrates Seamlessly</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Connect with your existing workflow and data infrastructure in minutes, not months
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {integrations.map((integration, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="group relative"
            >
              <div className="glass rounded-3xl p-8 text-center hover-lift">
                <div className={`w-16 h-16 bg-gradient-to-r ${integration.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <integration.icon className="text-white" size={28} />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {integration.name}
                </h3>
                
                <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Floating connection lines */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="glass rounded-3xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Ready in Minutes, Not Months
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Our plug-and-play architecture adapts to your existing data pipeline. 
              No complex migrations or lengthy setup processes required.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">5min</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Setup Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">99.9%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              View Integration Guide
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default IntegrationsSection