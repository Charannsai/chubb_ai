const TabNavigation = ({ tabs, activeTab, setActiveTab, theme }) => {
  return (
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
  )
}

export default TabNavigation

