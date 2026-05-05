import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const LeadTypeContext = createContext(null)

export const LEAD_TYPES = {
  HOTELS: 'hotels',
  WEBSITE_DESIGN: 'website-design'
}

export const LEAD_TYPE_INFO = {
  [LEAD_TYPES.HOTELS]: {
    label: 'Hotels',
    fullLabel: 'Hotels & Property Managers',
    accent: 'blue',
    industries: [
      { value: 'hotel', label: 'Hotel' },
      { value: 'property manager', label: 'Property Manager' }
    ],
    companySizeTiers: {
      hotel: [
        { value: 'micro', label: 'Micro (1-10 employees)', min: 1, max: 10 },
        { value: 'boutique-small', label: 'Boutique-Small (11-50 employees)', min: 11, max: 50 },
        { value: 'boutique-mid', label: 'Boutique Mid (51-200 employees)', min: 51, max: 200 },
        { value: 'mid-chain', label: 'Mid-Chain (200-500 employees)', min: 200, max: 500 }
      ],
      'property manager': [
        { value: 'solo', label: 'Solo Property Manager (1 property)', min: 1, max: 1 },
        { value: 'small-portfolio', label: 'Small Portfolio (2-10 properties)', min: 2, max: 10 },
        { value: 'large-portfolio', label: 'Large Portfolio (10+ properties)', min: 10, max: 500 }
      ]
    }
  },
  [LEAD_TYPES.WEBSITE_DESIGN]: {
    label: 'Web Design',
    fullLabel: 'Website Design Leads',
    accent: 'emerald',
    industries: [
      { value: 'restaurant', label: 'Restaurant' },
      { value: 'retail', label: 'Retail Store' },
      { value: 'salon', label: 'Salon & Spa' },
      { value: 'fitness', label: 'Fitness & Wellness' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'professional-services', label: 'Professional Services' },
      { value: 'real-estate', label: 'Real Estate' },
      { value: 'automotive', label: 'Automotive' }
    ],
    companySizeTiers: {}
  }
}

const THEME_CLASSES = {
  blue: {
    badge: 'bg-blue-100 text-blue-800',
    pillActive: 'bg-blue-600 text-white shadow-md',
    indicator: 'bg-blue-500',
    accentText: 'text-blue-600',
    headerBar: 'bg-gradient-to-r from-blue-500 to-blue-600',
    ring: 'ring-blue-500',
    sidebarActive: 'bg-blue-600 text-white'
  },
  emerald: {
    badge: 'bg-emerald-100 text-emerald-800',
    pillActive: 'bg-emerald-600 text-white shadow-md',
    indicator: 'bg-emerald-500',
    accentText: 'text-emerald-600',
    headerBar: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    ring: 'ring-emerald-500',
    sidebarActive: 'bg-emerald-600 text-white'
  }
}

export function LeadTypeProvider({ children }) {
  const [leadType, setLeadTypeState] = useState(() => {
    const stored = localStorage.getItem('leadType')
    return stored && LEAD_TYPE_INFO[stored] ? stored : LEAD_TYPES.HOTELS
  })

  useEffect(() => {
    axios.defaults.headers.common['x-lead-type'] = leadType
    localStorage.setItem('leadType', leadType)
  }, [leadType])

  const info = LEAD_TYPE_INFO[leadType]
  const theme = THEME_CLASSES[info.accent]

  return (
    <LeadTypeContext.Provider value={{ leadType, setLeadType: setLeadTypeState, info, theme }}>
      {children}
    </LeadTypeContext.Provider>
  )
}

export function useLeadType() {
  const ctx = useContext(LeadTypeContext)
  if (!ctx) throw new Error('useLeadType must be used within LeadTypeProvider')
  return ctx
}
