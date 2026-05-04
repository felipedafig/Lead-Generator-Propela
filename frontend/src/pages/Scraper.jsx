import React, { useState } from 'react'
import axios from 'axios'
import { Zap, AlertCircle, Loader, Star, Phone, Mail, MapPin } from 'lucide-react'
import Sidebar from '../components/Sidebar'

const COUNTRIES_CITIES = {
  'united-states': ['Miami, Florida', 'Orlando, Florida', 'San Antonio, Texas', 'Los Angeles, California', 'El Paso, Texas'],
  'spain': ['Madrid', 'Barcelona', 'Málaga'],
  'mexico': ['Cancún / Playa del Carmen', 'Mexico City'],
  'netherlands': ['Amsterdam', 'Rotterdam', 'Utrecht'],
  'denmark': ['Copenhagen', 'Aarhus'],
  'brazil': ['São Paulo', 'Rio de Janeiro', 'Florianópolis', 'Gramado', 'Balneário Camboriú']
}

const COUNTRY_NAMES = {
  'united-states': 'United States',
  'spain': 'Spain',
  'mexico': 'Mexico',
  'netherlands': 'Netherlands',
  'denmark': 'Denmark',
  'brazil': 'Brazil'
}

const INDUSTRIES = ['hotel', 'property manager']

const COMPANY_SIZE_TIERS = {
  hotel: [
    { value: 'micro', label: 'Micro (1-10 employees)', min: 1, max: 10 },
    { value: 'boutique-small', label: 'Boutique-Small (11-50 employees)', min: 11, max: 50 },
    { value: 'boutique-mid', label: 'Boutique Mid (51-200 employees)', min: 51, max: 200 },
    { value: 'mid-chain', label: 'Mid-Chain (200-500 employees)', min: 200, max: 500 }
  ],
  'property manager': [
    { value: 'solo', label: 'Solo Property Manager (1 property)', min: 1, max: 1 },
    { value: 'small-portfolio', label: 'Small Portfolio (2-10 properties)', min: 2, max: 10 },
    { value: 'large-portfolio', label: 'Large Portfolio (10+ properties)', min: 10, max: 500 }
  ]
}

export default function Scraper() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [lastSearch, setLastSearch] = useState(null)
  const [formData, setFormData] = useState({
    country: '',
    city: '',
    industry: '',
    companySize: ''
  })

  const availableCities = formData.country ? COUNTRIES_CITIES[formData.country] : []
  const availableSizes = formData.industry ? COMPANY_SIZE_TIERS[formData.industry] : []

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.country || !formData.city || !formData.industry) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const countryName = COUNTRY_NAMES[formData.country]

      const params = {
        city: formData.city,
        country: countryName,
        industry: formData.industry
      }

      // Add company size filter if selected
      if (formData.companySize) {
        const selectedTier = availableSizes.find(t => t.value === formData.companySize)
        if (selectedTier) {
          params.company_size = formData.companySize
        }
      }

      // Query database leads by city/country/industry/company_size
      const response = await axios.get('/api/leads', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      })

      setResults({
        success: true,
        results: response.data,
        totalFound: response.data.length,
        cached: false,
        source: 'database'
      })
      setLastSearch({
        country: countryName,
        city: formData.city,
        industry: formData.industry,
        companySize: formData.companySize,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Error searching leads:', error)
      setError(error.response?.data?.error || 'No leads found for this search.')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateLead = async (leadId, updates) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/leads/${leadId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Refresh results
      if (lastSearch) {
        const e = { preventDefault: () => {} }
        await handleSubmit.call({ ...e })
      }
      alert('Lead updated successfully!')
    } catch (error) {
      console.error('Error updating lead:', error)
      alert('Failed to update lead')
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
              <Zap size={28} />
              Lead Discovery
            </h1>
            <p className="text-sm text-gray-600 mt-1">Powered by Vibe Prospecting</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 max-w-7xl">
          {/* Form Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
            <h2 className="text-xl font-bold mb-6">Find Quality Leads</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value, city: ''})}
                    required
                    className="input-propela"
                  >
                    <option value="">Select a country</option>
                    {Object.entries(COUNTRY_NAMES).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                    disabled={!formData.country}
                    className="input-propela disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a city</option>
                    {availableCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Industry *
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value, companySize: ''})}
                    required
                    className="input-propela"
                  >
                    <option value="">Select an industry</option>
                    <option value="hotel">Hotel</option>
                    <option value="property manager">Property Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {formData.industry === 'hotel' ? 'Hotel Size' : 'Management Type'}
                  </label>
                  <select
                    value={formData.companySize}
                    onChange={(e) => setFormData({...formData, companySize: e.target.value})}
                    disabled={!formData.industry}
                    className="input-propela disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {formData.industry ? 'Select a tier (optional)' : 'Choose industry first'}
                    </option>
                    {availableSizes.map(tier => (
                      <option key={tier.value} value={tier.value}>{tier.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !formData.country || !formData.city || !formData.industry}
                className="btn-propela disabled:opacity-50 flex items-center gap-2 px-6 py-2"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    Search Now
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Section */}
          {results && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Found</p>
                    <p className="text-2xl font-bold text-blue-600">{results.totalFound}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Source</p>
                    <p className="text-sm font-semibold text-blue-600">Database</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-sm font-semibold text-blue-600">
                      {new Date(results.results[0]?.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Industry</p>
                    <p className="text-sm font-semibold text-blue-600 capitalize">{lastSearch?.industry}</p>
                  </div>
                </div>
              </div>

              {/* Prospects List */}
              <div className="space-y-3">
                {results.results.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
                    <AlertCircle size={32} className="text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No leads found for this search</p>
                  </div>
                ) : (
                  results.results.map((prospect) => (
                    <div key={prospect.id} className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-5">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">{prospect.company_name}</h3>
                              <p className="text-sm text-gray-600">{prospect.owner_name}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              prospect.status === 'contacted' ? 'bg-green-100 text-green-800' :
                              prospect.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {prospect.status || 'new'}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-4 mt-3 text-sm">
                            {prospect.email && (
                              <a href={`mailto:${prospect.email}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                                <Mail size={16} />
                                {prospect.email}
                              </a>
                            )}
                            {prospect.phone_number && (
                              <a href={`tel:${prospect.phone_number}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                                <Phone size={16} />
                                {prospect.phone_number}
                              </a>
                            )}
                            {prospect.city && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin size={16} />
                                {prospect.city}, {prospect.country}
                              </div>
                            )}
                            {prospect.review_count > 0 && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Star size={16} />
                                {prospect.rating ? `${prospect.rating}/5` : 'N/A'} ({prospect.review_count} reviews)
                              </div>
                            )}
                          </div>

                          {prospect.notes && (
                            <p className="text-sm text-gray-600 mt-2">📝 {prospect.notes}</p>
                          )}
                        </div>

                        <div className="flex-shrink-0 flex gap-2">
                          <button
                            onClick={() => handleUpdateLead(prospect.id, { status: prospect.status === 'contacted' ? 'new' : 'contacted' })}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            {prospect.status === 'contacted' ? 'Undo' : 'Mark Contacted'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
