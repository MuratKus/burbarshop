export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shipping Information</h1>
      <div className="prose max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">Shipping Options</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium">Domestic Shipping</h3>
            <p>Within Germany: €5.99 - 3-5 business days</p>
          </div>
          
          <div>
            <h3 className="text-xl font-medium">European Union</h3>
            <p>EU Countries: €12.99 - 7-10 business days</p>
          </div>
          
          <div>
            <h3 className="text-xl font-medium">International</h3>
            <p>Worldwide: €15.99 - 10-14 business days</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Processing Time</h2>
          <p>All orders are processed within 1-2 business days. You'll receive a tracking number once your order ships.</p>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Free Shipping</h2>
          <p>Free shipping on orders over €30 within Germany.</p>
        </div>
      </div>
    </div>
  )
}