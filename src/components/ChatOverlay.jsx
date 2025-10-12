import { useState } from 'react'
import { Send, Sparkles, Loader2 } from 'lucide-react'

const ChatOverlay = ({ theme, showAnalysis }) => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const API_BASE_URL = 'http://localhost:5000/api'

  const handleSend = async () => {
    if (message.trim() && !isLoading) {
      const userMessage = message.trim()
      setMessages([...messages, { text: userMessage, sender: 'user' }])
      setMessage('')
      setIsExpanded(true)
      setIsLoading(true)
      
      try {
        // Call the chat API
        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userMessage }),
        })
        
        const data = await response.json()
        
        if (data.success && data.response) {
          setMessages(prev => [...prev, { 
            text: data.response, 
            sender: 'ai' 
          }])
        } else {
          setMessages(prev => [...prev, { 
            text: 'Sorry, I encountered an error processing your request. Please try again.', 
            sender: 'ai' 
          }])
        }
      } catch (error) {
        console.error('Chat error:', error)
        setMessages(prev => [...prev, { 
          text: 'Sorry, I couldn\'t connect to the chat service. Please check your connection and try again.', 
          sender: 'ai' 
        }])
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (!showAnalysis) return null

  return (
    <div className="mt-8 mb-6 animate-fadeInUp">
      <div className="max-w-4xl mx-auto px-6">
        {/* Messages Container - Only show when expanded and has messages */}
        {isExpanded && messages.length > 0 && (
          <div className="mb-4 glass rounded-2xl p-4 max-h-96 overflow-y-auto space-y-3 animate-fadeInUp">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl max-w-md ${
                  msg.sender === 'user'
                    ? `ml-auto ${theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'}`
                    : `mr-auto ${theme === 'light' ? 'bg-gray-200 text-black' : 'bg-gray-700 text-white'}`
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className={`p-3 rounded-xl max-w-md mr-auto ${theme === 'light' ? 'bg-gray-200 text-black' : 'bg-gray-700 text-white'}`}>
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">Analyzing...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Input - Always visible when showAnalysis is true */}
        <div className="glass rounded-2xl p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              theme === 'light' ? 'bg-black' : 'bg-white'
            }`}>
              <Sparkles className={`h-5 w-5 ${theme === 'light' ? 'text-white' : 'text-black'}`} />
            </div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your churn analysis..."
              className={`flex-1 px-4 py-3 rounded-xl border-none outline-none text-sm ${
                theme === 'light' 
                  ? 'bg-gray-100 text-black placeholder-gray-500' 
                  : 'bg-gray-800 text-white placeholder-gray-400'
              }`}
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className={`p-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatOverlay