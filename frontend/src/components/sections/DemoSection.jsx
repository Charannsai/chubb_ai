import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Upload, TrendingUp, PieChart, BarChart } from 'lucide-react'

const DemoSection = () => {
  const [activeChart, setActiveChart] = useState(0)
  
  const chartData = [
    { name: 'Churn Rate by Region', value: 75, color: 'from-red-500 to-orange-500' },
    { name: 'Risk Factors', value: 85, color: 'from-blue-500 to-purple-500' },
    { name: 'Customer Segments', value: 92, color: 'from-green-500 to-blue-500' }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveChart((prev) => (prev + 1) % chartData.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="demo" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6">
            <span className="gradient-text">See Chubb AI in Action</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Watch how our AI transforms raw insurance data into actionable insights
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="glass rounded-3xl p-8 hover-lift">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 ml-4">
                  Live Analytics Chat
                </span>
              </div>

              <div className="space-y-4 h-80 overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-start"
                >
                  <div className="glass rounded-2xl p-4 max-w-xs">
                    <p className="text-gray-700 dark:text-gray-300">
                      Why are customers in the North region leaving?
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-end"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 max-w-xs text-white">
                    <p>75% churn due to increased premiums and reduced renewal engagement. Key factors include 23% premium increase and 40% drop in customer service interactions.</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="flex justify-start"
                >
                  <div className="glass rounded-2xl p-4 max-w-xs">
                    <p className="text-gray-700 dark:text-gray-300">
                      Show me the top risk factors for customer segment A
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 }}
                  className="flex justify-end"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 max-w-xs text-white">
                    <p>Top 3 risk factors: High premium (0.85), Payment delays (0.72), Low engagement (0.68). Segment A shows 34% higher churn probability.</p>
                  </div>
                </motion.div>
              </div>

              {/* Upload Demo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className="mt-6 p-4 border-2 border-dashed border-blue-300 rounded-xl text-center"
              >
                <Upload className="mx-auto mb-2 text-blue-600" size={24} />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drop CSV file here for instant analysis
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Interactive Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="glass rounded-3xl p-8 hover-lift">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Real-time Dashboard
                </h3>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass rounded-xl p-4 text-center">
                  <TrendingUp className="mx-auto mb-2 text-red-500" size={24} />
                  <div className="text-2xl font-bold text-red-500">23%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</div>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <BarChart className="mx-auto mb-2 text-green-500" size={24} />
                  <div className="text-2xl font-bold text-green-500">94%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                </div>
              </div>

              {/* Animated Charts */}
              <div className="space-y-4">
                {chartData.map((chart, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: activeChart === index ? 1 : 0.3 }}
                    className="glass rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {chart.name}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {chart.value}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: activeChart === index ? `${chart.value}%` : '0%' }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-3 bg-gradient-to-r ${chart.color} rounded-full`}
                      ></motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Floating Chart Icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white animate-glow"
            >
              <PieChart size={20} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default DemoSection