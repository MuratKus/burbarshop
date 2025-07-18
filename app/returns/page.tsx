export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Returns & Exchanges</h1>
      <div className="prose max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">Return Policy</h2>
        <p>We want you to be completely satisfied with your purchase. If you're not happy with your order, you can return it within 30 days of delivery.</p>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">How to Return</h2>
          <ol>
            <li>Contact us at burcinbar@gmail.com within 30 days</li>
            <li>Include your order number and reason for return</li>
            <li>We'll provide a return shipping label</li>
            <li>Pack items securely and ship back to us</li>
          </ol>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Return Conditions</h2>
          <ul>
            <li>Items must be in original condition</li>
            <li>Custom orders cannot be returned</li>
            <li>Customer pays return shipping unless item is defective</li>
            <li>Refunds processed within 5-7 business days</li>
          </ul>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Exchanges</h2>
          <p>We're happy to exchange items for different sizes or similar products. Contact us to arrange an exchange.</p>
        </div>
      </div>
    </div>
  )
}