import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Download, Trash2, Edit2, Plus, ExternalLink, Trash } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useLeadType } from '../contexts/LeadTypeContext'

export default function Leads() {
  const { leadType, info, theme } = useLeadType()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('')
  const [status, setStatus] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [newLead, setNewLead] = useState({
    company_name: '',
    owner_name: '',
    phone_number: '',
    email: '',
    website_url: '',
    address: '',
    city: '',
    industry: '',
    review_count: 0,
    rating: 0,
    notes: ''
  })

  useEffect(() => {
    setIndustry('')
    setSelectedRows(new Set())
    setLeads([])
    setLoading(true)
  }, [leadType])

  useEffect(() => {
    fetchLeads()
  }, [search, industry, status, leadType])

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (industry) params.append('industry', industry)
      if (status) params.append('status', status)

      const response = await axios.get(`/api/leads?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Ensure boolean values are properly typed
      const leadsWithBooleans = response.data.map(lead => ({
        ...lead,
        email_sent: !!lead.email_sent,
        called: !!lead.called
      }))

      setLeads(leadsWithBooleans)
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLead = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/leads', newLead, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNewLead({
        company_name: '',
        owner_name: '',
        phone_number: '',
        email: '',
        website_url: '',
        address: '',
        city: '',
        industry: '',
        review_count: 0,
        rating: 0,
        notes: ''
      })
      setShowForm(false)
      fetchLeads()
    } catch (error) {
      console.error('Error adding lead:', error)
    }
  }

  const handleUpdate = async (id, updates = null) => {
    try {
      const token = localStorage.getItem('token')
      const dataToUpdate = updates || editForm

      // Update local state immediately for better UX
      if (updates) {
        const processedUpdates = {
          ...updates,
          email_sent: updates.email_sent !== undefined ? !!updates.email_sent : undefined,
          called: updates.called !== undefined ? !!updates.called : undefined
        }

        setLeads(leads.map(lead =>
          lead.id === id ? { ...lead, ...processedUpdates } : lead
        ))
      }

      const response = await axios.put(`/api/leads/${id}`, dataToUpdate, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (updates && response.data) {
        setLeads(leads.map(lead =>
          lead.id === id ? {
            ...lead,
            ...response.data,
            email_sent: !!response.data.email_sent,
            called: !!response.data.called
          } : lead
        ))
      }

      if (!updates) {
        setEditingId(null)
        fetchLeads()
      }
    } catch (error) {
      console.error('Error updating lead:', error)
      fetchLeads() // Revert on error
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
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
  }

  const handleToggleRow = (id) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(leads.map(l => l.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return

    const confirmMessage = `Are you sure you want to delete ${selectedRows.size} lead(s)? This cannot be undone.`
    if (!window.confirm(confirmMessage)) return

    try {
      const token = localStorage.getItem('token')

      // Delete all selected rows
      await Promise.all(
        Array.from(selectedRows).map(id =>
          axios.delete(`/api/leads/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      )

      setSelectedRows(new Set())
      fetchLeads()
    } catch (error) {
      console.error('Error bulk deleting leads:', error)
      alert('Failed to delete some leads')
    }
  }

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (industry) params.append('industry', industry)

      const response = await axios.get(`/api/leads/export/xlsx?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'propela-leads.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentElement.removeChild(link)
    } catch (error) {
      console.error('Error exporting leads:', error)
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
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200">
          <div className={`h-1 ${theme.headerBar}`} />
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-black">My Leads</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${theme.badge}`}>
              {info.fullLabel}
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Filters and Actions */}
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
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
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-propela"
              >
                <option value="">All statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={handleExport} className="flex items-center gap-2 btn-propela">
                <Download size={20} />
                Export XLSX
              </button>
              <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 btn-propela-secondary">
                <Plus size={20} />
                Add Lead
              </button>
              {selectedRows.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Trash size={20} />
                  Delete {selectedRows.size} Lead{selectedRows.size !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>

          {/* Add Lead Form */}
          {showForm && (
            <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-4">New Lead</h3>
              <form onSubmit={handleAddLead}>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={newLead.company_name}
                    onChange={(e) => setNewLead({...newLead, company_name: e.target.value})}
                    required
                    className="input-propela"
                  />
                  <input
                    type="text"
                    placeholder="Owner Name"
                    value={newLead.owner_name}
                    onChange={(e) => setNewLead({...newLead, owner_name: e.target.value})}
                    className="input-propela"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={newLead.phone_number}
                    onChange={(e) => setNewLead({...newLead, phone_number: e.target.value})}
                    className="input-propela"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    className="input-propela"
                  />
                  <input
                    type="url"
                    placeholder="Website (https://...)"
                    value={newLead.website_url}
                    onChange={(e) => setNewLead({...newLead, website_url: e.target.value})}
                    className="input-propela"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={newLead.city}
                    onChange={(e) => setNewLead({...newLead, city: e.target.value})}
                    className="input-propela"
                  />
                  <select
                    value={newLead.industry}
                    onChange={(e) => setNewLead({...newLead, industry: e.target.value})}
                    className="input-propela"
                  >
                    <option value="">Select industry</option>
                    {info.industries.map(i => (
                      <option key={i.value} value={i.value}>{i.label}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  placeholder="Notes"
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  className="input-propela mt-4 resize-none h-24"
                />
                <div className="flex gap-3 mt-4">
                  <button type="submit" className="btn-propela">Save Lead</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-propela-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Leads Table */}
          {loading ? (
            <div className="text-center py-20">
              <p className="text-gray-500">Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500 text-lg">No leads found</p>
              <button onClick={() => setShowForm(!showForm)} className="btn-propela mt-4">
                Add your first lead
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="table-propela">
                  <thead>
                    <tr>
                      <th className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedRows.size === leads.length && leads.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded"
                        />
                      </th>
                      <th>Company</th>
                      <th>Owner</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Website</th>
                      <th>City</th>
                      <th>Status</th>
                      <th>Email Sent</th>
                      <th>Called</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className={selectedRows.has(lead.id) ? 'bg-blue-50' : ''}>
                        <td className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(lead.id)}
                            onChange={() => handleToggleRow(lead.id)}
                            className="w-4 h-4 rounded"
                          />
                        </td>
                        <td className="font-semibold">{lead.company_name}</td>
                        <td>{lead.owner_name || '-'}</td>
                        <td className="whitespace-nowrap">
                          {lead.phone_number ? (
                            <a href={`tel:${lead.phone_number}`} className="text-blue-600 hover:text-blue-800">
                              {lead.phone_number}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-sm">
                          {lead.email ? (
                            <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800">
                              {lead.email}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="whitespace-nowrap">
                          {lead.website_url ? (
                            <a
                              href={lead.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            >
                              Visit <ExternalLink size={14} />
                            </a>
                          ) : (
                            '-'
                          )}
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
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingId(lead.id)
                                setEditForm({...lead})
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(lead.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
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

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Lead</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Status"
                value={editForm.status || ''}
                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                className="input-propela"
              />
              <textarea
                placeholder="Notes"
                value={editForm.notes || ''}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                className="input-propela col-span-2 resize-none h-24"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => handleUpdate(editingId)} className="btn-propela">Save</button>
              <button onClick={() => setEditingId(null)} className="btn-propela-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
