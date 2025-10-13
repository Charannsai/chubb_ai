import { useState, useEffect } from 'react'
import { Upload, FileText, Users, TrendingUp, User, Download, BarChart3, AlertCircle } from 'lucide-react'
import DashboardNavbar from '../components/layout/DashboardNavbar'
import ChatOverlay from '../components/ChatOverlay'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts'

const DashboardPage = () => {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [activeTab, setActiveTab] = useState('churn-summary')
  const [uploadComplete, setUploadComplete] = useState(false)
  
  // API response data
  const [predictionData, setPredictionData] = useState(null)
  const [error, setError] = useState(null)
  
  // Selected customer for detailed view
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState(null)
  const [hoveredRow, setHoveredRow] = useState(null)
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const [customerExplanation, setCustomerExplanation] = useState(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const API_BASE_URL = 'http://localhost:5000/api'

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.body.className = savedTheme
  }, [])

  // Check if backend has dataset loaded when analysis is shown
  useEffect(() => {
    if (showAnalysis && predictionData) {
      const checkDatasetStatus = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/dataset/status`)
          const data = await response.json()
          
          if (!data.loaded) {
            // Backend lost the dataset - show warning
            setError('⚠️ Server was restarted. Please re-upload your data to continue analysis.')
            setShowAnalysis(false)
            setPredictionData(null)
            setSelectedCustomer(null)
            setSelectedCustomerIndex(null)
            setCustomerExplanation(null)
            // Reset pagination
            setCurrentPage(1)
            setRowsPerPage(10)
          }
        } catch (err) {
          console.error('Failed to check dataset status:', err)
        }
      }
      
      checkDatasetStatus()
    }
  }, [showAnalysis, predictionData])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0] && files[0].type === 'text/csv') {
      setFile(files[0])
      setError(null)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process file')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setPredictionData(data)
        setUploadComplete(true)
        
        // Reset pagination
        setCurrentPage(1)
        setRowsPerPage(10)
        
        // Log GPU acceleration status
        if (data.gpu_accelerated) {
          console.log('🚀 GPU Acceleration: ENABLED')
        }
        if (data.processing_time) {
          console.log(`⚡ Prediction Time: ${data.processing_time.prediction}s (AI explanations generated on-demand)`)
        }
        
        setTimeout(() => {
          setShowAnalysis(true)
          setIsLoading(false)
        }, 500)
      } else {
        throw new Error(data.message || 'Prediction failed')
      }
      
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'An error occurred while processing the file')
      setIsLoading(false)
    }
  }

  const handleDownloadResults = () => {
    if (!predictionData || !predictionData.customers) return
    
    const headers = Object.keys(predictionData.customers[0])
    const csvContent = [
      headers.join(','),
      ...predictionData.customers.map(row => 
        headers.map(header => {
          const value = row[header]
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'churn_predictions.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const tabs = [
    { id: 'churn-summary', label: 'Churn Summary', icon: BarChart3 },
    { id: 'demographics', label: 'Demographics', icon: Users },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'p2p', label: 'P2P Profile', icon: User },
    { id: 'output', label: 'Output', icon: Download }
  ]
  
  // Fetch AI explanation for a specific customer
  const fetchCustomerExplanation = async (customerIndex) => {
    console.log(`🔍 Requesting explanation for customer ${customerIndex}...`)
    setLoadingExplanation(true)
    setCustomerExplanation(null)
    
    try {
      const url = `${API_BASE_URL}/explain/${customerIndex}`
      console.log(`Making request to: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      console.log(`Response status: ${response.status}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`HTTP Error ${response.status}:`, errorData)
        
        if (response.status === 400 && errorData.error?.includes('No dataset loaded')) {
          setError('⚠️ Backend lost the dataset. Please re-upload your CSV file.')
          setShowAnalysis(false)
          setPredictionData(null)
          // Reset pagination
          setCurrentPage(1)
          setRowsPerPage(10)
          throw new Error('Please re-upload your data')
        }
        
        throw new Error(errorData.error || `Server returned ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.success && data.explanation) {
        setCustomerExplanation(data.explanation)
        if (data.cached) {
          console.log(`💾 Loaded cached explanation for customer ${customerIndex}`)
        } else {
          console.log(`✨ Generated new explanation for customer ${customerIndex} in ${data.generation_time}s`)
        }
      } else {
        const errorMsg = data.error || 'Unable to generate explanation at this time.'
        console.error('API returned error:', errorMsg)
        setCustomerExplanation(errorMsg)
      }
    } catch (error) {
      console.error('Error fetching explanation:', error)
      setCustomerExplanation(`Failed to load explanation: ${error.message}. Please check the console and backend logs.`)
    } finally {
      setLoadingExplanation(false)
    }
  }

  // Handle customer row click
  const handleCustomerClick = (customer, index) => {
    setSelectedCustomer(customer)
    setSelectedCustomerIndex(index)
    setActiveTab('p2p')
    // Fetch explanation for this customer
    fetchCustomerExplanation(index)
  }

  // Pagination helpers
  const getPaginatedData = (data) => {
    if (!data || data.length === 0) return []
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return data.slice(startIndex, endIndex)
  }

  const getTotalPages = (data) => {
    if (!data || data.length === 0) return 0
    return Math.ceil(data.length / rowsPerPage)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage)
    setCurrentPage(1) // Reset to first page when changing rows per page
  }

  const getChurnRiskColor = (probability) => {
    const prob = parseFloat(probability)
    if (prob >= 70) return 'bg-red-100 text-red-800'
    if (prob >= 50) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  // Chart colors
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042']
  
  // Helper function to get numeric columns
  const getNumericColumns = () => {
    if (!predictionData || !predictionData.customers || predictionData.customers.length === 0) return []
    
    const sample = predictionData.customers[0]
    return predictionData.columns
      .filter(col => {
        const value = sample[col.key]
        return value !== null && value !== undefined && !isNaN(Number(value))
      })
  }
  
  // Helper function to get categorical columns
  const getCategoricalColumns = () => {
    if (!predictionData || !predictionData.customers || predictionData.customers.length === 0) return []
    
    const sample = predictionData.customers[0]
    return predictionData.columns
      .filter(col => {
        const value = sample[col.key]
        return value !== null && value !== undefined && isNaN(Number(value))
      })
  }
  
  // Prepare data for age/numeric distribution histogram
  const prepareHistogramData = (columnKey) => {
    if (!predictionData || !predictionData.customers) return []
    
    const values = predictionData.customers
      .map(c => Number(c[columnKey]))
      .filter(v => !isNaN(v) && isFinite(v))
    
    if (values.length === 0) return []
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    const binCount = 10
    const binSize = (max - min) / binCount
    
    if (binSize === 0 || !isFinite(binSize)) {
      return [{
        range: `${min.toFixed(0)}`,
        count: values.length
      }]
    }
    
    const bins = Array(binCount).fill(0).map((_, i) => ({
      range: `${(min + i * binSize).toFixed(0)}-${(min + (i + 1) * binSize).toFixed(0)}`,
      count: 0
    }))
    
    values.forEach(v => {
      let binIndex = Math.floor((v - min) / binSize)
      binIndex = Math.max(0, Math.min(binIndex, binCount - 1))
      if (bins[binIndex]) {
        bins[binIndex].count++
      }
    })
    
    return bins
  }
  
  // Prepare data for categorical bar chart
  const prepareCategoricalData = (columnKey) => {
    if (!predictionData || !predictionData.customers) return []
    
    const counts = {}
    predictionData.customers.forEach(customer => {
      const value = customer[columnKey]
      if (value !== null && value !== undefined && value !== '') {
        counts[value] = (counts[value] || 0) + 1
      }
    })
    
    const result = Object.entries(counts).map(([name, count]) => ({
      name: String(name),
      count
    }))
    
    return result.sort((a, b) => b.count - a.count).slice(0, 10)
  }
  
  // Prepare churn distribution data
  const prepareChurnDistribution = () => {
    if (!predictionData || !predictionData.customers) return []
    
    const highRisk = predictionData.customers.filter(c => c.Churn_Prediction === 'High Risk').length
    const lowRisk = predictionData.customers.filter(c => c.Churn_Prediction === 'Low Risk').length
    const total = highRisk + lowRisk
    
    return [
      { name: 'High Risk', value: highRisk, percentage: ((highRisk / total) * 100).toFixed(2) },
      { name: 'Low Risk', value: lowRisk, percentage: ((lowRisk / total) * 100).toFixed(2) }
    ]
  }
  
  // Prepare scatter plot data
  const prepareScatterData = (xColumn, yColumn) => {
    if (!predictionData || !predictionData.customers) return []
    
    return predictionData.customers
      .map(customer => ({
        x: Number(customer[xColumn]),
        y: Number(customer[yColumn]),
        churn: customer.Churn_Prediction
      }))
      .filter(d => !isNaN(d.x) && !isNaN(d.y) && isFinite(d.x) && isFinite(d.y))
  }
  
  // Prepare pyramid data for churn rate
  const prepareChurnPyramidData = () => {
    if (!predictionData || !predictionData.customers) return []
    
    const ranges = [
      { label: '0-20%', min: 0, max: 20 },
      { label: '20-40%', min: 20, max: 40 },
      { label: '40-60%', min: 40, max: 60 },
      { label: '60-80%', min: 60, max: 80 },
      { label: '80-100%', min: 80, max: 100 }
    ]
    
    const data = ranges.map(range => {
      const inRange = predictionData.customers.filter(c => {
        const prob = c.Churn_Probability
        return prob >= range.min && prob < range.max
      }).length
      
      const total = predictionData.customers.length
      const percentage = ((inRange / total) * 100).toFixed(1)
      
      return {
        range: range.label,
        count: inRange,
        percentage: parseFloat(percentage)
      }
    })
    
    return data.reverse()
  }
  
  // Prepare churn by age groups
  const prepareChurnByAgeGroup = () => {
    if (!predictionData || !predictionData.customers) return []
    
    const ageCol = predictionData.columns?.find(col => 
      col.key.toLowerCase().includes('age')
    )
    
    if (!ageCol) return []
    
    const ageGroups = [
      { label: '18-30', min: 18, max: 30 },
      { label: '31-40', min: 31, max: 40 },
      { label: '41-50', min: 41, max: 50 },
      { label: '51-60', min: 51, max: 60 },
      { label: '60+', min: 61, max: 150 }
    ]
    
    return ageGroups.map(group => {
      const customersInGroup = predictionData.customers.filter(c => {
        const age = Number(c[ageCol.key])
        return age >= group.min && age <= group.max
      })
      
      const highRisk = customersInGroup.filter(c => c.Churn_Prediction === 'High Risk').length
      const lowRisk = customersInGroup.filter(c => c.Churn_Prediction === 'Low Risk').length
      
      return {
        group: group.label,
        'High Risk': highRisk,
        'Low Risk': lowRisk,
        total: highRisk + lowRisk
      }
    }).filter(g => g.total > 0)
  }
  
  // Prepare churn by categorical field
  const prepareChurnByCategory = (columnKey) => {
    if (!predictionData || !predictionData.customers) return []
    
    const categories = {}
    predictionData.customers.forEach(customer => {
      const value = customer[columnKey]
      if (value !== null && value !== undefined && value !== '') {
        if (!categories[value]) {
          categories[value] = { 'High Risk': 0, 'Low Risk': 0 }
        }
        if (customer.Churn_Prediction === 'High Risk') {
          categories[value]['High Risk']++
        } else {
          categories[value]['Low Risk']++
        }
      }
    })
    
    return Object.entries(categories)
      .map(([name, counts]) => ({
        name: String(name),
        ...counts,
        total: counts['High Risk'] + counts['Low Risk']
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
  }
  
  // Prepare average churn probability by numeric ranges
  const prepareAvgChurnByNumericRange = (columnKey) => {
    if (!predictionData || !predictionData.customers) return []
    
    const values = predictionData.customers
      .map(c => Number(c[columnKey]))
      .filter(v => !isNaN(v) && isFinite(v))
    
    if (values.length === 0) return []
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    const binCount = 8
    const binSize = (max - min) / binCount
    
    if (binSize === 0 || !isFinite(binSize)) return []
    
    const bins = Array(binCount).fill(0).map((_, i) => ({
      range: `${(min + i * binSize).toFixed(0)}-${(min + (i + 1) * binSize).toFixed(0)}`,
      sum: 0,
      count: 0
    }))
    
    predictionData.customers.forEach(customer => {
      const value = Number(customer[columnKey])
      if (!isNaN(value) && isFinite(value)) {
        let binIndex = Math.floor((value - min) / binSize)
        binIndex = Math.max(0, Math.min(binIndex, binCount - 1))
        if (bins[binIndex]) {
          bins[binIndex].sum += customer.Churn_Probability
          bins[binIndex].count++
        }
      }
    })
    
    return bins
      .filter(b => b.count > 0)
      .map(b => ({
        range: b.range,
        avgChurn: parseFloat((b.sum / b.count).toFixed(2))
      }))
  }
  
  // Helper function to find column by partial name match (case insensitive)
  const findColumnByName = (columns, searchNames) => {
    if (!columns) return null
    for (const searchName of searchNames) {
      const found = columns.find(col => 
        col.key.toLowerCase().includes(searchName.toLowerCase()) ||
        col.label.toLowerCase().includes(searchName.toLowerCase())
      )
      if (found) return found
    }
    return null
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'churn-summary':
        return (
          <div className="space-y-6">
            {predictionData && predictionData.summary && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
                    <p className="text-sm opacity-60 mb-1">Total Customers</p>
                    <p className="text-2xl font-bold">{predictionData.summary.total_customers}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-red-100' : 'bg-red-900/30'}`}>
                    <p className="text-sm opacity-60 mb-1">High Risk</p>
                    <p className="text-2xl font-bold text-red-600">{predictionData.summary.high_risk_customers}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-green-100' : 'bg-green-900/30'}`}>
                    <p className="text-sm opacity-60 mb-1">Low Risk</p>
                    <p className="text-2xl font-bold text-green-600">{predictionData.summary.low_risk_customers}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                    <p className="text-sm opacity-60 mb-1">Avg Churn Risk</p>
                    <p className="text-2xl font-bold text-blue-600">{predictionData.summary.average_churn_probability}%</p>
                  </div>
                </div>
                
                {/* GPU Acceleration Indicator */}
                {predictionData.gpu_accelerated && predictionData.processing_time && (
                  <div className={`mb-6 p-3 rounded-xl ${theme === 'light' ? 'bg-gradient-to-r from-green-50 to-blue-50 border border-green-200' : 'bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700/30'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${theme === 'light' ? 'bg-green-500' : 'bg-green-400'} animate-pulse`}></div>
                        <span className="text-sm font-semibold">🚀 GPU Acceleration Enabled</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs opacity-70">
                        <span>Prediction Time: {predictionData.processing_time.prediction}s</span>
                        <span className="opacity-60">(AI explanations generated on-demand)</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Pagination Controls - Top */}
            <div className={`mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-lg ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-70">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    theme === 'light' 
                      ? 'bg-white border-gray-300 hover:border-gray-400' 
                      : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              {predictionData && predictionData.customers && (
                <div className="text-sm opacity-70">
                  Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, predictionData.customers.length)} of {predictionData.customers.length} customers
                </div>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg">
              {predictionData && predictionData.customers && predictionData.customers.length > 0 ? (
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
                      <tr>
                        {predictionData.columns && predictionData.columns.map((column, index) => (
                          <th 
                            key={index} 
                            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                          >
                            {column.label}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                          Churn Probability
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                          Risk Level
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'light' ? 'divide-gray-200' : 'divide-gray-700'}`}>
                      {getPaginatedData(predictionData.customers).map((customer, displayIndex) => {
                        const actualIndex = ((currentPage - 1) * rowsPerPage) + displayIndex
                        return (
                          <tr 
                            key={actualIndex} 
                            onClick={() => handleCustomerClick(customer, actualIndex)}
                            onMouseEnter={() => setHoveredRow(actualIndex)}
                            onMouseLeave={() => setHoveredRow(null)}
                            className={`cursor-pointer transition-all duration-200 relative ${
                              hoveredRow === actualIndex 
                                ? theme === 'light' ? 'bg-blue-50 shadow-md' : 'bg-blue-900/20 shadow-md' 
                                : theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-gray-700'
                            }`}
                          >
                            {predictionData.columns && predictionData.columns.map((column, colIndex) => (
                              <td key={colIndex} className="px-4 py-3 text-sm whitespace-nowrap">
                                {customer[column.key] !== null && customer[column.key] !== undefined 
                                  ? String(customer[column.key]) 
                                  : 'N/A'}
                              </td>
                            ))}
                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getChurnRiskColor(customer.Churn_Probability)}`}>
                                {typeof customer.Churn_Probability === 'number' 
                                  ? customer.Churn_Probability.toFixed(2) 
                                  : customer.Churn_Probability}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap relative">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                customer.Churn_Prediction === 'High Risk' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {customer.Churn_Prediction}
                              </span>
                              {hoveredRow === actualIndex && (
                                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium animate-fadeIn ${
                                  theme === 'light' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                                }`}>
                                  View Details →
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="opacity-60">No data available</p>
                </div>
              )}
            </div>

            {/* Pagination Controls - Bottom */}
            {predictionData && predictionData.customers && predictionData.customers.length > 0 && (
              <div className={`mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-lg ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
                <div className="text-sm opacity-70">
                  Page {currentPage} of {getTotalPages(predictionData.customers)}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === 1
                        ? 'opacity-40 cursor-not-allowed'
                        : theme === 'light'
                        ? 'bg-white hover:bg-gray-100 border border-gray-300'
                        : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                    }`}
                  >
                    First
                  </button>
                  
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === 1
                        ? 'opacity-40 cursor-not-allowed'
                        : theme === 'light'
                        ? 'bg-white hover:bg-gray-100 border border-gray-300'
                        : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: getTotalPages(predictionData.customers) }, (_, i) => i + 1)
                      .filter(page => {
                        const totalPages = getTotalPages(predictionData.customers)
                        // Show first page, last page, current page, and pages around current
                        return (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        )
                      })
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 opacity-50">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              currentPage === page
                                ? theme === 'light'
                                  ? 'bg-black text-white'
                                  : 'bg-white text-black'
                                : theme === 'light'
                                ? 'bg-white hover:bg-gray-100 border border-gray-300'
                                : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === getTotalPages(predictionData.customers)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === getTotalPages(predictionData.customers)
                        ? 'opacity-40 cursor-not-allowed'
                        : theme === 'light'
                        ? 'bg-white hover:bg-gray-100 border border-gray-300'
                        : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                    }`}
                  >
                    Next
                  </button>
                  
                  <button
                    onClick={() => handlePageChange(getTotalPages(predictionData.customers))}
                    disabled={currentPage === getTotalPages(predictionData.customers)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === getTotalPages(predictionData.customers)
                        ? 'opacity-40 cursor-not-allowed'
                        : theme === 'light'
                        ? 'bg-white hover:bg-gray-100 border border-gray-300'
                        : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                    }`}
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      case 'demographics':
        if (!predictionData || !predictionData.customers) {
          return (
            <div className="text-center py-12">
              <Users className="mx-auto h-16 w-16 opacity-50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Demographics Analysis</h3>
              <p className="opacity-60">Upload data to see demographic insights</p>
            </div>
          )
        }
        
        const numericCols = getNumericColumns()
        const categoricalCols = getCategoricalColumns()
        const churnDistData = prepareChurnDistribution()
        const pyramidData = prepareChurnPyramidData()
        
        const ageCol = findColumnByName(numericCols, ['age'])
        const currAnnAmtCol = findColumnByName(numericCols, ['curr_ann_amt', 'current_annual_amount', 'annual_amount', 'curr ann amt'])
        const incomeCol = findColumnByName(numericCols, ['income'])
        const cityCol = findColumnByName(categoricalCols, ['city'])
        const custOrgDateCol = findColumnByName(numericCols, ['cust_org_date', 'customer_org_date', 'org_date', 'cust org date'])
        
        return (
          <div className="space-y-8">
            <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
              <h3 className="text-xl font-bold mb-4">Churn Rate Distribution Pyramid</h3>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart 
                  data={pyramidData} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    label={{ 
                      value: 'Percentage of Customers (%)', 
                      position: 'insideBottom',
                      offset: -10
                    }} 
                  />
                  <YAxis dataKey="range" type="category" width={80} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className={`p-3 rounded-lg shadow-lg ${theme === 'light' ? 'bg-white' : 'bg-gray-800'}`}>
                            <p className="font-semibold">{payload[0].payload.range}</p>
                            <p className="text-sm">Count: {payload[0].payload.count}</p>
                            <p className="text-sm">Percentage: {payload[0].value}%</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="percentage" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8884d8' }}></div>
                  <span className="text-sm">Churn Probability Range</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
                <h3 className="text-lg font-bold mb-4">Churn Risk Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={churnDistData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {churnDistData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ff8042' : '#82ca9d'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff8042' }}></div>
                    <span className="text-sm">High Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#82ca9d' }}></div>
                    <span className="text-sm">Low Risk</span>
                  </div>
                </div>
              </div>

              {ageCol && prepareHistogramData(ageCol.key).length > 0 && (
                <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
                  <h3 className="text-lg font-bold mb-4">Age Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prepareHistogramData(ageCol.key)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8884d8' }}></div>
                    <span className="text-sm">{ageCol.label}</span>
                  </div>
                </div>
              )}

              {cityCol && prepareCategoricalData(cityCol.key).length > 0 && (
                <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
                  <h3 className="text-lg font-bold mb-4">City Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prepareCategoricalData(cityCol.key)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#82ca9d' }}></div>
                    <span className="text-sm">{cityCol.label}</span>
                  </div>
                </div>
              )}

              {currAnnAmtCol && prepareHistogramData(currAnnAmtCol.key).length > 0 && (
                <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
                  <h3 className="text-lg font-bold mb-4">Current Annual Amount Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prepareHistogramData(currAnnAmtCol.key)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ffc658' }}></div>
                    <span className="text-sm">{currAnnAmtCol.label}</span>
                  </div>
                </div>
              )}

              {ageCol && incomeCol && prepareScatterData(ageCol.key, incomeCol.key).length > 0 && (
                <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
                  <h3 className="text-lg font-bold mb-4">Age vs Income Relationship</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" dataKey="x" name="Age" />
                      <YAxis type="number" dataKey="y" name="Income" />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className={`p-2 rounded-lg shadow-lg ${theme === 'light' ? 'bg-white' : 'bg-gray-800'}`}>
                                <p className="text-sm">Age: {payload[0].value}</p>
                                <p className="text-sm">Income: {payload[1].value}</p>
                                <p className="text-sm font-semibold">{payload[0].payload.churn}</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Scatter 
                        name="High Risk" 
                        data={prepareScatterData(ageCol.key, incomeCol.key).filter(d => d.churn === 'High Risk')}
                        fill="#ff8042"
                      />
                      <Scatter 
                        name="Low Risk" 
                        data={prepareScatterData(ageCol.key, incomeCol.key).filter(d => d.churn === 'Low Risk')}
                        fill="#82ca9d"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff8042' }}></div>
                      <span className="text-sm">High Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#82ca9d' }}></div>
                      <span className="text-sm">Low Risk</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      case 'trends':
        if (!predictionData || !predictionData.customers) {
          return (
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-16 w-16 opacity-50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Trend Analysis</h3>
              <p className="opacity-60">Upload data to see churn trends</p>
            </div>
          )
        }
        
        const trendsNumericCols = getNumericColumns()
        const trendsCategoricalCols = getCategoricalColumns()
        const ageChurnData = prepareChurnByAgeGroup()
        const trendsCityCol = findColumnByName(trendsCategoricalCols, ['city'])
        const cityChurnData = trendsCityCol ? prepareChurnByCategory(trendsCityCol.key) : []
        const trendsIncomeCol = findColumnByName(trendsNumericCols, ['income'])
        const incomeChurnTrend = trendsIncomeCol ? prepareAvgChurnByNumericRange(trendsIncomeCol.key) : []
        const trendsAgeCol = findColumnByName(trendsNumericCols, ['age'])
        const ageChurnTrend = trendsAgeCol ? prepareAvgChurnByNumericRange(trendsAgeCol.key) : []
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ageChurnData.length > 0 && (
                <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
                  <h3 className="text-lg font-bold mb-4">Churn Risk by Age Group</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ageChurnData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="group" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="High Risk" stackId="a" fill="#ff8042" />
                      <Bar dataKey="Low Risk" stackId="a" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff8042' }}></div>
                      <span className="text-sm">High Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#82ca9d' }}></div>
                      <span className="text-sm">Low Risk</span>
                    </div>
                  </div>
                </div>
              )}

              {cityChurnData.length > 0 && (
                <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
                  <h3 className="text-lg font-bold mb-4">Churn Risk by City (Top 8)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={cityChurnData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="High Risk" stackId="a" fill="#ff8042" />
                      <Bar dataKey="Low Risk" stackId="a" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff8042' }}></div>
                      <span className="text-sm">High Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#82ca9d' }}></div>
                      <span className="text-sm">Low Risk</span>
                    </div>
                  </div>
                </div>
              )}

              {incomeChurnTrend.length > 0 && (
                <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
                  <h3 className="text-lg font-bold mb-4">Average Churn Probability by Income Range</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={incomeChurnTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                      <YAxis label={{ value: 'Avg Churn %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgChurn" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8884d8' }}></div>
                    <span className="text-sm">Average Churn Probability</span>
                  </div>
                </div>
              )}

              {ageChurnTrend.length > 0 && (
                <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
                  <h3 className="text-lg font-bold mb-4">Average Churn Probability by Age Range</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={ageChurnTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                      <YAxis label={{ value: 'Avg Churn %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgChurn" stroke="#ffc658" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ffc658' }}></div>
                    <span className="text-sm">Average Churn Probability</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
              <h3 className="text-lg font-bold mb-4">Key Trend Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ageChurnData.length > 0 && (
                  <div className="p-4 rounded-lg bg-opacity-50 bg-blue-500">
                    <p className="text-sm opacity-80">Highest Risk Age Group</p>
                    <p className="text-xl font-bold">
                      {ageChurnData.reduce((max, curr) => 
                        curr['High Risk'] > max['High Risk'] ? curr : max
                      ).group}
                    </p>
                  </div>
                )}
                {cityChurnData.length > 0 && (
                  <div className="p-4 rounded-lg bg-opacity-50 bg-green-500">
                    <p className="text-sm opacity-80">Highest Risk City</p>
                    <p className="text-xl font-bold">{cityChurnData[0]?.name || 'N/A'}</p>
                  </div>
                )}
                <div className="p-4 rounded-lg bg-opacity-50 bg-purple-500">
                  <p className="text-sm opacity-80">Total Customers Analyzed</p>
                  <p className="text-xl font-bold">{predictionData.customers.length}</p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'p2p':
        if (!selectedCustomer) {
          return (
            <div className="text-center py-12">
              <User className="mx-auto h-16 w-16 opacity-50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">P2P Customer Profile</h3>
              <p className="opacity-60">Click on any customer from the Churn Summary to view detailed profile</p>
            </div>
          )
        }
        
        const customerChurnRate = selectedCustomer.Churn_Probability
        const customerRiskLevel = selectedCustomer.Churn_Prediction
        const isHighRisk = customerRiskLevel === 'High Risk'
        
        const numericData = predictionData.columns
          .filter(col => {
            const value = selectedCustomer[col.key]
            return value !== null && value !== undefined && !isNaN(Number(value))
          })
          .map(col => ({
            label: col.label,
            value: Number(selectedCustomer[col.key])
          }))
        
        const categoricalData = predictionData.columns
          .filter(col => {
            const value = selectedCustomer[col.key]
            return value !== null && value !== undefined && isNaN(Number(value))
          })
          .map(col => ({
            label: col.label,
            value: String(selectedCustomer[col.key])
          }))
        
        const avgChurn = predictionData.summary.average_churn_probability
        const churnDifference = customerChurnRate - avgChurn
        
        return (
          <div className="space-y-6">
            <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gradient-to-r from-blue-900/30 to-purple-900/30'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    isHighRisk ? 'bg-red-500' : 'bg-green-500'
                  }`}>
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {predictionData.columns[0] ? `${selectedCustomer[predictionData.columns[0].key]}` : 'Customer Profile'}
                    </h2>
                    <p className="text-sm opacity-70">Detailed Churn Analysis</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedCustomer(null)
                    setSelectedCustomerIndex(null)
                    setCustomerExplanation(null)
                    setActiveTab('churn-summary')
                  }}
                  className="btn-secondary"
                >
                  ← Back to Summary
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className={`p-4 rounded-lg ${isHighRisk ? 'bg-red-500' : 'bg-green-500'} bg-opacity-20`}>
                  <p className="text-sm opacity-80 mb-1">Churn Probability</p>
                  <p className="text-4xl font-bold">{customerChurnRate.toFixed(2)}%</p>
                </div>
                <div className={`p-4 rounded-lg ${theme === 'light' ? 'bg-white' : 'bg-gray-800'} bg-opacity-50`}>
                  <p className="text-sm opacity-80 mb-1">Risk Level</p>
                  <p className={`text-2xl font-bold ${isHighRisk ? 'text-red-600' : 'text-green-600'}`}>
                    {customerRiskLevel}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${theme === 'light' ? 'bg-white' : 'bg-gray-800'} bg-opacity-50`}>
                  <p className="text-sm opacity-80 mb-1">vs Average</p>
                  <p className={`text-2xl font-bold ${churnDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {churnDifference > 0 ? '+' : ''}{churnDifference.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {categoricalData.length > 0 && (
                <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
                  <h3 className="text-lg font-bold mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    {categoricalData.map((item, index) => (
                      <div key={index} className="flex justify-between items-center pb-2 border-b border-opacity-20 border-gray-500">
                        <span className="text-sm opacity-70">{item.label}</span>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {numericData.length > 0 && (
                <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
                  <h3 className="text-lg font-bold mb-4">Numeric Metrics</h3>
                  <div className="space-y-3">
                    {numericData.map((item, index) => (
                      <div key={index} className="flex justify-between items-center pb-2 border-b border-opacity-20 border-gray-500">
                        <span className="text-sm opacity-70">{item.label}</span>
                        <span className="font-semibold">{item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
                <h3 className="text-lg font-bold mb-4">Churn Risk Gauge</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Churn Risk', value: customerChurnRate },
                        { name: 'Retention', value: 100 - customerChurnRate }
                      ]}
                      cx="50%"
                      cy="50%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                    >
                      <Cell fill={isHighRisk ? '#ff8042' : '#ffc658'} />
                      <Cell fill="#e0e0e0" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center mt-4">
                  <p className="text-3xl font-bold">{customerChurnRate.toFixed(1)}%</p>
                  <p className="text-sm opacity-70">Churn Probability</p>
                </div>
              </div>
              
              <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
                <h3 className="text-lg font-bold mb-4">Comparison with Average Customer</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { name: 'This Customer', value: customerChurnRate },
                    { name: 'Average', value: avgChurn }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      <Cell fill={isHighRisk ? '#ff8042' : '#82ca9d'} />
                      <Cell fill="#8884d8" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* AI-Generated Explanation */}
            <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gradient-to-r from-purple-50 to-blue-50' : 'bg-gradient-to-r from-purple-900/30 to-blue-900/30'}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-purple-600' : 'bg-purple-500'}`}>
                  <User className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold">AI-Powered Churn Analysis</h3>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'light' ? 'bg-white' : 'bg-gray-800'}`}>
                <p className="text-sm opacity-80 mb-3 font-semibold">Why this customer might churn:</p>
                {loadingExplanation ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin ${theme === 'light' ? 'border-purple-600' : 'border-purple-400'}`}></div>
                      <p className="text-sm opacity-60">Generating AI explanation...</p>
                    </div>
                  </div>
                ) : customerExplanation ? (
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {customerExplanation}
                  </div>
                ) : (
                  <div className="text-sm opacity-60 italic">
                    No explanation available. Click on a customer to generate.
                  </div>
                )}
              </div>
            </div>
            
            <div className={`p-6 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
              <h3 className="text-lg font-bold mb-4">Key Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${isHighRisk ? 'bg-red-500' : 'bg-green-500'} bg-opacity-20`}>
                  <p className="text-sm font-semibold mb-1">Risk Status</p>
                  <p className="text-xs opacity-80">
                    {isHighRisk 
                      ? 'This customer has a high probability of churning. Immediate action recommended.'
                      : 'This customer has a low churn risk. Continue engagement strategies.'}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                  <p className="text-sm font-semibold mb-1">Compared to Average</p>
                  <p className="text-xs opacity-80">
                    {churnDifference > 0 
                      ? `${churnDifference.toFixed(1)}% higher than average customer`
                      : `${Math.abs(churnDifference).toFixed(1)}% lower than average customer`}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${theme === 'light' ? 'bg-purple-100' : 'bg-purple-900/30'}`}>
                  <p className="text-sm font-semibold mb-1">Recommendation</p>
                  <p className="text-xs opacity-80">
                    {isHighRisk 
                      ? 'Consider offering retention incentives or personalized engagement'
                      : 'Maintain current service level and monitor regularly'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'output':
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
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex">
      <DashboardNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {!showAnalysis ? (
          <div className="pt-24 pb-12 px-6">
            <div className="text-center max-w-md w-full mx-auto animate-fadeInUp">
              <h1 className="text-2xl font-semibold mb-6">
                Upload Data
              </h1>
              
              {error && (
                <div className={`mb-4 p-4 rounded-xl ${theme === 'light' ? 'bg-red-100 text-red-800' : 'bg-red-900/30 text-red-400'} flex items-center`}>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              {isLoading ? (
                <div className="glass rounded-3xl p-12">
                  <div className="text-center">
                    <div className="mx-auto h-12 w-12 mb-4 loading-shimmer rounded-full" />
                    <div className="space-y-3 mb-6">
                      <div className="loading-shimmer h-4 rounded mx-auto w-3/4" />
                      <div className="loading-shimmer h-3 rounded mx-auto w-1/2" />
                    </div>
                    <p className="text-sm opacity-60">Processing your data...</p>
                    <p className="text-xs opacity-40 mt-2">This may take a few moments</p>
                  </div>
                </div>
              ) : (
                <div 
                  className={`glass border-2 border-dashed rounded-3xl p-12 transition-all ${
                    dragActive 
                      ? `${theme === 'light' ? 'border-black/50 bg-black/10' : 'border-white/50 bg-white/10'}` 
                      : `${theme === 'light' ? 'border-black/20 hover:border-black/40' : 'border-white/20 hover:border-white/40'}`
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 opacity-60 mb-4" />
                    
                    {file ? (
                      <div className="mb-4">
                        <FileText className={`mx-auto h-8 w-8 ${theme === 'light' ? 'text-black' : 'text-white'} mb-2`} />
                        <p className="text-xs font-medium">
                          {file.name}
                        </p>
                        <p className="text-xs opacity-50">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">
                          Drop CSV file here
                        </p>
                        <p className="text-xs opacity-60">
                          or click to browse
                        </p>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="csv-upload"
                    />
                    
                    <label
                      htmlFor="csv-upload"
                      className="btn-secondary inline-block cursor-pointer transform hover:scale-105 transition-transform duration-200"
                    >
                      Choose File
                    </label>
                  </div>
                </div>
              )}
              
              {file && !isLoading && (
                <button
                  onClick={handleUpload}
                  className="btn-primary mt-6 w-full transform hover:scale-105 transition-transform duration-200"
                >
                  Upload & Analyze
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="pt-24 pb-12 px-6 animate-fadeInUp">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold">Churn Analysis Results</h1>
              </div>
              
              <div className="flex space-x-1 mb-8 glass rounded-2xl p-2 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
                        activeTab === tab.id
                          ? `${theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'}`
                          : 'hover:bg-opacity-50 hover:bg-gray-500'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
              
              <div className="glass rounded-2xl p-6 min-h-[500px]">
                {renderTabContent()}
              </div>
              
              <ChatOverlay theme={theme} showAnalysis={showAnalysis} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
