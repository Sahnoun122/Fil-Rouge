'use client';

// pages/debug-tokens.tsx - Page de debugging des tokens (développement uniquement)

import { useState, useEffect } from 'react';
import { TokenManager } from '../utils/fetcher';
import { AuthService } from '../services/authService';

export default function DebugTokensPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string>('');

  useEffect(() => {
    refreshTokenInfo();
  }, []);

  const refreshTokenInfo = () => {
    setAccessToken(TokenManager.getAccessToken());
    setRefreshToken(TokenManager.getRefreshToken());
    
    // Capturer les logs de diagnostic
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

  const testTokens = (accessToken: string, refreshToken: string) => {
    if (!accessToken || !refreshToken) {
      alert('Veuillez entrer les tokens');
      return;
    }
    
    TokenManager.setTokens(accessToken, refreshToken);
    refreshTokenInfo();
    alert('Tokens sauvés ! Vérifiez les logs.');
  };

  if (process.env.NODE_ENV === 'production') {
    return <div className="p-8 text-center">Cette page n'est disponible qu'en développement.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">🔍 Debug Tokens</h1>
      
      {/* État actuel */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">État actuel des tokens</h2>
        <div className="space-y-2">
          <div>
            <strong>Access Token:</strong>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1 break-all">
              {accessToken || 'Aucun token'}
            </p>
          </div>
          <div>
            <strong>Refresh Token:</strong>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1 break-all">
              {refreshToken || 'Aucun token'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={refreshTokenInfo}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            🔄 Rafraîchir
          </button>
          <button
            onClick={clearTokens}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            🗑️ Supprimer tokens
          </button>
        </div>
      </div>

      {/* Test manual */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test manuel</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Access Token de test:</label>
            <input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="testAccessToken"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Refresh Token de test:</label>
            <input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="testRefreshToken"
            />
          </div>
          <button
            onClick={() => {
              const accessInput = document.getElementById('testAccessToken') as HTMLInputElement;
              const refreshInput = document.getElementById('testRefreshToken') as HTMLInputElement;
              testTokens(accessInput.value, refreshInput.value);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            💾 Sauver tokens de test
          </button>
        </div>
      </div>

      {/* Diagnostic */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Diagnostic localStorage</h2>
        <pre className="font-mono text-sm bg-gray-100 p-4 rounded overflow-auto max-h-64">
          {diagnosticInfo || 'Cliquez sur "Rafraîchir" pour voir le diagnostic'}
        </pre>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
        <h3 className="font-semibold text-yellow-800 mb-2">🛠️ Instructions de debugging:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
          <li>Ouvrez la console du navigateur (F12)</li>
          <li>Utilisez <code className="bg-yellow-100 px-1 rounded">diagnoseTokens()</code> pour voir l'état détaillé</li>
          <li>Utilisez <code className="bg-yellow-100 px-1 rounded">TokenManager.setTokens('access', 'refresh')</code> pour tester</li>
          <li>Regardez les logs lors du login/register pour voir ce qui se passe</li>
        </ol>
      </div>
    </div>
  );
}