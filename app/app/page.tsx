export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">LeaseLens</h1>
      <p className="text-xl mb-8">Madison WI Rental Transparency Platform</p>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 border rounded">
          <h2 className="text-2xl font-semibold mb-2">API Endpoints</h2>
          <ul className="space-y-2">
            <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/properties</code> - Search properties</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/landlords</code> - Get landlord info</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/transit</code> - Transit scores</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/neighborhoods</code> - Walkability scores</li>
          </ul>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="text-2xl font-semibold mb-2">Example Queries</h2>
          <ul className="space-y-2 text-sm">
            <li><code className="bg-gray-100 px-2 py-1 rounded">?address=State St</code></li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">?lat=43.0731&lon=-89.4012</code></li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">?name=Badger Property</code></li>
          </ul>
        </div>
      </div>
    </main>
  );
}
