import React from 'react'

export default function StatCard({ title, value, icon, color }) {
  return (
    <div className="card-propela">
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-black`}>
        {icon}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-black">{value}</p>
    </div>
  )
}
