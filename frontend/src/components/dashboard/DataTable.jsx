const DataTable = ({ predictionData, theme, getChurnRiskColor }) => {
  if (!predictionData || !predictionData.customers || predictionData.customers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="opacity-60">No data available</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className={`border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
            {/* Render dynamic column headers */}
            {predictionData.columns && predictionData.columns.map((column, index) => (
              <th key={index} className="text-left py-3 px-4 font-semibold">
                {typeof column === 'string' 
                  ? column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                  : column.label}
              </th>
            ))}
            <th className="text-left py-3 px-4 font-semibold">Churn Probability</th>
            <th className="text-left py-3 px-4 font-semibold">Risk Level</th>
          </tr>
        </thead>
        <tbody>
          {predictionData.customers.map((customer, index) => (
            <tr 
              key={index} 
              className={`border-b ${theme === 'light' ? 'border-gray-100' : 'border-gray-800'} hover:bg-opacity-50 ${theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-gray-800'} transition-colors`}
            >
              {/* Render dynamic column data */}
              {predictionData.columns && predictionData.columns.map((column, colIndex) => {
                const columnKey = typeof column === 'string' ? column : column.key;
                return (
                  <td key={colIndex} className="py-3 px-4">
                    {customer[columnKey] !== null && customer[columnKey] !== undefined 
                      ? customer[columnKey].toString() 
                      : 'N/A'}
                  </td>
                );
              })}
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChurnRiskColor(customer.Churn_Probability)}`}>
                  {customer.Churn_Probability}%
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  customer.Churn_Prediction === 'High Risk' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {customer.Churn_Prediction}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable

