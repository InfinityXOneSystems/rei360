import React from 'react'

export default function Properties() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Properties</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Address</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Price</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Bedrooms</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">123 Main St</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$450,000</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">4</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Active</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
