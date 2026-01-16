import React, { useState } from 'react'

export default function Search() {
  const [query, setQuery] = useState('')

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Property Search</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search properties..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900">123 Main St</h3>
              <p className="text-gray-600">$450,000</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
