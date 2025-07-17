export default function Debug() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold">Tailwind Test</h2>
          <p className="text-blue-600">This should be blue text</p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Test Button</button>
        </div>
        
        <div className="p-4 bg-green-100 rounded">
          <h2 className="font-semibold">Navigation Test</h2>
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-10 0v-2a2 2 0 012-2h6a2 2 0 012 2v2" />
          </svg>
        </div>
        
        <div className="p-4 bg-yellow-100 rounded">
          <h2 className="font-semibold">Grid Test</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-200 p-2">Item 1</div>
            <div className="bg-red-200 p-2">Item 2</div>
            <div className="bg-red-200 p-2">Item 3</div>
          </div>
        </div>
      </div>
    </div>
  )
}