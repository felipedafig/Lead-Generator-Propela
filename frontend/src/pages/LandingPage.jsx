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
              Entrar
            </Link>
            <Link to="/register" className="btn-propela">
              Solicitar acesso
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold mb-6 text-black">
            Geração de leads de alta eficiência.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Descubra e gerencie leads qualificados em segundos. Automação inteligente para seu negócio crescer sem limite.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="btn-propela flex items-center gap-2">
              Começar agora
              <ArrowRight size={20} />
            </Link>
            <button className="btn-propela-secondary">
              Ver demonstração
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Recursos Poderosos</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-propela">
              <Zap className="mb-4 text-black" size={32} />
              <h3 className="text-xl font-bold mb-2">Scraping Inteligente</h3>
              <p className="text-gray-600">
                Colete dados de empresas em tempo real com filtros avançados por localização, setor e avaliações.
              </p>
            </div>

            <div className="card-propela">
              <BarChart3 className="mb-4 text-black" size={32} />
              <h3 className="text-xl font-bold mb-2">Dashboard Avançado</h3>
              <p className="text-gray-600">
                Analise seus leads com gráficos interativos, estatísticas em tempo real e relatórios detalhados.
              </p>
            </div>

            <div className="card-propela">
              <Shield className="mb-4 text-black" size={32} />
              <h3 className="text-xl font-bold mb-2">Segurança Total</h3>
              <p className="text-gray-600">
                Autenticação segura, criptografia de dados e conformidade com regulamentações de privacidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Pronto para escalar seu negócio?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Junte-se a centenas de empreendedores usando Propela para crescer mais rápido.
          </p>
          <Link to="/register" className="btn-propela inline-flex items-center gap-2">
            Solicitar acesso
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2026 Propela. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
