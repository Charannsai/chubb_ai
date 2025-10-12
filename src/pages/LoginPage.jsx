import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [theme, setTheme] = useState('dark')
  const navigate = useNavigate()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.body.className = savedTheme
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    if (email === 'admin@chubbai.com' && password === 'password') {
      navigate('/dashboard')
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full glass p-8 rounded-3xl">
        <div className="text-center mb-8">
          <img src="/chubbailogo.png" alt="Chubb AI" className="h-12 mx-auto mb-4" />
          <p className="opacity-70">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium opacity-80 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl glass border ${theme === 'light' ? 'border-black/20' : 'border-white/20'} focus:outline-none focus:ring-2 ${theme === 'light' ? 'focus:ring-black/30' : 'focus:ring-white/30'}`}
              placeholder="admin@chubbai.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium opacity-80 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl glass border ${theme === 'light' ? 'border-black/20' : 'border-white/20'} focus:outline-none focus:ring-2 ${theme === 'light' ? 'focus:ring-black/30' : 'focus:ring-white/30'}`}
              placeholder="password"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button type="submit" className="btn-primary w-full">
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-sm opacity-60">
          Demo credentials: admin@chubbai.com / password
        </div>
      </div>
    </div>
  )
}

export default LoginPage