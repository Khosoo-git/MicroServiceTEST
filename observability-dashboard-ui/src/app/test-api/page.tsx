'use client';

import { useEffect, useState } from 'react';

export default function TestApiPage() {
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function testApi() {
      try {
        const res = await fetch('http://localhost:8085/api/services', {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const text = await res.text();
        setResponse(`Status: ${res.status}\nHeaders: ${JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2)}\nBody: ${text}`);
      } catch (err: any) {
        setError(`Error: ${err.message}`);
      }
    }
    
    testApi();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>
      <div className="bg-gray-800 rounded-lg p-6 font-mono text-sm">
        <h2 className="text-lg font-semibold mb-2">Response:</h2>
        <pre className="whitespace-pre-wrap">{response || error || 'Loading...'}</pre>
      </div>
    </div>
  );
}
