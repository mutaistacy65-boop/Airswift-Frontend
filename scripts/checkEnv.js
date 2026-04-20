#!/usr/bin/env node

/**
 * 🔍 Environment Variable Checker
 * Validates all required environment variables for application submission
 * 
 * Usage: npm run check-env
 */

const fs = require('fs');
const path = require('path');

function checkEnvironmentVariables() {
  console.log('🔍 Checking Environment Variables...\n');

  const envPath = path.join(__dirname, '.env');
  let envConfig = {};

  // Read .env file
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const [key, value] = line.split('=');
      if (key && !key.startsWith('#')) {
        envConfig[key.trim()] = value ? value.trim() : '';
      }
    });
    console.log(`✅ .env file found: ${envPath}\n`);
  } else {
    console.log(`⚠️  .env file not found: ${envPath}`);
    console.log('   Run: cp .env.example .env\n');
  }

  // Merge with process environment (process.env takes precedence)
  const finalConfig = { ...envConfig, ...process.env };

  // Required variables for application submission
  const requiredVars = {
    // Core API
    'PORT': 'API Server Port',
    'JWT_SECRET': 'JWT signing secret',

    // Database
    'MONGO_URI': 'MongoDB connection string',

    // File Storage (Cloudinary)
    'CLOUDINARY_NAME': 'Cloudinary account name',
    'CLOUDINARY_API_KEY': 'Cloudinary API key',
    'CLOUDINARY_API_SECRET': 'Cloudinary API secret',

    // Email Service (for notifications)
    'EMAIL_HOST': 'Email SMTP host',
    'EMAIL_PORT': 'Email SMTP port',
    'EMAIL_USER': 'Email SMTP username',
    'EMAIL_PASS': 'Email SMTP password',

    // AI Features (optional)
    'OPENAI_API_KEY': 'OpenAI API key (optional for CV analysis)',
  };

  const optionalVars = {
    'FRONTEND_URL': 'Frontend URL for CORS',
    'NODE_ENV': 'Environment (development/production)',
    'LOG_LEVEL': 'Logging level',
  };

  console.log('📋 REQUIRED VARIABLES FOR APPLICATION SUBMISSION:\n');

  let missingCount = 0;
  let providedCount = 0;

  Object.entries(requiredVars).forEach(([key, description]) => {
    const value = finalConfig[key] || process.env[key];
    const status = value ? '✅' : '❌';
    const displayValue = value
      ? value.length > 30
        ? value.substring(0, 20) + '...' + value.substring(value.length - 10)
        : value
      : 'NOT SET';

    console.log(`${status} ${key.padEnd(25)} | ${description}`);
    console.log(`   └─ Value: ${displayValue}`);

    if (!value) {
      missingCount++;
    } else {
      providedCount++;
    }
  });

  console.log('\n📋 OPTIONAL VARIABLES:\n');

  Object.entries(optionalVars).forEach(([key, description]) => {
    const value = finalConfig[key] || process.env[key];
    const status = value ? '✅' : '⏸️  ';

    console.log(`${status} ${key.padEnd(25)} | ${description}`);
    if (value) {
      const displayValue = value.length > 30
        ? value.substring(0, 20) + '...'
        : value;
      console.log(`   └─ Value: ${displayValue}`);
    }
  });

  console.log('\n📊 SUMMARY:\n');
  console.log(`   ✅ Provided: ${providedCount}/${Object.keys(requiredVars).length}`);
  console.log(`   ❌ Missing:  ${missingCount}/${Object.keys(requiredVars).length}`);

  if (missingCount > 0) {
    console.log('\n⚠️  MISSING CONFIGURATION:\n');
    console.log('To fix the "Error submitting application", add the missing variables to .env:\n');
    console.log('  1. Copy .env.example as a template:');
    console.log('     cp .env.example .env\n');
    console.log('  2. Fill in the following values:');

    Object.entries(requiredVars).forEach(([key]) => {
      if (!finalConfig[key] && !process.env[key]) {
        console.log(`     - ${key}`);
      }
    });

    console.log('\n  3. For Cloudinary (file upload):');
    console.log('     - Sign up: https://cloudinary.com');
    console.log('     - Get API credentials from your dashboard\n');
    console.log('  4. For Email (notifications):');
    console.log('     - Use Gmail SMTP: smtp.gmail.com');
    console.log('     - Create app-specific password: https://myaccount.google.com/apppasswords\n');

    console.log('Restart backend after updating .env:');
    console.log('  npm start\n');

    return false;
  } else {
    console.log('\n✅ All required environment variables are set!');
    console.log('   Application submission should work correctly.\n');
    return true;
  }
}

function main() {
  console.log('\n' + '═'.repeat(70));
  console.log('🔧 Environment & Configuration Check');
  console.log('═'.repeat(70) + '\n');

  const envOk = checkEnvironmentVariables();

  console.log('═'.repeat(70) + '\n');

  if (envOk) {
    console.log('✅ Everything looks good! Ready to submit applications.\n');
    process.exit(0);
  } else {
    console.log('❌ Please fix the issues above before submitting applications.\n');
    process.exit(1);
  }
}

main();
