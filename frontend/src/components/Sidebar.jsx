import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BarChart3, Search, Settings, X } from 'lucide-react'

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
        } fixed lg:relative w-64 h-screen bg-black text-white transition-transform duration-200 z-30 lg:z-0 flex flex-col`}
      >
        {/* Logo Section */}
        <div className="px-6 py-1 flex justify-center relative">
          <Link to="/dashboard" className="flex justify-center">
            <img
              src="/assets/logo-icon-black.png"
              alt="Propela"
              className="h-55 w-auto object-contain filter invert leading-none"
              title="Propela - Lead Generation Platform"
            />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden absolute right-6 text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-2 flex-1 px-6 -mt-2">
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

        <div className="mt-auto pt-6 border-t border-gray-800">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-2">Version</p>
            <p className="text-base font-bold text-white">1.0.0</p>
            <p className="text-xs text-gray-500 mt-2">Lead Generation Platform</p>
          </div>
        </div>
      </aside>
    </>
  )
}
