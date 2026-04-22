import { useState } from 'react';
import { debugToken, forcePostWithToken, testApiInstance, runFullDebug, testLoginStructure } from '@/utils/authDebug';
import { reconnectSocket } from '@/services/socket';

export default function AuthDebugPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => setResults([]);

  const runStep1 = () => {
    addResult('=== STEP 1: VERIFY TOKEN IS SAVED ===');
    const token = debugToken();
    if (!token) {
      addResult('❌ PROBLEM: No token found in localStorage!');
      addResult('   Solution: Login first, then check localStorage.getItem("token")');
    } else {
      addResult('✅ Token found in localStorage');
      addResult(`   Token: ${token.substring(0, 20)}...`);
    }
  };

  const runStep2 = async () => {
    addResult('=== STEP 2: FORCE ATTACH TOKEN TEST ===');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('test', 'debug');

      addResult('🚨 Testing force token attachment...');
      const response = await forcePostWithToken('/debug/headers', formData);

      addResult('✅ Force method WORKS - interceptor might be broken');
      addResult(`   Response: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      addResult('❌ Force method also FAILED - backend issue');
      addResult(`   Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runStep3 = async () => {
    addResult('=== STEP 3: TEST API INSTANCE ===');
    setLoading(true);
    try {
      await testApiInstance('/profile');
      addResult('✅ API instance works correctly');
    } catch (error: any) {
      addResult('❌ API instance failed');
      addResult(`   Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runStep4 = () => {
    addResult('=== STEP 4: RECONNECT SOCKET ===');
    try {
      reconnectSocket();
      addResult('✅ Socket reconnection triggered');
      addResult('   Check console for socket connection logs');
    } catch (error: any) {
      addResult('❌ Socket reconnection failed');
      addResult(`   Error: ${error.message}`);
    }
  };

  const runLoginTest = async () => {
    if (!testEmail || !testPassword) {
      addResult('❌ Please enter email and password for login test');
      return;
    }

    addResult('=== LOGIN RESPONSE STRUCTURE TEST ===');
    setLoading(true);
    try {
      const result = await testLoginStructure(testEmail, testPassword);
      addResult('✅ Login test completed');
      addResult(`   Token path used: ${result.tokenPath}`);
      addResult(`   Token found: ${result.token ? 'YES' : 'NO'}`);
      if (result.token) {
        addResult(`   Token preview: ${result.token.substring(0, 20)}...`);
      }
    } catch (error: any) {
      addResult('❌ Login test failed');
      addResult(`   Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runAllSteps = async () => {
    clearResults();
    addResult('🚀 RUNNING COMPLETE DEBUG SUITE...\n');

    runStep1();
    await new Promise(resolve => setTimeout(resolve, 500));

    await runStep3();
    await new Promise(resolve => setTimeout(resolve, 500));

    await runStep2();
    await new Promise(resolve => setTimeout(resolve, 500));

    runStep4();

    addResult('\n=== DEBUG COMPLETE ===');
    addResult('Check results above to identify the issue');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px' }}>
      <h1>🔧 AUTHENTICATION HARD FIX DEBUG</h1>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
        <h2>📋 Step-by-Step Instructions</h2>
        <ol>
          <li><strong>Verify Token:</strong> Check if token exists in localStorage</li>
          <li><strong>Force Attach:</strong> Bypass interceptor to test if backend accepts token</li>
          <li><strong>Test API Instance:</strong> Check if interceptor is working</li>
          <li><strong>Reconnect Socket:</strong> Update socket with current token</li>
        </ol>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={runAllSteps} disabled={loading} style={{ padding: '10px 20px', marginRight: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          🚀 Run All Steps
        </button>
        <button onClick={runStep1} style={{ padding: '10px 20px', marginRight: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          1️⃣ Check Token
        </button>
        <button onClick={runStep3} disabled={loading} style={{ padding: '10px 20px', marginRight: '10px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          2️⃣ Test API
        </button>
        <button onClick={runStep2} disabled={loading} style={{ padding: '10px 20px', marginRight: '10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          3️⃣ Force Token
        </button>
        <button onClick={runStep4} style={{ padding: '10px 20px', marginRight: '10px', backgroundColor: '#6f42c1', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          4️⃣ Fix Socket
        </button>
        <button onClick={clearResults} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          🗑️ Clear
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
        <h3>🔐 Login Response Structure Test</h3>
        <p style={{ fontSize: '14px', marginBottom: '10px' }}>
          Test the exact structure of your backend login response to find where the token is located.
        </p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Test email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '200px' }}
          />
          <input
            type="password"
            placeholder="Test password"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '200px' }}
          />
          <button
            onClick={runLoginTest}
            disabled={loading}
            style={{ padding: '8px 16px', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Test Login Structure
          </button>
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          <strong>Expected token locations:</strong> response.data.token or response.data.data.token
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <h3>🔍 Manual Console Commands</h3>
        <div style={{ fontSize: '12px', marginBottom: '10px' }}>
          <strong>Check token:</strong> <code>localStorage.getItem("token")</code><br/>
          <strong>Test login structure:</strong> <code>testLoginStructure('email@example.com', 'password')</code><br/>
          <strong>Run debug:</strong> <code>runFullDebug()</code><br/>
          <strong>Force request:</strong> <code>forcePostWithToken('/applications', formData)</code>
        </div>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: '#f8f9fa', maxHeight: '400px', overflowY: 'auto' }}>
        <h3>📊 Results</h3>
        {results.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>Click buttons above to run debug steps...</p>
        ) : (
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {results.join('\n')}
          </pre>
        )}
      </div>
    </div>
  );
}
