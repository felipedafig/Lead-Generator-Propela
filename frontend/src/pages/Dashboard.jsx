import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { LogOut, Menu, X, TrendingUp, Users, Target } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/leads/stats/summary', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-black"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-2xl font-bold text-black">Dashboard</h1>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-600">
                Welcome, <strong>{user?.name || 'User'}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black transition"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-gray-500">Loading data...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <StatCard
                  title="Total Leads"
                  value={Number(stats?.total_leads) || 0}
                  icon={<Users size={24} />}
                  color="bg-blue-100"
                />
                <StatCard
                  title="Contacted"
                  value={Number(stats?.contacted) || 0}
                  icon={<Target size={24} />}
                  color="bg-green-100"
                />
                <StatCard
                  title="Average Rating"
                  value={Number(stats?.avg_reviews) ? Number(stats.avg_reviews).toFixed(1) : 0}
                  icon={<TrendingUp size={24} />}
                  color="bg-purple-100"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="card-propela">
                  <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/scraper')}
                      className="w-full btn-propela text-left"
                    >
                      ➕ Start New Search
                    </button>
                    <button
                      onClick={() => navigate('/leads')}
                      className="w-full btn-propela-secondary text-left"
                    >
                      📊 View Leads
                    </button>
                  </div>
                </div>

                <div className="card-propela">
                  <h3 className="text-lg font-bold mb-4">Account Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Plan:</strong> Professional</p>
                    <p><strong>Available Credits:</strong> Unlimited</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
