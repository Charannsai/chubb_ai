import { Upload, FileText, AlertCircle } from 'lucide-react'

const FileUploadSection = ({ 
  file, 
  error, 
  isLoading, 
  dragActive, 
  theme,
  handleDrag,
  handleDrop,
  handleFileChange,
  handleUpload,
  uploadComplete 
}) => {
  return (
    <div className={`flex items-center justify-center min-h-screen transition-all duration-700 ${
      uploadComplete ? 'transform scale-75 translate-y-[-20vh]' : ''
    }`}>
      <div className="text-center max-w-md w-full px-6 animate-fadeInUp">
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
  )
}

export default FileUploadSection

