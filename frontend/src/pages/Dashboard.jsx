import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Activity, Mail, Phone, LogOut } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import { useLeadType } from '../contexts/LeadTypeContext'

const STATUS_COLORS = {
  new: '#9ca3af',
  contacted: '#3b82f6',
  qualified: '#10b981',
  closed: '#6366f1'
}

export default function Dashboard() {
  const { leadType, info, theme } = useLeadType()
  const [user, setUser] = useState(null)
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) setUser(JSON.parse(storedUser))
  }, [])

  useEffect(() => {
    setLoading(true)
    setLeads([])
    fetchLeads()
  }, [leadType])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/leads', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLeads(response.data || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

  const { totalLeads, totalEmails, totalCalls, statusData, emailsData, callsData } = useMemo(() => {
    const statusCounts = {}
    const emailsByDate = {}
    const callsByDate = {}
    let emails = 0
    let calls = 0

    for (const lead of leads) {
      const status = lead.status || 'new'
      statusCounts[status] = (statusCounts[status] || 0) + 1

      if (lead.email_sent) {
        emails++
        if (lead.email_sent_date) {
          emailsByDate[lead.email_sent_date] = (emailsByDate[lead.email_sent_date] || 0) + 1
        }
      }
      if (lead.called) {
        calls++
        if (lead.called_date) {
          callsByDate[lead.called_date] = (callsByDate[lead.called_date] || 0) + 1
        }
      }
    }

    const sortByDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)

    return {
      totalLeads: leads.length,
      totalEmails: emails,
      totalCalls: calls,
      statusData: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      emailsData: Object.entries(emailsByDate).map(([date, count]) => ({ date, count })).sort(sortByDate),
      callsData: Object.entries(callsByDate).map(([date, count]) => ({ date, count })).sort(sortByDate)
    }
  }, [leads])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200">
          <div className={`h-1 ${theme.headerBar}`} />
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-black">Dashboard</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${theme.badge}`}>
                {info.fullLabel}
              </span>
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
                  value={totalLeads}
                  icon={<Activity size={24} />}
                  color="bg-blue-100"
                />
                <StatCard
                  title="Emails Sent"
                  value={totalEmails}
                  icon={<Mail size={24} />}
                  color="bg-green-100"
                />
                <StatCard
                  title="Calls Made"
                  value={totalCalls}
                  icon={<Phone size={24} />}
                  color="bg-purple-100"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-bold mb-4">Status Distribution</h3>
                  {statusData.length === 0 ? (
                    <p className="text-gray-500 text-center py-12">No leads yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={(entry) => `${entry.status}: ${entry.count}`}
                        >
                          {statusData.map((entry, idx) => (
                            <Cell key={idx} fill={STATUS_COLORS[entry.status] || '#9ca3af'} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-bold mb-4">Emails Sent Over Time</h3>
                  {emailsData.length === 0 ? (
                    <p className="text-gray-500 text-center py-12">No emails sent yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={emailsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold mb-4">Calls Made Over Time</h3>
                {callsData.length === 0 ? (
                  <p className="text-gray-500 text-center py-12">No calls logged yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={callsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
