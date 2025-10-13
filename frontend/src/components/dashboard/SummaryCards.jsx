const SummaryCards = ({ summary, theme }) => {
  if (!summary) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
        <p className="text-sm opacity-60 mb-1">Total Customers</p>
        <p className="text-2xl font-bold">{summary.total_customers}</p>
      </div>
      <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-red-100' : 'bg-red-900/30'}`}>
        <p className="text-sm opacity-60 mb-1">High Risk</p>
        <p className="text-2xl font-bold text-red-600">{summary.high_risk_customers}</p>
      </div>
      <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-green-100' : 'bg-green-900/30'}`}>
        <p className="text-sm opacity-60 mb-1">Low Risk</p>
        <p className="text-2xl font-bold text-green-600">{summary.low_risk_customers}</p>
      </div>
      <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
        <p className="text-sm opacity-60 mb-1">Avg Churn Risk</p>
        <p className="text-2xl font-bold text-blue-600">{summary.average_churn_probability}%</p>
      </div>
    </div>
  )
}

export default SummaryCards

