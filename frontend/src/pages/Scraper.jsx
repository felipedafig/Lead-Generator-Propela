import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Zap, CheckCircle, AlertCircle, Loader } from 'lucide-react'
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

export default function Scraper() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [formData, setFormData] = useState({
    country: '',
    city: '',
    industry: '',
    min_reviews: 3
  })

  const availableCities = formData.country ? COUNTRIES_CITIES[formData.country] : []

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/scraping/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTasks(response.data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.country || !formData.city || !formData.industry) {
      alert('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/scraping/tasks', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setFormData({ country: '', city: '', industry: '', min_reviews: 3 })
      fetchTasks()
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Erro ao criar tarefa de scraping')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-600" size={20} />
      case 'processing':
        return <Loader className="text-blue-600 animate-spin" size={20} />
      case 'failed':
        return <AlertCircle className="text-red-600" size={20} />
      default:
        return <AlertCircle className="text-yellow-600" size={20} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
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
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 max-w-6xl">
          {/* Form Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
            <h2 className="text-xl font-bold mb-6">Start New Search</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Country
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
                    City
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
                    Industry
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
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
                    Minimum Reviews
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.min_reviews}
                    onChange={(e) => setFormData({...formData, min_reviews: parseInt(e.target.value)})}
                    className="input-propela"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.country || !formData.city}
                className="btn-propela disabled:opacity-50 flex items-center gap-2"
              >
                <Zap size={20} />
                {loading ? 'Starting...' : 'Start Scraping'}
              </button>
            </form>
          </div>

          {/* Tasks List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Search History</h2>
              <p className="text-sm text-gray-600 mt-1">
                {tasks.length} search{tasks.length !== 1 ? 'es' : ''}
              </p>
            </div>

            {tasks.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No searches started yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-propela">
                  <thead>
                    <tr>
                      <th>City</th>
                      <th>Industry</th>
                      <th>Status</th>
                      <th>Leads Found</th>
                      <th>Started</th>
                      <th>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id}>
                        <td className="font-semibold">{task.city}</td>
                        <td>{task.industry}</td>
                        <td>
                          <span className={`badge ${getStatusColor(task.status)} flex items-center gap-2 w-fit`}>
                            {getStatusIcon(task.status)}
                            {task.status}
                          </span>
                        </td>
                        <td className="font-semibold text-green-600">{task.total_leads}</td>
                        <td className="text-sm text-gray-600">
                          {new Date(task.created_at).toLocaleDateString('pt-BR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="text-sm text-gray-600">
                          {task.completed_at
                            ? new Date(task.completed_at).toLocaleDateString('pt-BR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                            : '-'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="card-propela">
              <h3 className="font-bold mb-3">ℹ️ How It Works</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>1. Select a country from the dropdown</li>
                <li>2. Choose your target city</li>
                <li>3. Select the industry (Hotel or Property Manager)</li>
                <li>4. Set minimum review count (optional)</li>
                <li>5. Click "Start Scraping" and monitor progress</li>
              </ul>
            </div>

            <div className="card-propela">
              <h3 className="font-bold mb-3">🎯 Data Sources</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Google Maps API</li>
                <li>✓ Business directories scraping</li>
                <li>✓ Public business databases</li>
                <li>✓ Social networks & public platforms</li>
                <li>✓ Continuous data enrichment</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
