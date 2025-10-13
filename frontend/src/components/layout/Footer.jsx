import { motion } from 'framer-motion'
import { Github, Linkedin, Twitter } from 'lucide-react'

const Footer = () => {
  const links = {
    company: ['About', 'Team', 'Careers', 'Contact'],
    product: ['Features', 'Pricing', 'Documentation', 'API'],
    resources: ['Blog', 'Help Center', 'Community', 'Status'],
    legal: ['Privacy', 'Terms', 'Security', 'Compliance']
  }

  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <h3 className="text-2xl font-bold gradient-text mb-4">
                Chubb AI
              </h3>
              <p className="text-gray-400 leading-relaxed max-w-sm">
                Transparent Intelligence for Insurance. 
                Predict customer churn with explainable AI that speaks your business language.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex gap-4"
            >
              {[
                { icon: Github, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Twitter, href: '#' }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <h4 className="font-semibold mb-4 text-gray-300 capitalize">
                {category}
              </h4>
              <ul className="space-y-3">
                {items.map((item, index) => (
                  <li key={index}>
                    <motion.a
                      href="#"
                      whileHover={{ x: 4 }}
                      className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                    >
                      {item}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-400 text-sm">
            © 2025 Chubb AI. All Rights Reserved.
          </p>
          
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span>Made with ❤️ for Insurance Innovation</span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer