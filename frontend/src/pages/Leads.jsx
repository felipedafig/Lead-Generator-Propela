import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Download, Trash2, Edit2, Plus } from 'lucide-react'
import Sidebar from '../components/Sidebar'

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('')
  const [status, setStatus] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [newLead, setNewLead] = useState({
    company_name: '',
    owner_name: '',
    phone_number: '',
    email: '',
    address: '',
    city: '',
    industry: '',
    review_count: 0,
    rating: 0,
    notes: ''
  })

  useEffect(() => {
    fetchLeads()
  }, [search, industry, status])

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
      setLeads(response.data)
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

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/leads/${id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEditingId(null)
      fetchLeads()
    } catch (error) {
      console.error('Error updating lead:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este lead?')) {
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
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-black">My Leads</h1>
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
                <option value="hotel">Hotel</option>
                <option value="property manager">Property Manager</option>
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
                    <option value="hotel">Hotel</option>
                    <option value="property manager">Property Manager</option>
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
                      <th>Company</th>
                      <th>Owner</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>City</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id}>
                        <td className="font-semibold">{lead.company_name}</td>
                        <td>{lead.owner_name || '-'}</td>
                        <td>{lead.phone_number || '-'}</td>
                        <td className="text-sm">{lead.email || '-'}</td>
                        <td>{lead.city || '-'}</td>
                        <td>
                          <span className={getStatusBadge(lead.status)}>{lead.status}</span>
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
