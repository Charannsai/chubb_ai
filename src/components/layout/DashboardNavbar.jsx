import { useState, useEffect } from 'react'
import { Menu, X, Plus, MessageSquare, User, LogOut, Sun, Moon } from 'lucide-react'

const DashboardNavbar = ({ sidebarOpen, setSidebarOpen }) => {
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

  const handleLogout = () => {
    window.location.href = '/login'
  }

  const conversations = [
    { id: 1, title: 'Churn Analysis', date: '2h ago' },
    { id: 2, title: 'Risk Assessment', date: '1d ago' },
    { id: 3, title: 'Premium Optimization', date: '3d ago' }
  ]

  return (
    <>
      {!sidebarOpen && (
        <nav className="fixed top-0 w-full z-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:opacity-80 transition-all duration-200 hover:scale-110"
            >
              <Menu size={24} />
            </button>
          </div>
        </nav>
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 glass z-40 p-4 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-6">
          <img src="/chubbailogo.png" alt="Chubb AI" className="h-6" />
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:opacity-80 transition-all duration-200 hover:scale-110"
          >
            <X size={20} />
          </button>
        </div>

        <button className="btn-primary mb-4 flex items-center justify-center space-x-2 transform hover:scale-105 transition-transform duration-200 text-xs py-2">
          <Plus size={14} />
          <span>New Chat</span>
        </button>

        <div className="flex-1">
          <h3 className="text-xs font-medium opacity-70 mb-3 uppercase tracking-wide">Conversations</h3>
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div key={conv.id} className="p-2 rounded-lg glass hover:opacity-80 cursor-pointer transition-all duration-200 hover:scale-105 hover:-translate-y-1">
                <div className="flex items-start space-x-3">
                  <MessageSquare size={12} className="mt-1 opacity-60" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{conv.title}</p>
                    <p className="text-xs opacity-50">{conv.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-opacity-20 pt-4 mt-4">
          <div className="glass p-3 rounded-lg mb-3">
            <div className="flex items-center space-x-3 mb-3">
              <User size={16} className="opacity-60" />
              <div>
                <p className="text-xs font-medium">John Doe</p>
                <p className="text-xs opacity-50">john.doe@company.com</p>
              </div>
            </div>
            <p className="text-xs opacity-40">Premium • Dec 2024</p>
          </div>

          <div className="flex space-x-1">
            <button 
              onClick={toggleTheme}
              className="flex-1 p-2 rounded-lg glass hover:opacity-80 transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-1"
            >
              {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
              <span className="text-xs">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            
            <button 
              onClick={handleLogout}
              className="flex-1 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-1"
            >
              <LogOut size={12} />
              <span className="text-xs">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardNavbar