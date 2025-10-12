import { Download } from 'lucide-react'

const OutputTab = ({ predictionData, handleDownloadResults }) => {
  return (
    <div className="text-center py-12">
      <Download className="mx-auto h-16 w-16 opacity-50 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Export Results</h3>
      <p className="opacity-60 mb-6">Download your analysis results</p>
      {predictionData && predictionData.customers && (
        <button 
          onClick={handleDownloadResults}
          className="btn-primary"
        >
          <Download className="inline-block w-4 h-4 mr-2" />
          Download Report (CSV)
        </button>
      )}
    </div>
  )
}

export default OutputTab

