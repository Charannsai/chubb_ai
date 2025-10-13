import { TrendingUp } from 'lucide-react'

const TrendsTab = () => {
  return (
    <div className="text-center py-12">
      <TrendingUp className="mx-auto h-16 w-16 opacity-50 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Trend Analysis</h3>
      <p className="opacity-60">Churn trends and patterns will be displayed here</p>
    </div>
  )
}

export default TrendsTab

