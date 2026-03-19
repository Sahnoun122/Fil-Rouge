'use client';

import { useState, useEffect } from 'react';
import { TokenManager } from '@/src/utils/fetcher';

export default function DebugTokensPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string>('');

  useEffect(() => {
    refreshTokenInfo();
  }, []);

  const refreshTokenInfo = () => {
    setAccessToken(TokenManager.getAccessToken());

    const originalLog = console.log;
    const logs: string[] = [];
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };

    TokenManager.diagnose();

    console.log = originalLog;
    setDiagnosticInfo(logs.join('\n'));
  };

  const clearTokens = () => {
    TokenManager.clearTokens();
    refreshTokenInfo();
  };

  const testToken = (accessToken: string) => {
    if (!accessToken) {
      alert('Please enter the access token');
      return;
    }

    TokenManager.setTokens(accessToken);
    refreshTokenInfo();
    alert('Token saved! Check the logs.');
  };

  if (process.env.NODE_ENV === 'production') {
    return <div className="p-8 text-center">This page is only available in development.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Debug Tokens</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current token state</h2>
        <div className="space-y-2">
          <div>
            <strong>Access Token:</strong>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1 break-all">
              {accessToken || 'No token'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={refreshTokenInfo}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh
          </button>
          <button
            onClick={clearTokens}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete tokens
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Manual test</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Test access token:</label>
            <input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="testAccessToken"
            />
          </div>
          <button
            onClick={() => {
              const accessInput = document.getElementById('testAccessToken') as HTMLInputElement;
              testToken(accessInput.value);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save test token
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">localStorage Diagnostic</h2>
        <pre className="font-mono text-sm bg-gray-100 p-4 rounded overflow-auto max-h-64">
          {diagnosticInfo || 'Click "Refresh" to see the diagnostic'}
        </pre>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
        <h3 className="font-semibold text-yellow-800 mb-2">Debugging instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
          <li>Open the browser console (F12)</li>
          <li>Use <code className="bg-yellow-100 px-1 rounded">diagnoseTokens()</code> to see the detailed state</li>
          <li>Use <code className="bg-yellow-100 px-1 rounded">TokenManager.setTokens('access')</code> to test</li>
          <li>Watch the logs during login/register to see what happens</li>
        </ol>
      </div>
    </div>
  );
}
