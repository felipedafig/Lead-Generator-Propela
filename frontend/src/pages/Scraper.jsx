import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Zap, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import Sidebar from '../components/Sidebar'

const CITIES = ['Miami', 'New York', 'Los Angeles', 'Chicago', 'Houston']
const INDUSTRIES = ['hotel', 'property manager']

export default function Scraper() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [formData, setFormData] = useState({
    city: '',
    industry: '',
    min_reviews: 3
  })

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
    if (!formData.city || !formData.industry) {
      alert('Por favor, preencha todos os campos')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/scraping/tasks', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setFormData({ city: '', industry: '', min_reviews: 3 })
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
              Web Scraper
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 max-w-6xl">
          {/* Form Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
            <h2 className="text-xl font-bold mb-6">Iniciar Nova Coleta</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Cidade
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                    className="input-propela"
                  >
                    <option value="">Selecione uma cidade</option>
                    {CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Setor
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    required
                    className="input-propela"
                  >
                    <option value="">Selecione um setor</option>
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>
                        {ind === 'property manager' ? 'Gerenciador de Propriedades' : 'Hotel'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Avaliação Mínima
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
                disabled={loading}
                className="btn-propela disabled:opacity-50 flex items-center gap-2"
              >
                <Zap size={20} />
                {loading ? 'Iniciando...' : 'Iniciar Coleta'}
              </button>
            </form>
          </div>

          {/* Tasks List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Histórico de Coletas</h2>
              <p className="text-sm text-gray-600 mt-1">
                {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}
              </p>
            </div>

            {tasks.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>Nenhuma coleta iniciada ainda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-propela">
                  <thead>
                    <tr>
                      <th>Cidade</th>
                      <th>Setor</th>
                      <th>Status</th>
                      <th>Leads Encontrados</th>
                      <th>Iniciado em</th>
                      <th>Concluído em</th>
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
              <h3 className="font-bold mb-3">ℹ️ Como funciona</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>1. Selecione a cidade e o setor desejado</li>
                <li>2. Configure a avaliação mínima (opcional)</li>
                <li>3. Clique em "Iniciar Coleta"</li>
                <li>4. Os dados serão coletados automaticamente</li>
                <li>5. Acompanhe o progresso em tempo real</li>
              </ul>
            </div>

            <div className="card-propela">
              <h3 className="font-bold mb-3">🎯 Fontes de Dados</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Google Maps API</li>
                <li>✓ Web scraping de diretórios públicos</li>
                <li>✓ Bases de dados de negócios</li>
                <li>✓ Redes sociais e plataformas públicas</li>
                <li>✓ Atualização contínua de informações</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
