import { useState, useEffect, useRef } from 'react'
import { Send, Sparkles, Loader2, Mic, MicOff } from 'lucide-react'

const ChatOverlay = ({ theme, showAnalysis }) => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [welcomeShown, setWelcomeShown] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  
  const recognitionRef = useRef(null)

  const API_BASE_URL = 'http://localhost:5000/api'
  
  // Initialize Speech Recognition
  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setSpeechSupported(true)
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onstart = () => {
        setIsListening(true)
        console.log('Speech recognition started')
      }
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        console.log('Transcript:', transcript)
        setMessage(transcript)
      }
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access to use voice input.')
        } else if (event.error === 'no-speech') {
          console.log('No speech detected')
        }
      }
      
      recognition.onend = () => {
        setIsListening(false)
        console.log('Speech recognition ended')
      }
      
      recognitionRef.current = recognition
    } else {
      console.log('Speech recognition not supported in this browser')
      setSpeechSupported(false)
    }
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])
  
  // Show welcome message when analysis data is available
  useEffect(() => {
    if (showAnalysis && !welcomeShown) {
      setMessages([{
        text: "👋 Hi! I'm your AI churn analyst. I've analyzed your uploaded data and I'm ready to answer questions like:\n\n• What are the main factors driving churn?\n• Which customer segments are most at risk?\n• What trends do you see in the data?\n• How can we reduce churn?\n\nAsk me anything!",
        sender: 'ai'
      }])
      setWelcomeShown(true)
      setIsExpanded(true)
    }
  }, [showAnalysis, welcomeShown])

  const handleVoiceInput = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }
    
    if (isListening) {
      // Stop listening
      recognitionRef.current?.stop()
    } else {
      // Start listening
      try {
        recognitionRef.current?.start()
      } catch (error) {
        console.error('Error starting speech recognition:', error)
      }
    }
  }

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
          // Check if it's a "no dataset" error
          if (data.error && data.error.includes('dataset')) {
            setMessages(prev => [...prev, { 
              text: '⚠️ The server has lost your data. Please re-upload your CSV file to continue analysis.', 
              sender: 'ai' 
            }])
          } else {
            setMessages(prev => [...prev, { 
              text: 'Sorry, I encountered an error processing your request. Please try again.', 
              sender: 'ai' 
            }])
          }
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
              onKeyPress={(e) => e.key === 'Enter' && !isListening && handleSend()}
              placeholder={isListening ? "Listening..." : "Ask me anything about your churn analysis..."}
              className={`flex-1 px-4 py-3 rounded-xl border-none outline-none text-sm ${
                theme === 'light' 
                  ? 'bg-gray-100 text-black placeholder-gray-500' 
                  : 'bg-gray-800 text-white placeholder-gray-400'
              }`}
              disabled={isListening}
            />
            {speechSupported && (
              <button
                onClick={handleVoiceInput}
                disabled={isLoading}
                className={`p-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed relative ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : theme === 'light' 
                    ? 'bg-gray-200 text-black hover:bg-gray-300' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
                title={isListening ? "Stop recording" : "Start voice input"}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </>
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
            )}
            <button
              onClick={handleSend}
              disabled={isLoading || isListening}
              className={`p-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Voice Input Status */}
          {isListening && (
            <div className="mt-2 flex items-center justify-center space-x-2 text-xs animate-fadeIn">
              <div className="flex space-x-1">
                <div className="w-1 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-red-500 font-medium">Listening... Speak now</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatOverlay