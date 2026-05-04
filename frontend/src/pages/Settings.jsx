import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Settings as SettingsIcon, Save, Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import Sidebar from '../components/Sidebar'

export default function Settings() {
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [apiKey, setApiKey] = useState('')
  const [notificationEmail, setNotificationEmail] = useState('')
  const [saved, setSaved] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState(null)
  const [leadType, setLeadType] = useState('hotels')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setNotificationEmail(JSON.parse(storedUser).email)
    }

    const storedApiKey = localStorage.getItem('apiKey')
    if (storedApiKey) {
      setApiKey(storedApiKey)
    }

    const storedLeadType = localStorage.getItem('leadType')
    if (storedLeadType) {
      setLeadType(storedLeadType)
    }
  }, [])

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setUploadedFiles(prev => [...prev, { name: file.name, file }])
        setImportError(null)
      } else {
        setImportError('Only CSV files are allowed')
      }
    })
    e.target.value = ''
  }

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const leads = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length < 2) continue

      const lead = {}
      headers.forEach((header, idx) => {
        if (values[idx]) {
          lead[header] = values[idx]
        }
      })
      leads.push(lead)
    }

    return leads
  }

  const handleSaveSettings = async () => {
    setImporting(true)
    setImportError(null)

    try {
      // Save basic settings
      if (apiKey) {
        localStorage.setItem('apiKey', apiKey)
      }
      if (notificationEmail) {
        const updated = {...user, email: notificationEmail}
        localStorage.setItem('user', JSON.stringify(updated))
        setUser(updated)
      }

      // Save lead type preference
      localStorage.setItem('leadType', leadType)

      // Import leads from uploaded files
      if (uploadedFiles.length > 0) {
        const token = localStorage.getItem('token')
        let totalImported = 0
        let totalSkipped = 0

        for (const fileObj of uploadedFiles) {
          const fileContent = await fileObj.file.text()
          const leadsData = parseCSV(fileContent)

          const response = await axios.post('/api/leads/import', leadsData, {
            headers: { Authorization: `Bearer ${token}` }
          })

          totalImported += response.data.imported || 0
          totalSkipped += response.data.skipped || 0
        }

        setUploadedFiles([])
        setSaved(true)
        setTimeout(() => {
          setSaved(false)
        }, 3000)

        alert(`Import complete!\nImported: ${totalImported}\nSkipped: ${totalSkipped}`)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setImportError(error.response?.data?.error || error.message || 'Failed to import leads')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-black flex items-center gap-2">
              <SettingsIcon size={28} />
              Settings
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 max-w-4xl">
          {saved && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800">
              ✓ Settings saved successfully!
            </div>
          )}

          {/* Account Settings */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <h2 className="text-xl font-bold mb-6">Account</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="input-propela bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">This field cannot be edited</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-propela bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">To change your email, please contact support</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Current Plan
                </label>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-bold text-blue-900">Professional</p>
                  <p className="text-sm text-blue-800">Unlimited access to all features</p>
                </div>
              </div>
            </div>
          </div>

          {/* API Configuration */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <h2 className="text-xl font-bold mb-6">API Integration</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Google Maps API Key (Optional)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="input-propela"
                />
                <p className="text-xs text-gray-500 mt-2">
                  If you provide your own key, we'll use it for more efficient scraping.
                  <a href="https://developers.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"> Get API key</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Notification Email
                </label>
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  className="input-propela"
                />
                <p className="text-xs text-gray-500 mt-1">Receive notifications when searches are completed</p>
              </div>
            </div>
          </div>

          {/* Lead Type Selection */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <h2 className="text-xl font-bold mb-6">Lead Type</h2>
            <p className="text-sm text-gray-600 mb-4">
              Choose the type of leads to generate or manage
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setLeadType('hotels')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  leadType === 'hotels'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Hotels & Property Managers
              </button>
              <button
                onClick={() => setLeadType('website-design')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  leadType === 'website-design'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Website Design Leads
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Current: <span className="font-semibold">{leadType === 'hotels' ? 'Hotels & Property Managers' : 'Website Design Leads'}</span>
            </p>
          </div>

          {/* Import Leads */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <h2 className="text-xl font-bold mb-6">Import Leads</h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload CSV files containing lead data. Files will be imported into the database when you click Save Settings.
            </p>

            {importError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-700">{importError}</span>
              </div>
            )}

            {/* File Upload Area */}
            <div className="mb-6">
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                  <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-600">CSV files only</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Files to import ({uploadedFiles.length}):</p>
                <div className="space-y-2">
                  {uploadedFiles.map((fileObj, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle size={18} className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">{fileObj.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-8">
            <button
              onClick={handleSaveSettings}
              disabled={importing}
              className="flex items-center gap-2 btn-propela disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Saving & Importing...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
