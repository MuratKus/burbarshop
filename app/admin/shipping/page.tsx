'use client'

import { useState, useEffect } from 'react'

interface ShippingZone {
  id: string
  name: string
  countries: string[]
  rate: number
}

export default function ShippingPage() {
  const [zones, setZones] = useState<ShippingZone[]>([])
  const [loading, setLoading] = useState(true)
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null)
  const [newZone, setNewZone] = useState({
    name: '',
    countries: '',
    rate: 0
  })

  useEffect(() => {
    fetchZones()
  }, [])

  const fetchZones = async () => {
    try {
      const response = await fetch('/api/admin/shipping-zones')
      if (response.ok) {
        const data = await response.json()
        setZones(data)
      }
    } catch (error) {
      console.error('Error fetching zones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/shipping-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newZone.name,
          countries: newZone.countries.split(',').map(c => c.trim()),
          rate: newZone.rate
        })
      })
      
      if (response.ok) {
        setNewZone({ name: '', countries: '', rate: 0 })
        fetchZones()
      }
    } catch (error) {
      console.error('Error creating zone:', error)
    }
  }

  const handleUpdateZone = async (zone: ShippingZone) => {
    try {
      const response = await fetch(`/api/admin/shipping-zones/${zone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zone)
      })
      
      if (response.ok) {
        setEditingZone(null)
        fetchZones()
      }
    } catch (error) {
      console.error('Error updating zone:', error)
    }
  }

  const handleDeleteZone = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipping zone?')) return
    
    try {
      const response = await fetch(`/api/admin/shipping-zones/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchZones()
      }
    } catch (error) {
      console.error('Error deleting zone:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shipping Zones</h1>
        <p className="text-gray-600 mt-2">Configure shipping rates by geographic region</p>
      </div>

      {/* Create New Zone */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Shipping Zone</h2>
        <form onSubmit={handleCreateZone} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone Name
              </label>
              <input
                type="text"
                required
                value={newZone.name}
                onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., United States"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Countries (comma-separated)
              </label>
              <input
                type="text"
                required
                value={newZone.countries}
                onChange={(e) => setNewZone(prev => ({ ...prev, countries: e.target.value }))}
                placeholder="US, CA, MX"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Rate ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={newZone.rate}
                onChange={(e) => setNewZone(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Shipping Zone
          </button>
        </form>
      </div>

      {/* Existing Zones */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zone Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Countries
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shipping Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {zones.map((zone) => (
              <tr key={zone.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingZone?.id === zone.id ? (
                    <input
                      type="text"
                      value={editingZone.name}
                      onChange={(e) => setEditingZone(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900">{zone.name}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingZone?.id === zone.id ? (
                    <input
                      type="text"
                      value={editingZone.countries.join(', ')}
                      onChange={(e) => setEditingZone(prev => prev ? { 
                        ...prev, 
                        countries: e.target.value.split(',').map(c => c.trim()) 
                      } : null)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-full text-gray-900"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">
                      {zone.countries.join(', ')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingZone?.id === zone.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editingZone.rate}
                      onChange={(e) => setEditingZone(prev => prev ? { 
                        ...prev, 
                        rate: parseFloat(e.target.value) || 0 
                      } : null)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-20 text-gray-900"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900">
                      ${zone.rate.toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingZone?.id === zone.id ? (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleUpdateZone(editingZone)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingZone(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={() => setEditingZone(zone)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteZone(zone.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {zones.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">🚚</div>
            <p className="text-gray-500">No shipping zones configured yet. Add your first shipping zone above.</p>
          </div>
        )}
      </div>
    </div>
  )
}