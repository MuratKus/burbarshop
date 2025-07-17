'use client'

import { useState } from 'react'

interface TrackingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (trackingData: { trackingNumber: string; trackingUrl: string }) => Promise<void>
  orderId: string
}

export function TrackingModal({ isOpen, onClose, onSubmit, orderId }: TrackingModalProps) {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('DHL')
  const [customUrl, setCustomUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) return

    setIsSubmitting(true)
    try {
      let trackingUrl = customUrl.trim()
      
      // Auto-generate tracking URL if not provided
      if (!trackingUrl) {
        switch (carrier) {
          case 'DHL':
            trackingUrl = `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`
            break
          case 'UPS':
            trackingUrl = `https://www.ups.com/track?tracknum=${trackingNumber}`
            break
          case 'FedEx':
            trackingUrl = `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`
            break
          case 'PostNL':
            trackingUrl = `https://postnl.nl/tracktrace/?B=${trackingNumber}&P=&D=&T=`
            break
          case 'TNT':
            trackingUrl = `https://www.tnt.com/express/en_us/site/shipping-tools/tracking.html?searchType=con&cons=${trackingNumber}`
            break
          default:
            trackingUrl = trackingNumber // Just use the tracking number as URL if unknown carrier
        }
      }

      await onSubmit({ trackingNumber, trackingUrl })
      
      // Reset form
      setTrackingNumber('')
      setCustomUrl('')
      setCarrier('DHL')
      onClose()
    } catch (error) {
      console.error('Error submitting tracking:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Add Tracking Information
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Order #{orderId.slice(-8).toUpperCase()}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shipping Carrier
            </label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="DHL">DHL Express</option>
              <option value="UPS">UPS</option>
              <option value="FedEx">FedEx</option>
              <option value="PostNL">PostNL</option>
              <option value="TNT">TNT</option>
              <option value="Other">Other/Custom</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tracking Number *
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {carrier === 'Other' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Tracking URL
              </label>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!trackingNumber.trim() || isSubmitting}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? 'Adding...' : 'Add Tracking & Ship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}