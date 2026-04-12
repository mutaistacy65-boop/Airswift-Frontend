import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/context/AuthContext';

export default function ApplicationSubmissionTester() {
  const { user } = useAuth();
  const [apiUrl, setApiUrl] = useState('http://localhost:5000/api');
  const [authToken, setAuthToken] = useState('');
  const [jobId, setJobId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [responseData, setResponseData] = useState<any>(null);

  const log = (message: string, type: 'info' | 'error' | 'warning' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console[type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log'](message);
  };

  const setStatusMessage = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setStatus(message);
  };

  const updateResponseData = (data: any) => {
    setResponseData(data);
  };

  const handleFileSelect = (fileType: 'cv' | 'nationalid' | 'passport', file: File | null) => {
    if (fileType === 'cv') setCvFile(file);
    else if (fileType === 'nationalid') setNationalIdFile(file);
    else if (fileType === 'passport') setPassportFile(file);
  };

  const checkBackendConnection = async () => {
    try {
      log('🔗 Checking backend connection...', 'info');
      const response = await fetch(`${apiUrl.replace('/api', '')}/health`);
      if (response.ok) {
        setStatusMessage('✅ Backend is running and accessible', 'success');
        log('Backend connection successful', 'success');
      } else {
        setStatusMessage(`❌ Backend returned status ${response.status}`, 'error');
        log(`Backend error: ${response.status}`, 'error');
      }
    } catch (error: any) {
      setStatusMessage(`❌ Cannot connect to backend: ${error.message}`, 'error');
      log(`Connection error: ${error.message}`, 'error');
    }
  };

  const checkAuthToken = () => {
    try {
      log('🔐 Validating auth token...', 'info');
      const token = authToken;
      if (!token) {
        setStatusMessage('❌ No auth token provided', 'warning');
        log('Auth token is empty', 'warning');
        return;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        setStatusMessage('❌ Invalid JWT format', 'error');
        log('Token does not appear to be a valid JWT', 'error');
        return;
      }

      try {
        const payload = JSON.parse(atob(parts[1]));
        log(`Auth token valid. User ID: ${payload.id}, Role: ${payload.role}`, 'success');
        setStatusMessage('✅ Auth token is valid', 'success');
        updateResponseData(payload);
      } catch (e: any) {
        setStatusMessage('❌ Could not decode token', 'error');
        log('Token decode error: ' + e.message, 'error');
      }
    } catch (error: any) {
      setStatusMessage(`❌ Error: ${error.message}`, 'error');
      log(`Token validation error: ${error.message}`, 'error');
    }
  };

  const checkJobsEndpoint = async () => {
    try {
      log('🔍 Checking jobs endpoint...', 'info');
      const response = await fetch(`${apiUrl}/applications/job-options`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setStatusMessage(`✅ Found ${data.length} available jobs`, 'success');
        log(`Jobs endpoint working. Available jobs: ${data.length}`, 'success');
        updateResponseData(data);
      } else {
        setStatusMessage('⚠️ Jobs endpoint returned unexpected format', 'warning');
        log('Unexpected jobs data format', 'warning');
        updateResponseData(data);
      }
    } catch (error: any) {
      setStatusMessage(`❌ Error fetching jobs: ${error.message}`, 'error');
      log(`Jobs fetch error: ${error.message}`, 'error');
    }
  };

  const submitApplication = async () => {
    try {
      log('📤 Starting application submission...', 'info');

      if (!authToken) {
        setStatusMessage('❌ Auth token required', 'error');
        log('Auth token is missing', 'error');
        return;
      }

      if (!jobId && !jobTitle) {
        setStatusMessage('❌ Job ID or Job Title required', 'error');
        log('No job selected', 'error');
        return;
      }

      if (!phone) {
        setStatusMessage('❌ Phone is required', 'error');
        log('Phone is missing', 'error');
        return;
      }

      if (!nationalId) {
        setStatusMessage('❌ National ID is required', 'error');
        log('National ID is missing', 'error');
        return;
      }

      if (!cvFile || !nationalIdFile || !passportFile) {
        setStatusMessage('❌ All three files required', 'error');
        log('Missing one or more files', 'error');
        return;
      }

      log('✅ All validations passed', 'success');

      const formData = new FormData();
      formData.append('cv', cvFile);
      formData.append('nationalId', nationalIdFile);
      formData.append('passport', passportFile);
      formData.append('job_id', jobId);
      formData.append('job_title', jobTitle);
      formData.append('phone', phone);
      formData.append('national_id', nationalId);
      if (coverLetter) {
        formData.append('cover_letter', coverLetter);
      }

      log('📋 FormData prepared', 'info');
      log(`  - CV: ${cvFile.name}`, 'info');
      log(`  - National ID: ${nationalIdFile.name}`, 'info');
      log(`  - Passport: ${passportFile.name}`, 'info');
      log(`  - Job ID: ${jobId}`, 'info');
      log(`  - Phone: ${phone}`, 'info');

      setProgress(0);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
          log(`Upload progress: ${Math.round(percentComplete)}%`, 'info');
        }
      });

      xhr.addEventListener('load', () => {
        setProgress(0);
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status === 201) {
            setStatusMessage('✅ Application submitted successfully!', 'success');
            log('Application submission successful', 'success');
            log(`Application ID: ${response.id}`, 'success');
            updateResponseData(response);
          } else {
            setStatusMessage(`❌ Error: ${response.message}`, 'error');
            log(`Server error: ${response.message}`, 'error');
            updateResponseData(response);
          }
        } catch (e: any) {
          setStatusMessage(`❌ Error parsing response: ${e.message}`, 'error');
          log(`Parse error: ${e.message}`, 'error');
          log(`Response text: ${xhr.responseText}`, 'error');
        }
      });

      xhr.addEventListener('error', () => {
        setProgress(0);
        setStatusMessage('❌ Network error', 'error');
        log('Network request failed', 'error');
      });

      xhr.open('POST', `${apiUrl}/applications/apply`);
      xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
      xhr.send(formData);

    } catch (error: any) {
      setProgress(0);
      setStatusMessage(`❌ Error: ${error.message}`, 'error');
      log(`Submission error: ${error.message}`, 'error');
    }
  };

  const clearForm = () => {
    setJobId('');
    setJobTitle('');
    setPhone('');
    setNationalId('');
    setCoverLetter('');
    setCvFile(null);
    setNationalIdFile(null);
    setPassportFile(null);
    setStatus('');
    log('Form cleared', 'info');
  };

  const clearLogs = () => {
    setLogs([]);
    log('Logs cleared', 'info');
  };

  useEffect(() => {
    log('🧪 Application Submission Tester Loaded', 'success');
    log('1. Configure API URL and Auth Token', 'info');
    log('2. Run pre-flight checks', 'info');
    log('3. Fill in the form', 'info');
    log('4. Click Submit Application', 'info');
  }, []);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px',
          textAlign: 'center'
        }}>
          <h1>🧪 Application Submission Tester</h1>
          <p>Debug application submission issues step by step</p>
        </div>

        <div style={{ padding: '30px' }}>
          {/* Configuration */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: '2px solid #667eea',
              color: '#333'
            }}>
              ⚙️ Configuration
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: '15px',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <label>API Base URL:</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: '15px',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <label>Auth Token:</label>
              <input
                type="password"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="Your JWT token from login"
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                }}
              />
            </div>
          </div>

          {/* Pre-checks */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: '2px solid #667eea',
              color: '#333'
            }}>
              ✅ Pre-Flight Checks
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button
                onClick={checkBackendConnection}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  background: '#667eea',
                  color: 'white'
                }}
              >
                🔗 Check Backend Connection
              </button>
              <button
                onClick={checkAuthToken}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  background: '#667eea',
                  color: 'white'
                }}
              >
                🔐 Validate Auth Token
              </button>
              <button
                onClick={checkJobsEndpoint}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  background: '#667eea',
                  color: 'white'
                }}
              >
                📋 Check Jobs Endpoint
              </button>
            </div>

            <div id="precheck-status">{status}</div>
          </div>

          {/* Form */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: '2px solid #667eea',
              color: '#333'
            }}>
              📝 Application Form
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#333'
              }}>
                Job ID *
              </label>
              <input
                type="number"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                placeholder="e.g., 1"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#333'
              }}>
                Job Title (optional)
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="If no job ID, enter title"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#333'
              }}>
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#333'
              }}>
                National ID *
              </label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="Your national ID"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#333'
              }}>
                Cover Letter (optional)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Why are you interested in this position?"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* File Uploads */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#333'
              }}>
                CV (PDF, max 5MB) *
              </label>
              <div style={{
                position: 'relative',
                overflow: 'hidden',
                display: 'inline-block',
                width: '100%'
              }}>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileSelect('cv', e.target.files?.[0] || null)}
                  style={{
                    position: 'absolute',
                    left: '-9999px'
                  }}
                />
                <label style={{
                  display: 'block',
                  padding: '10px',
                  background: '#f5f5f5',
                  border: '2px dashed #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}>
                  📄 Choose CV PDF or drag here
                  {cvFile && <div style={{ marginTop: '6px', color: '#4caf50', fontWeight: '500' }}>
                    ✅ {cvFile.name} ({(cvFile.size / 1024 / 1024).toFixed(2)}MB)
                  </div>}
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#333'
              }}>
                National ID Document (PDF, max 5MB) *
              </label>
              <div style={{
                position: 'relative',
                overflow: 'hidden',
                display: 'inline-block',
                width: '100%'
              }}>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileSelect('nationalid', e.target.files?.[0] || null)}
                  style={{
                    position: 'absolute',
                    left: '-9999px'
                  }}
                />
                <label style={{
                  display: 'block',
                  padding: '10px',
                  background: '#f5f5f5',
                  border: '2px dashed #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}>
                  🆔 Choose National ID PDF or drag here
                  {nationalIdFile && <div style={{ marginTop: '6px', color: '#4caf50', fontWeight: '500' }}>
                    ✅ {nationalIdFile.name} ({(nationalIdFile.size / 1024 / 1024).toFixed(2)}MB)
                  </div>}
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#333'
              }}>
                Passport (PDF, max 5MB) *
              </label>
              <div style={{
                position: 'relative',
                overflow: 'hidden',
                display: 'inline-block',
                width: '100%'
              }}>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileSelect('passport', e.target.files?.[0] || null)}
                  style={{
                    position: 'absolute',
                    left: '-9999px'
                  }}
                />
                <label style={{
                  display: 'block',
                  padding: '10px',
                  background: '#f5f5f5',
                  border: '2px dashed #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}>
                  🛂 Choose Passport PDF or drag here
                  {passportFile && <div style={{ marginTop: '6px', color: '#4caf50', fontWeight: '500' }}>
                    ✅ {passportFile.name} ({(passportFile.size / 1024 / 1024).toFixed(2)}MB)
                  </div>}
                </label>
              </div>
            </div>
          </div>

          {/* Submission */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: '2px solid #667eea',
              color: '#333'
            }}>
              🚀 Submit Application
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button
                onClick={submitApplication}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  background: '#667eea',
                  color: 'white',
                  flex: 1
                }}
              >
                📤 Submit Application
              </button>
              <button
                onClick={clearForm}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  background: '#f5f5f5',
                  color: '#333'
                }}
              >
                🔄 Clear Form
              </button>
            </div>

            <div style={{
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '15px',
              background: status.includes('✅') ? '#e8f5e9' : status.includes('❌') ? '#ffebee' : status.includes('⚠️') ? '#fff3e0' : '#e3f2fd',
              color: status.includes('✅') ? '#2e7d32' : status.includes('❌') ? '#c62828' : status.includes('⚠️') ? '#e65100' : '#1565c0',
              borderLeft: `4px solid ${status.includes('✅') ? '#2e7d32' : status.includes('❌') ? '#c62828' : status.includes('⚠️') ? '#e65100' : '#1565c0'}`
            }}>
              {status}
            </div>

            {progress > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: '#e0e0e0',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #4caf50, #66bb6a)',
                    width: `${progress}%`,
                    transition: 'width 0.3s'
                  }} />
                </div>
                <p>Uploading: {Math.round(progress)}%</p>
              </div>
            )}
          </div>

          {/* Logs */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: '2px solid #667eea',
              color: '#333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              📜 Debug Logs
              <button
                onClick={clearLogs}
                style={{
                  padding: '5px 10px',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  background: '#f5f5f5',
                  color: '#333'
                }}
              >
                Clear
              </button>
            </div>
            <div style={{
              background: '#1e1e1e',
              color: '#00ff00',
              padding: '15px',
              borderRadius: '4px',
              fontFamily: '"Courier New", monospace',
              fontSize: '12px',
              maxHeight: '300px',
              overflowY: 'auto',
              lineHeight: '1.5'
            }}>
              {logs.map((logEntry, index) => (
                <div key={index} style={{ marginBottom: '4px' }}>
                  {logEntry}
                </div>
              ))}
            </div>
          </div>

          {/* Response */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: '2px solid #667eea',
              color: '#333'
            }}>
              📊 Response Data
            </div>
            <div style={{
              background: '#f5f5f5',
              padding: '15px',
              borderRadius: '4px',
              overflowX: 'auto'
            }}>
              <pre style={{
                margin: 0,
                fontSize: '12px',
                fontFamily: 'monospace'
              }}>
                {responseData ? JSON.stringify(responseData, null, 2) : 'No response data yet'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}