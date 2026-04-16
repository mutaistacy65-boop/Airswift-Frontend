import { useState } from 'react';
import { debugHeaders, verifyLocalHeaders } from '@/utils/debugHeaders';

export default function DebugHeaders() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckHeaders = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await debugHeaders();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to check headers');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckLocalHeaders = () => {
    const headers = verifyLocalHeaders();
    setResult(headers);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 Debug: Authorization Headers</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleCheckLocalHeaders} style={{ padding: '8px 16px', marginRight: '10px' }}>
          Check Local Headers
        </button>
        <button 
          onClick={handleCheckHeaders} 
          disabled={loading}
          style={{ padding: '8px 16px', backgroundColor: loading ? '#ccc' : '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Checking...' : 'Check Backend Headers'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
          ❌ Error: {error}
        </div>
      )}

      {result && (
        <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
          ✅ Result:
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px' }}>
        <h3>Expected output:</h3>
        <code>Bearer &lt;your_token&gt;</code>
      </div>
    </div>
  );
}
