import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BarChart3, Search, Settings } from 'lucide-react'

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative w-64 h-screen bg-black text-white p-6 transition-transform duration-200 z-30 lg:z-0`}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Propela</h1>
          <p className="text-gray-400 text-sm">Lead Generation</p>
        </div>

        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/dashboard')
                ? 'bg-white text-black'
                : 'text-gray-300 hover:text-white hover:bg-gray-900'
            }`}
          >
            <BarChart3 size={20} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/leads"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/leads')
                ? 'bg-white text-black'
                : 'text-gray-300 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Search size={20} />
            <span>My Leads</span>
          </Link>

          <Link
            to="/scraper"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/scraper')
                ? 'bg-white text-black'
                : 'text-gray-300 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Search size={20} />
            <span>Lead Discovery</span>
          </Link>

          <Link
            to="/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/settings')
                ? 'bg-white text-black'
                : 'text-gray-300 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-2">Versão</p>
            <p className="text-lg font-bold text-white">1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
