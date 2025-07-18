export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <div className="prose max-w-2xl">
        <p>Get in touch with us for any questions about our art prints and products.</p>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p><strong>Email:</strong> burcinbar@gmail.com</p>
          <p><strong>Response Time:</strong> 24-48 hours</p>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Customer Support</h2>
          <p>We're here to help with:</p>
          <ul>
            <li>Order questions</li>
            <li>Product information</li>
            <li>Shipping inquiries</li>
            <li>Returns and exchanges</li>
          </ul>
        </div>
      </div>
    </div>
  )
}