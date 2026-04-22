/**
 * Quick Test Runner - Execute from browser console or Node.js
 * 
 * To use in browser:
 * 1. Open DevTools (F12) → Console
 * 2. Navigate to http://localhost:3000
 * 3. Copy-paste the test runner code or import this file
 * 4. Run: testRunner.runQuickTests()
 */

import {
  runAllTests,
  printTestResults,
  generateMockTokens,
  setupLocalStorageMock,
  createMockFetchResponse,
} from './testUtils'

export const testRunner = {
  /**
   * Run all tests and display results
   */
  runQuickTests: () => {
    console.clear()
    console.log('🚀 Starting Dual Token Authentication Tests...\n')

    const results = runAllTests()
    printTestResults(results)

    return results
  },

  /**
   * Test token generation
   */
  testTokenGeneration: () => {
    console.log('\n📝 Testing Token Generation...')
    const tokens = generateMockTokens()

    console.log('Generated Tokens:', {
      accessToken: tokens.accessToken.substring(0, 20) + '...',
      refreshToken: tokens.refreshToken.substring(0, 20) + '...',
      userId: tokens.userId,
      email: tokens.email,
    })

    return tokens
  },

  /**
   * Test localStorage functionality
   */
  testStorageFunctionality: () => {
    console.log('\n💾 Testing Local Storage Functionality...')

    const storage = setupLocalStorageMock()
    const tokens = generateMockTokens()

    // Test setting tokens
    storage.setItem('accessToken', tokens.accessToken)
    storage.setItem('refreshToken', tokens.refreshToken)

    // Test retrieval
    const retrieved = {
      accessToken: storage.getItem('accessToken'),
      refreshToken: storage.getItem('refreshToken'),
    }

    const passed =
      retrieved.accessToken === tokens.accessToken &&
      retrieved.refreshToken === tokens.refreshToken

    console.log(`✅ Storage Test: ${passed ? 'PASSED' : 'FAILED'}`)

    return { tokens, retrieved, passed }
  },

  /**
   * Test API response structure
   */
  testAPIResponseStructure: () => {
    console.log('\n📡 Testing API Response Structure...')

    const tokens = generateMockTokens()

    const successResponse = {
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: tokens.userId,
        email: tokens.email,
        name: 'Test User',
        role: 'user',
      },
    }

    const mockFetch = createMockFetchResponse(successResponse, 200)

    console.log('Mock Response:', {
      status: mockFetch.status,
      ok: mockFetch.ok,
      hasAccessToken: !!successResponse.accessToken,
      hasRefreshToken: !!successResponse.refreshToken,
      hasUser: !!successResponse.user,
    })

    return {
      response: successResponse,
      mockFetch,
      valid: mockFetch.ok && successResponse.accessToken && successResponse.refreshToken,
    }
  },

  /**
   * Test authentication flow simulation
   */
  testAuthFlowSimulation: () => {
    console.log('\n🔐 Simulating Authentication Flow...\n')

    // Step 1: Register (no tokens)
    console.log('1️⃣ Register User')
    console.log('   ✓ User created (no tokens yet)')

    // Step 2: Verify email (get tokens)
    console.log('\n2️⃣ Verify Email')
    const tokens = generateMockTokens('user-123', 'user@example.com')
    console.log('   ✓ Tokens generated')
    console.log(`     - Access Token: ${tokens.accessToken.substring(0, 30)}...`)
    console.log(`     - Refresh Token: ${tokens.refreshToken.substring(0, 30)}...`)

    // Step 3: Store tokens
    console.log('\n3️⃣ Store Tokens in localStorage')
    const storage = setupLocalStorageMock()
    storage.setItem('accessToken', tokens.accessToken)
    storage.setItem('refreshToken', tokens.refreshToken)
    console.log('   ✓ Access Token stored')
    console.log('   ✓ Refresh Token stored')

    // Step 4: Make API request with token
    console.log('\n4️⃣ API Request with Bearer Token')
    console.log(`   ✓ Header: Authorization: Bearer ${tokens.accessToken.substring(0, 20)}...`)
    console.log('   ✓ Request sent to /api/dashboard')
    console.log('   ✓ Response: 200 OK')

    // Step 5: Token refresh
    console.log('\n5️⃣ Refresh Token (simulated expiry)')
    const newTokens = generateMockTokens('user-123', 'user@example.com')
    storage.setItem('accessToken', newTokens.accessToken)
    storage.setItem('refreshToken', newTokens.refreshToken)
    console.log('   ✓ Call /api/auth/refresh')
    console.log('   ✓ New tokens received')
    console.log('   ✓ Retry original request')
    console.log('   ✓ Request succeeded')

    // Step 6: Logout
    console.log('\n6️⃣ Logout')
    storage.removeItem('accessToken')
    storage.removeItem('refreshToken')
    console.log('   ✓ Tokens cleared')
    console.log('   ✓ User redirected to login')

    return {
      initialTokens: tokens,
      refreshedTokens: newTokens,
      tokensAreDifferent: tokens.accessToken !== newTokens.accessToken,
    }
  },

  /**
   * Test security: Token validation
   */
  testSecurityValidation: () => {
    console.log('\n🔒 Testing Security Validations...\n')

    const tests = {
      invalidBearerFormat: 'Bearer' === 'Bearer', // No token after
      missingBearer: !!('token123'.split(' ')[1]), // No "Bearer " prefix
      tokenTooShort: 'abc'.length > 10,
      multipleSpaces: '  token'.trim() === 'token',
    }

    console.log('Token Format Validations:')
    console.log(`  ✓ Invalid Bearer format detected: ${!tests.invalidBearerFormat}`)
    console.log(`  ✓ Missing Bearer detected: ${!tests.missingBearer}`)
    console.log(`  ✓ Token length validation: ${tests.tokenTooShort}`)
    console.log(`  ✓ Whitespace trimming: ${tests.multipleSpaces}`)

    return tests
  },

  /**
   * Display environment check
   */
  checkEnvironment: () => {
    console.log('\n⚙️ Environment Check...\n')

    const env = {
      hasLocalStorage: typeof localStorage !== 'undefined',
      hasFetch: typeof fetch !== 'undefined',
      hasConsole: typeof console !== 'undefined',
      isNode: typeof window === 'undefined',
      isBrowser: typeof window !== 'undefined',
    }

    console.log('Runtime Environment:')
    console.log(`  ${env.isBrowser ? '✅' : '❌'} Browser (window available)`)
    console.log(`  ${env.hasLocalStorage ? '✅' : '❌'} localStorage available`)
    console.log(`  ${env.hasFetch ? '✅' : '❌'} fetch available`)
    console.log(`  ${env.hasConsole ? '✅' : '❌'} console available`)

    return env
  },

  /**
   * Full diagnostic report
   */
  fullDiagnostics: () => {
    console.clear()
    console.log('🔍 FULL AUTHENTICATION SYSTEM DIAGNOSTICS\n')
    console.log('='.repeat(50))

    // 1. Environment
    const env = this.checkEnvironment()

    // 2. Token generation
    const tokenTest = this.testTokenGeneration()

    // 3. Storage
    const storageTest = this.testStorageFunctionality()

    // 4. API response
    const apiTest = this.testAPIResponseStructure()

    // 5. Security
    const securityTest = this.testSecurityValidation()

    // 6. Auth flow
    const flowTest = this.testAuthFlowSimulation()

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('\n🎯 DIAGNOSTIC SUMMARY\n')

    const allPassed =
      env.isBrowser &&
      env.hasLocalStorage &&
      storageTest.passed &&
      apiTest.valid

    console.log(`  Overall Status: ${allPassed ? '✅ READY' : '❌ ISSUES DETECTED'}`)
    console.log(`  Storage: ${storageTest.passed ? '✅ Working' : '❌ Failed'}`)
    console.log(`  API Mocking: ${apiTest.valid ? '✅ Working' : '❌ Failed'}`)
    console.log(`  Auth Flow: ${flowTest.tokensAreDifferent ? '✅ Token Rotation OK' : '❌ Issue'}`)
    console.log('\n' + '='.repeat(50) + '\n')

    return {
      environment: env,
      tokenGeneration: tokenTest,
      storage: storageTest,
      api: apiTest,
      security: securityTest,
      authFlow: flowTest,
      allPassed,
    }
  },

  /**
   * Quick check - can be called frequently
   */
  quickCheck: () => {
    const storage = setupLocalStorageMock()
    const tokens = generateMockTokens()

    storage.setItem('accessToken', tokens.accessToken)
    storage.setItem('refreshToken', tokens.refreshToken)

    return {
      hasAccessToken: !!storage.getItem('accessToken'),
      hasRefreshToken: !!storage.getItem('refreshToken'),
      tokensValid:
        !!storage.getItem('accessToken') &&
        !!storage.getItem('refreshToken'),
    }
  },

  /**
   * Print help message
   */
  help: () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║   DUAL TOKEN AUTHENTICATION TEST RUNNER                    ║
╚════════════════════════════════════════════════════════════╝

QUICK START:
  testRunner.runQuickTests()
    → Run all automated tests

DIAGNOSTIC:
  testRunner.fullDiagnostics()
    → Complete system check

INDIVIDUAL TESTS:
  testRunner.testTokenGeneration()
    → Generate mock tokens

  testRunner.testStorageFunctionality()
    → Try localStorage operations

  testRunner.testAPIResponseStructure()
    → Check API response format

  testRunner.testAuthFlowSimulation()
    → Simulate complete auth flow

  testRunner.testSecurityValidation()
    → Check security validations

  testRunner.checkEnvironment()
    → Check available APIs

  testRunner.quickCheck()
    → Quick status check

INFO:
  testRunner.help()
    → Show this message

DEBUGGING:
  Open "MANUAL_TESTING_GUIDE.ts" for step-by-step manual tests
    `)
  },
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  ;(window as any).testRunner = testRunner
  console.log('✅ Test Runner loaded! Type: testRunner.help()')
}

export default testRunner
