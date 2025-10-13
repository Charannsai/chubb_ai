import { motion } from 'framer-motion'
import { Shield, Eye, Target } from 'lucide-react'

const ExplainableSection = () => {
  const factors = [
    { name: 'High Premium', impact: 85, color: 'from-red-500 to-red-600' },
    { name: 'Payment Delays', impact: 72, color: 'from-orange-500 to-orange-600' },
    { name: 'Low Engagement', impact: 68, color: 'from-yellow-500 to-yellow-600' },
    { name: 'Service Issues', impact: 54, color: 'from-blue-500 to-blue-600' },
    { name: 'Competitor Offers', impact: 43, color: 'from-purple-500 to-purple-600' },
    { name: 'Policy Changes', impact: 31, color: 'from-green-500 to-green-600' }
  ]

  return (
    <section className="py-20 px-6 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6">
            <span className="gradient-text">Explainable AI You Can Trust</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto mb-12">
            Chubb AI doesn't just predict — it explains every insight. Understand key drivers behind churn and customer behavior in one glance.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Shield, title: 'SHAP Analysis', desc: 'Shapley values for feature importance' },
              { icon: Eye, title: 'LIME Explanations', desc: 'Local interpretable model explanations' },
              { icon: Target, title: 'Visual Insights', desc: 'Clear, actionable recommendations' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="glass rounded-2xl p-6 hover-lift"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <item.icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8"
        >
          <h3 className="text-2xl font-bold mb-8 text-center text-gray-900 dark:text-white">
            Top Churn Risk Factors
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {factors.map((factor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="glass rounded-2xl p-6 hover-lift cursor-pointer"
              >
                <div className={`w-full h-2 bg-gradient-to-r ${factor.color} rounded-full mb-4`}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${factor.impact}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-white/30 rounded-full"
                  ></motion.div>
                </div>
                
                <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  {factor.name}
                </h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {factor.impact}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Impact Score
                  </span>
                </div>

                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${factor.color} opacity-0 hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Each prediction comes with detailed explanations and confidence scores
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              Explore Explanations
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default ExplainableSection