import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, BarChart3, Shield } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="propela-logo-full">
              <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="10" y1="30" x2="60" y2="30" stroke="black" strokeWidth="3" />
                <line x1="15" y1="20" x2="65" y2="20" stroke="black" strokeWidth="3" />
                <line x1="20" y1="40" x2="70" y2="40" stroke="black" strokeWidth="3" />
                <text x="85" y="45" fontSize="40" fontWeight="bold" fill="black">Propela</text>
              </svg>
            </div>
          </div>

          <div className="flex gap-4">
            <Link to="/login" className="px-6 py-2 text-black font-medium hover:text-gray-700">
              Login
            </Link>
            <Link to="/register" className="btn-propela">
              Request Access
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold mb-6 text-black">
            High-Efficiency Lead Generation
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover and manage qualified leads in seconds. Smart automation for your business to grow without limits.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="btn-propela flex items-center gap-2">
              Start Now
              <ArrowRight size={20} />
            </Link>
            <button className="btn-propela-secondary">
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Powerful Features</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-propela">
              <Zap className="mb-4 text-black" size={32} />
              <h3 className="text-xl font-bold mb-2">Smart Scraping</h3>
              <p className="text-gray-600">
                Collect company data in real-time with advanced filters by location, industry and ratings.
              </p>
            </div>

            <div className="card-propela">
              <BarChart3 className="mb-4 text-black" size={32} />
              <h3 className="text-xl font-bold mb-2">Advanced Dashboard</h3>
              <p className="text-gray-600">
                Analyze your leads with interactive charts, real-time statistics and detailed reports.
              </p>
            </div>

            <div className="card-propela">
              <Shield className="mb-4 text-black" size={32} />
              <h3 className="text-xl font-bold mb-2">Complete Security</h3>
              <p className="text-gray-600">
                Secure authentication, data encryption and privacy regulation compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to scale your business?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of entrepreneurs using Propela to grow faster.
          </p>
          <Link to="/register" className="btn-propela inline-flex items-center gap-2">
            Request Access
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2026 Propela. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
