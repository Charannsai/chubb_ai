import { useState, useEffect } from 'react'
import { Upload, FileText } from 'lucide-react'
import DashboardNavbar from '../components/layout/DashboardNavbar'

const DashboardPage = () => {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.body.className = savedTheme
  }, [])

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
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
    }
  }

  const handleUpload = () => {
    if (file) {
      console.log('Uploading file:', file.name)
    }
  }

  return (
    <div className="min-h-screen flex">
      <DashboardNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 pt-20 flex items-center justify-center min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="text-center max-w-md w-full px-6 animate-fadeInUp">
          <h1 className="text-2xl font-semibold mb-6">
            Upload Data
          </h1>
          
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
          
          {file && (
            <button
              onClick={handleUpload}
              className="btn-primary mt-6 w-full transform hover:scale-105 transition-transform duration-200"
            >
              Upload & Analyze
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage