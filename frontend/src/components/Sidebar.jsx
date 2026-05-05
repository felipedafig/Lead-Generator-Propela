import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BarChart3, Search, Settings, X, LogOut, Activity, Building2, Globe } from 'lucide-react'
import { useLeadType, LEAD_TYPES } from '../contexts/LeadTypeContext'

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation()
  const { leadType, setLeadType, theme } = useLeadType()

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const activeLink = `${theme.sidebarActive}`

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
        {/* Lead Type Toggle */}
        <div className="px-4 pt-4 pb-2">
          <div className="bg-gray-900 border border-gray-800 rounded-full p-1 flex relative shadow-inner">
            <button
              onClick={() => setLeadType(LEAD_TYPES.HOTELS)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-semibold transition-all ${
                leadType === LEAD_TYPES.HOTELS
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Hotels & Property Managers"
            >
              <Building2 size={14} />
              Hotels
            </button>
            <button
              onClick={() => setLeadType(LEAD_TYPES.WEBSITE_DESIGN)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-semibold transition-all ${
                leadType === LEAD_TYPES.WEBSITE_DESIGN
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Website Design Leads"
            >
              <Globe size={14} />
              Web Design
            </button>
          </div>
        </div>

        {/* Logo Section */}
        <div className="px-6 py-1 flex justify-center relative">
          <Link to="/dashboard" className="flex justify-center">
            <img
              src="/assets/logo-icon-black.png"
              alt="Propela"
              className="h-44 w-auto object-contain filter invert leading-none"
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
                ? activeLink
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
                ? activeLink
                : 'text-gray-300 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Search size={20} />
            <span>My Leads</span>
          </Link>

          <Link
            to="/tracker"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/tracker')
                ? activeLink
                : 'text-gray-300 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Activity size={20} />
            <span>Tracker</span>
          </Link>

          <Link
            to="/scraper"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive('/scraper')
                ? activeLink
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
                ? activeLink
                : 'text-gray-300 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-800 px-6 pb-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-gray-300 hover:text-white hover:bg-gray-900 transition"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
