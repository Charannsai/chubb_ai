import SummaryCards from '../SummaryCards'
import DataTable from '../DataTable'

const ChurnSummaryTab = ({ predictionData, theme, getChurnRiskColor }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <SummaryCards summary={predictionData?.summary} theme={theme} />

      {/* Data Table */}
      <DataTable 
        predictionData={predictionData} 
        theme={theme} 
        getChurnRiskColor={getChurnRiskColor} 
      />
    </div>
  )
}

export default ChurnSummaryTab

