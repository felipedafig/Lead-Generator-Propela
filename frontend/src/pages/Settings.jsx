import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save } from 'lucide-react'
import Sidebar from '../components/Sidebar'

export default function Settings() {
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [apiKey, setApiKey] = useState('')
  const [notificationEmail, setNotificationEmail] = useState('')
  const [saved, setSaved] = useState(false)

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
  }, [])

  const handleSaveSettings = () => {
    if (apiKey) {
      localStorage.setItem('apiKey', apiKey)
    }
    if (notificationEmail) {
      const updated = {...user, email: notificationEmail}
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
              Configurações
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 max-w-4xl">
          {saved && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800">
              ✓ Configurações salvas com sucesso!
            </div>
          )}

          {/* Account Settings */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <h2 className="text-xl font-bold mb-6">Conta</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="input-propela bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Este campo não pode ser editado</p>
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
                <p className="text-xs text-gray-500 mt-1">Para mudar seu email, entre em contato com o suporte</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Plano Atual
                </label>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-bold text-blue-900">Profissional</p>
                  <p className="text-sm text-blue-800">Acesso ilimitado a todas as features</p>
                </div>
              </div>
            </div>
          </div>

          {/* API Configuration */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <h2 className="text-xl font-bold mb-6">Integração com APIs</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Google Maps API Key (Opcional)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="input-propela"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Se você fornecer sua própria chave, usaremos ela para scraping mais eficiente.
                  <a href="https://developers.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"> Obter chave</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email de Notificações
                </label>
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  className="input-propela"
                />
                <p className="text-xs text-gray-500 mt-1">Receba notificações quando as coletas forem concluídas</p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <h2 className="text-xl font-bold mb-6">Notificações</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-black">Notificar quando uma coleta for concluída</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-black">Relatório semanal de leads</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-black">Novidades e atualizações do Propela</span>
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg p-6 border border-red-200 bg-red-50">
            <h2 className="text-xl font-bold mb-4 text-red-900">Zona de Perigo</h2>
            <div className="space-y-4">
              <button className="w-full btn-propela-secondary border-red-300 text-red-600 hover:bg-red-100">
                Deletar minha conta permanentemente
              </button>
              <p className="text-xs text-red-600">
                Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8">
            <button onClick={handleSaveSettings} className="flex items-center gap-2 btn-propela">
              <Save size={20} />
              Salvar Configurações
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
