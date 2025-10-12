const CTASection = () => {
  return (
    <section className="py-16 px-6 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">
          <span className="gradient-text">Ready to Get Started?</span>
        </h2>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Transform your insurance data into actionable insights today
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a href="/login" className="btn-primary inline-block text-center">
            Start Free Trial
          </a>
          <button className="btn-secondary">
            Schedule Demo
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold gradient-text mb-1">10x</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Faster Insights</div>
          </div>
          <div>
            <div className="text-2xl font-bold gradient-text mb-1">94%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
          </div>
          <div>
            <div className="text-2xl font-bold gradient-text mb-1">5min</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Setup Time</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection