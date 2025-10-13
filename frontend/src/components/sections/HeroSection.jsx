import { useState, useEffect } from 'react'

const HeroSection = ({ theme }) => {
  const [step, setStep] = useState(0)
  const [typingText, setTypingText] = useState('')
  const [showResponse, setShowResponse] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState(0)
  
  const prompts = [
    "Why are customers churning in the North region and what are the main factors?",
    "Show me the top risk factors for policy cancellation across all demographics",
    "What's the predicted churn rate for next quarter with confidence intervals?"
  ]
  
  const responses = [
    "Analysis shows 75% churn due to premium increases. Key factors: 23% price hike and 40% service quality drop in North region.",
    "Top risk factors: Payment delays (34%), Claim disputes (28%), Premium increases (21%), Poor customer service (17%).",
    "Predicted churn rate: 18.5% with 94% confidence interval. High-risk segments: Age 25-35, Premium $500+."
  ]

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 2000),  // Upload → Processing
      setTimeout(() => setStep(2), 4000),  // Processing → Accuracy
      setTimeout(() => setStep(3), 6000),  // Accuracy → Dashboard
      setTimeout(() => setStep(4), 8000),  // Dashboard → Chat
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (step === 4) {
      let typeInterval
      let responseTimer
      let nextPromptTimer
      
      const typePrompt = () => {
        const prompt = prompts[currentPrompt]
        setTypingText('')
        setShowResponse(false)
        
        let i = 0
        typeInterval = setInterval(() => {
          if (i < prompt.length) {
            setTypingText(prompt.slice(0, i + 1))
            i++
          } else {
            clearInterval(typeInterval)
            responseTimer = setTimeout(() => {
              setShowResponse(true)
              nextPromptTimer = setTimeout(() => {
                setShowResponse(false)
                setCurrentPrompt((prev) => (prev + 1) % prompts.length)
              }, 4000)
            }, 1000)
          }
        }, 100)
      }
      
      const initialTimer = setTimeout(typePrompt, 800)
      
      return () => {
        clearTimeout(initialTimer)
        clearTimeout(responseTimer)
        clearTimeout(nextPromptTimer)
        clearInterval(typeInterval)
      }
    }
  }, [step, currentPrompt])

  return (
    <section className="min-h-screen flex items-center px-6 py-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side */}
          <div className="space-y-8 animate-fadeInUp">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className={theme === 'light' ? 'text-black' : 'text-white'}>Predict, Explain,</span>
                <br />
                <span className={theme === 'light' ? 'text-black' : 'text-white'}>and Act with</span>
                <br />
                <span className={theme === 'light' ? 'text-black' : 'text-white'}>Chubb AI</span>
              </h1>
              
              <p className={`text-xl ${theme === 'light' ? 'text-black' : 'text-white'} opacity-70 max-w-lg leading-relaxed`}>
                The conversational AI that understands your insurance data and reveals why customers churn.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/login" className="btn-primary text-center">Login</a>
              <button className="btn-secondary">Documentation</button>
            </div>

            <div className={`flex items-center space-x-8 text-sm ${theme === 'light' ? 'text-black' : 'text-white'} opacity-60`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 ${theme === 'light' ? 'bg-black' : 'bg-white'} rounded-full animate-pulse`}></div>
                <span>94% Accuracy</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 ${theme === 'light' ? 'bg-black' : 'bg-white'} rounded-full animate-pulse`} style={{animationDelay: '0.5s'}}></div>
                <span>Real-time</span>
              </div>
            </div>
          </div>

          {/* Right Side - Step by Step Animation */}
          <div className="relative animate-slideInRight">
            <div className="glass rounded-3xl overflow-hidden border border-white/10 min-h-[400px]">
              
              {/* Step 1: Data Upload */}
              {step === 0 && (
                <div className="p-8 animate-scaleIn">
                  <div className="text-center space-y-6">
                    <div className={`w-20 h-20 mx-auto ${theme === 'light' ? 'bg-black/10' : 'bg-white/10'} rounded-2xl flex items-center justify-center animate-float`}>
                      <svg className={`w-10 h-10 ${theme === 'light' ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className={`text-xl font-medium ${theme === 'light' ? 'text-black' : 'text-white'}`}>Upload Data</h3>
                    <div className="glass rounded-xl p-4 border border-white/20">
                      <p className={`${theme === 'light' ? 'text-black/70' : 'text-white/70'} text-sm mb-3`}>customer_data.csv</p>
                      <div className={`w-full ${theme === 'light' ? 'bg-black/20' : 'bg-white/20'} h-1 rounded-full overflow-hidden`}>
                        <div className={`${theme === 'light' ? 'bg-black' : 'bg-white'} h-full w-3/4 rounded-full animate-pulse`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Processing */}
              {step === 1 && (
                <div className="p-8 animate-scaleIn">
                  <div className="text-center space-y-6">
                    <div className={`w-10 h-10 mx-auto border-2 ${theme === 'light' ? 'border-black/30 border-t-black' : 'border-white/30 border-t-white'} rounded-full animate-spin`}></div>
                    <h3 className={`text-xl font-medium ${theme === 'light' ? 'text-black' : 'text-white'}`}>Processing Data</h3>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="loading-shimmer h-3 rounded-full" style={{animationDelay: `${i * 0.2}s`}}></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Accuracy Display */}
              {step === 2 && (
                <div className="p-8 animate-scaleIn">
                  <div className="text-center space-y-6">
                    <div className={`text-6xl font-bold ${theme === 'light' ? 'text-black' : 'text-white'} animate-pulse`}>94%</div>
                    <h3 className={`text-xl font-medium ${theme === 'light' ? 'text-black' : 'text-white'}`}>Prediction Accuracy</h3>
                    <div className="space-y-4">
                      <div className={`flex justify-between ${theme === 'light' ? 'text-black/70' : 'text-white/70'}`}>
                        <span>Churn Rate</span>
                        <span>23%</span>
                      </div>
                      <div className={`flex justify-between ${theme === 'light' ? 'text-black/70' : 'text-white/70'}`}>
                        <span>Risk Score</span>
                        <span>0.82</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Dashboard */}
              {step === 3 && (
                <div className="animate-scaleIn">
                  <div className={`${theme === 'light' ? 'bg-black/5 border-b border-black/10' : 'bg-white/5 border-b border-white/10'} p-6`}>
                    <h3 className={`${theme === 'light' ? 'text-black' : 'text-white'} font-semibold text-lg`}>Dashboard</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass p-4 rounded-xl">
                        <div className={`text-xs ${theme === 'light' ? 'text-black/60' : 'text-white/60'} mb-3`}>Risk Score</div>
                        <div className={`h-2 ${theme === 'light' ? 'bg-black/20' : 'bg-white/20'} rounded-full overflow-hidden`}>
                          <div className={`h-full ${theme === 'light' ? 'bg-black' : 'bg-white'} rounded-full w-4/5 animate-pulse`}></div>
                        </div>
                      </div>
                      <div className="glass p-4 rounded-xl">
                        <div className={`text-xs ${theme === 'light' ? 'text-black/60' : 'text-white/60'} mb-3`}>Trend</div>
                        <div className={`h-2 ${theme === 'light' ? 'bg-black/20' : 'bg-white/20'} rounded-full overflow-hidden`}>
                          <div className={`h-full ${theme === 'light' ? 'bg-black' : 'bg-white'} rounded-full w-3/5 animate-pulse`}></div>
                        </div>
                      </div>
                      <div className="glass p-4 rounded-xl col-span-2">
                        <div className={`text-xs ${theme === 'light' ? 'text-black/60' : 'text-white/60'} mb-3`}>Demographics</div>
                        <div className="space-y-2">
                          <div className={`flex justify-between text-sm ${theme === 'light' ? 'text-black/80' : 'text-white/80'}`}>
                            <span>Age 25-35</span>
                            <span>45%</span>
                          </div>
                          <div className={`flex justify-between text-sm ${theme === 'light' ? 'text-black/80' : 'text-white/80'}`}>
                            <span>Premium $500+</span>
                            <span>67%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Chat Interface */}
              {step >= 4 && (
                <div className="animate-scaleIn">
                  <div className={`${theme === 'light' ? 'bg-black/5 border-b border-black/10' : 'bg-white/5 border-b border-white/10'} p-6`}>
                    <h3 className={`${theme === 'light' ? 'text-black' : 'text-white'} font-semibold text-lg`}>Chat Interface</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-end">
                      <div className={`${theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'} px-4 py-3 rounded-2xl rounded-br-md max-w-xs`}>
                        <p className="text-sm font-medium">{typingText}<span className="typing-cursor">|</span></p>
                      </div>
                    </div>

                    {showResponse && (
                      <div className="flex justify-start animate-fadeInUp">
                        <div className={`${theme === 'light' ? 'bg-black/10 text-black' : 'bg-white/10 text-white'} px-4 py-3 rounded-2xl rounded-bl-md max-w-xs`}>
                          <p className="text-sm">{responses[currentPrompt]}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>


          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection