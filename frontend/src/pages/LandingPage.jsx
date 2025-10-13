import { useState, useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import HeroSection from '../components/sections/HeroSection'
import TrustedSection from '../components/sections/TrustedSection'
import FeaturesSection from '../components/sections/FeaturesSection'
import DemoSection from '../components/sections/DemoSection'
import ExplainableSection from '../components/sections/ExplainableSection'
import IntegrationsSection from '../components/sections/IntegrationsSection'
import CTASection from '../components/sections/CTASection'

const LandingPage = () => {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.body.className = savedTheme
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.body.className = newTheme
    localStorage.setItem('theme', newTheme)
  }

  return (
    <div className="min-h-screen">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      
      <main>
        <HeroSection theme={theme} />
        <TrustedSection />
        <FeaturesSection />
        <DemoSection />
        <ExplainableSection />
        <IntegrationsSection />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  )
}

export default LandingPage