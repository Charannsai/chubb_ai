import { useState } from 'react'
import { Menu, X, Sun, Moon } from 'lucide-react'

const Navbar = ({ theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-opacity-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src="/chubbailogo.png" alt="Chubb AI" className="h-8" />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="opacity-70 hover:opacity-100 transition-opacity">Features</a>
            <a href="#demo" className="opacity-70 hover:opacity-100 transition-opacity">Demo</a>
            <a href="#contact" className="opacity-70 hover:opacity-100 transition-opacity">Contact</a>
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg glass hover:opacity-80 transition-opacity"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <a href="/login" className="btn-primary">
              Login
            </a>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden mt-6 pb-4 space-y-4 animate-fadeInUp">
            <a href="#features" className="block opacity-70 py-2">Features</a>
            <a href="#demo" className="block opacity-70 py-2">Demo</a>
            <a href="#contact" className="block opacity-70 py-2">Contact</a>
            <button 
              onClick={toggleTheme}
              className="flex items-center space-x-2 p-2 rounded-lg glass w-full justify-center"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
            </button>
            <a href="/login" className="btn-primary w-full mt-4 text-center">Login</a>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar