import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Trash2, ExternalLink, Activity } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useLeadType } from '../contexts/LeadTypeContext'

export default function Tracker() {
  const { leadType, info, theme } = useLeadType()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('')

  useEffect(() => {
    setIndustry('')
  }, [leadType])

  useEffect(() => {
    fetchLeads()
  }, [search, industry, leadType])

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      params.append('tracking', 'true')
      if (search) params.append('search', search)
      if (industry) params.append('industry', industry)

      const response = await axios.get(`/api/leads?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const leadsWithBooleans = response.data.map(lead => ({
        ...lead,
        email_sent: !!lead.email_sent,
        called: !!lead.called
      }))

      setLeads(leadsWithBooleans)
    } catch (error) {
      console.error('Error fetching tracker leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id, updates) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/leads/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchLeads()
    } catch (error) {
      console.error('Error updating lead:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchLeads()
    } catch (error) {
      console.error('Error deleting lead:', error)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'new': 'badge badge-new',
      'contacted': 'badge badge-contacted',
      'qualified': 'badge badge-qualified',
      'closed': 'badge badge-closed'
    }
    return badges[status] || 'badge badge-new'
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200">
          <div className={`h-1 ${theme.headerBar}`} />
          <div className="px-6 py-4 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-black flex items-center gap-2">
                <Activity size={28} />
                Tracker
              </h1>
              <p className="text-sm text-gray-600 mt-1">Leads you've contacted by email or phone</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${theme.badge}`}>
              {info.fullLabel}
            </span>
          </div>
        </header>

        <main className="p-6">
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search by company, phone, or owner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-propela"
              />
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="input-propela"
              >
                <option value="">All industries</option>
                {info.industries.map(i => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500 text-lg">No tracked leads yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Mark a lead as "Email Sent" or "Called" in My Leads to see it here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="table-propela">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Owner</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>City</th>
                      <th>Status</th>
                      <th>Email Sent</th>
                      <th>Called</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id}>
                        <td className="font-semibold">{lead.company_name}</td>
                        <td>{lead.owner_name || '-'}</td>
                        <td className="whitespace-nowrap">
                          {lead.phone_number ? (
                            <a href={`tel:${lead.phone_number}`} className="text-blue-600 hover:text-blue-800">
                              {lead.phone_number}
                            </a>
                          ) : '-'}
                        </td>
                        <td className="text-sm">
                          {lead.email ? (
                            <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800">
                              {lead.email}
                            </a>
                          ) : '-'}
                        </td>
                        <td>{lead.city || '-'}</td>
                        <td>
                          <select
                            value={lead.status || 'new'}
                            onChange={(e) => handleUpdate(lead.id, { status: e.target.value })}
                            className={`${getStatusBadge(lead.status)} cursor-pointer border-0`}
                          >
                            <option value="new">new</option>
                            <option value="contacted">contacted</option>
                            <option value="qualified">qualified</option>
                            <option value="closed">closed</option>
                          </select>
                        </td>
                        <td className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!!lead.email_sent}
                              onChange={(e) => {
                                const checked = e.target.checked
                                handleUpdate(lead.id, {
                                  email_sent: checked,
                                  email_sent_date: checked ? new Date().toISOString().split('T')[0] : null
                                })
                              }}
                              className="w-4 h-4 rounded cursor-pointer"
                            />
                            {lead.email_sent && lead.email_sent_date && (
                              <span className="text-xs text-gray-600">{lead.email_sent_date}</span>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!!lead.called}
                              onChange={(e) => {
                                const checked = e.target.checked
                                handleUpdate(lead.id, {
                                  called: checked,
                                  called_date: checked ? new Date().toISOString().split('T')[0] : null
                                })
                              }}
                              className="w-4 h-4 rounded cursor-pointer"
                            />
                            {lead.called && lead.called_date && (
                              <span className="text-xs text-gray-600">{lead.called_date}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
