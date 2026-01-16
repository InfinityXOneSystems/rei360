import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center px-2 py-2">
              <span className="text-2xl font-bold text-blue-600">REI360</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/search" className="text-gray-600 hover:text-gray-900">Search</Link>
            <Link to="/properties" className="text-gray-600 hover:text-gray-900">Properties</Link>
            <Link to="/settings" className="text-gray-600 hover:text-gray-900">Settings</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
