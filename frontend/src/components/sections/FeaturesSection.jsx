import { motion } from 'framer-motion'
import { MessageCircle, Search, BarChart3 } from 'lucide-react'

const FeaturesSection = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'Conversational Analytics',
      description: 'Chat with your insurance data — Chubb AI answers in plain English.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Search,
      title: 'Explainable Insights',
      description: 'Get clear reasons for every prediction using SHAP and LIME-based analysis.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Dynamic Dashboards',
      description: 'Visualize churn patterns by region, policy, and customer segment in real time.',
      gradient: 'from-green-500 to-blue-500'
    }
  ]

  return (
    <section id="features" className="py-20 px-6 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6">
            <span className="gradient-text">Intelligent Features</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Powered by cutting-edge AI to transform how insurance companies understand their customers
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              <div className="glass rounded-3xl p-8 h-full hover-lift">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-white" size={28} />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`}></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection