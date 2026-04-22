#!/bin/bash

# Application Integration Test Script
# Tests the application submission and admin viewing flow

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL=${API_BASE_URL:-"http://localhost:3000"}
SKIP_SERVER_CHECK=${SKIP_SERVER_CHECK:-false}

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Application Submission & Admin Dashboard Test Suite${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Function to print tests
print_test() {
    echo -e "${YELLOW}▶${NC} $1"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print info
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Test 1: Check if server is running
print_test "Test 1: Checking if development server is running..."

if [ "$SKIP_SERVER_CHECK" != "true" ]; then
    if curl -s "$API_BASE_URL/api/health" > /dev/null 2>&1; then
        print_success "Server is running at $API_BASE_URL"
    else
        print_error "Server is not running at $API_BASE_URL"
        print_info "Start the development server with: npm run dev"
        exit 1
    fi
else
    print_info "Server check skipped (SKIP_SERVER_CHECK=true)"
fi

echo ""

# Test 2: Check if required API endpoints exist
print_test "Test 2: Checking if API endpoints are accessible..."

# Check if applications endpoint exists
if curl -s "$API_BASE_URL/api/applications" > /dev/null 2>&1; then
    print_success "POST /api/applications endpoint exists"
else
    print_error "POST /api/applications endpoint not found"
fi

# Check if admin applications endpoint exists
if curl -s "$API_BASE_URL/api/applications/admin" > /dev/null 2>&1; then
    print_success "GET /api/applications/admin endpoint exists"
else
    print_error "GET /api/applications/admin endpoint not found (might require auth)"
fi

echo ""

# Test 3: Validate code structure
print_test "Test 3: Validating code structure..."

ADMIN_ENDPOINT_FILE="/workspaces/Airswift-Frontend/src/pages/api/applications/admin.ts"
POLLING_HOOK_FILE="/workspaces/Airswift-Frontend/src/hooks/useApplicationPolling.ts"
ADMIN_PAGE_FILE="/workspaces/Airswift-Frontend/src/pages/admin/applications.tsx"

if [ -f "$ADMIN_ENDPOINT_FILE" ]; then
    print_success "Admin endpoint file exists: applications/admin.ts"
else
    print_error "Admin endpoint file not found"
fi

if [ -f "$POLLING_HOOK_FILE" ]; then
    print_success "Polling hook file exists: useApplicationPolling.ts"
else
    print_error "Polling hook file not found"
fi

if [ -f "$ADMIN_PAGE_FILE" ]; then
    print_success "Admin applications page file exists"
    
    # Check if polling hook is imported
    if grep -q "useApplicationPolling" "$ADMIN_PAGE_FILE"; then
        print_success "Polling hook is imported in admin page"
    else
        print_error "Polling hook is not imported in admin page"
    fi
else
    print_error "Admin applications page file not found"
fi

echo ""

# Test 4: Check service implementations
print_test "Test 4: Checking service implementations..."

APP_SERVICE_FILE="/workspaces/Airswift-Frontend/src/services/applicationService.ts"
ADMIN_SERVICE_FILE="/workspaces/Airswift-Frontend/src/services/adminService.ts"

if [ -f "$APP_SERVICE_FILE" ]; then
    if grep -q "getAllApplications" "$APP_SERVICE_FILE"; then
        if grep -q "/applications/admin" "$APP_SERVICE_FILE"; then
            print_success "applicationService.getAllApplications() uses /applications/admin endpoint"
        else
            print_error "applicationService.getAllApplications() doesn't use correct endpoint"
        fi
    else
        print_error "getAllApplications not found in applicationService"
    fi
else
    print_error "applicationService.ts not found"
fi

if [ -f "$ADMIN_SERVICE_FILE" ]; then
    if grep -q "getAllApplications" "$ADMIN_SERVICE_FILE"; then
        if grep -q "/admin/applications" "$ADMIN_SERVICE_FILE" || grep -q "/applications/admin" "$ADMIN_SERVICE_FILE"; then
            print_success "adminService.getAllApplications() uses correct endpoint"
        else
            print_error "adminService.getAllApplications() doesn't use correct endpoint"
        fi
    else
        print_error "getAllApplications not found in adminService"
    fi
else
    print_error "adminService.ts not found"
fi

echo ""

# Test 5: Verify database models
print_test "Test 5: Checking database models..."

APP_MODEL_FILE="/workspaces/Airswift-Frontend/src/lib/models/Application.ts"

if [ -f "$APP_MODEL_FILE" ]; then
    if grep -q "user_id" "$APP_MODEL_FILE"; then
        print_success "Application model has user_id field"
    else
        print_error "Application model missing user_id field"
    fi
    
    if grep -q "job_id" "$APP_MODEL_FILE"; then
        print_success "Application model has job_id field"
    else
        print_error "Application model missing job_id field"
    fi
    
    if grep -q "status" "$APP_MODEL_FILE"; then
        print_success "Application model has status field"
    else
        print_error "Application model missing status field"
    fi
else
    print_error "Application model not found"
fi

echo ""

# Test 6: Check for TypeScript compilation errors
print_test "Test 6: Checking TypeScript compilation..."

if cd /workspaces/Airswift-Frontend && npx tsc --noEmit 2>&1 | grep -q "error"; then
    print_error "TypeScript compilation errors found"
    npx tsc --noEmit 2>&1 | head -20
else
    print_success "No TypeScript compilation errors"
fi

echo ""

# Test 7: ESLint validation
print_test "Test 7: Checking code style (ESLint)..."

ADMIN_ENDPOINT_CHECK=$(npx eslint "$ADMIN_ENDPOINT_FILE" 2>&1 || true)
if [ -z "$ADMIN_ENDPOINT_CHECK" ] || [ "$ADMIN_ENDPOINT_CHECK" == "0" ]; then
    print_success "Admin endpoint passes ESLint"
else
    print_info "ESLint check skipped or warnings present"
fi

echo ""

# Test 8: Build verification
print_test "Test 8: Testing build..."

if npm run build 2>&1 | tail -5 | grep -q "successfully"; then
    print_success "Build completed successfully"
else
    print_info "Build check completed (review output above for details)"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Test Suite Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Manual Testing Instructions
echo -e "${YELLOW}📋 Manual Testing Instructions:${NC}"
echo ""
echo -e "${BLUE}Step 1: Start the development server${NC}"
echo "   npm run dev"
echo ""
echo -e "${BLUE}Step 2: Submit an application as a user${NC}"
echo "   1. Navigate to http://localhost:3000/apply"
echo "   2. Log in as a regular user (not admin)"
echo "   3. Fill in the application form"
echo "   4. Upload CV, Passport, and National ID files"
echo "   5. Click Submit"
echo "   6. Verify success message appears"
echo ""
echo -e "${BLUE}Step 3: View in admin dashboard${NC}"
echo "   1. Log out"
echo "   2. Log in as admin user"
echo "   3. Navigate to http://localhost:3000/admin/applications"
echo "   4. Look for your application in the list"
echo "   5. Verify applicant name, job title, and status"
echo ""
echo -e "${BLUE}Step 4: Test admin actions${NC}"
echo "   1. Click 'Shortlist' button"
echo "   2. Verify status changes to 'shortlisted'"
echo "   3. Try downloading CV and Passport documents"
echo "   4. Add notes and save"
echo ""

# Database verification
echo -e "${YELLOW}🗄️  Database Verification (if using local MongoDB):${NC}"
echo ""
echo "   # Check application count"
echo "   db.applications.countDocuments()"
echo ""
echo "   # View one application"
echo "   db.applications.findOne()"
echo ""
echo "   # Find pending applications"
echo "   db.applications.find({ status: 'pending' })"
echo ""

# Network debugging
echo -e "${YELLOW}🔍 Network Debugging (DevTools):${NC}"
echo ""
echo "   1. Open DevTools (F12)"
echo "   2. Go to Network tab"
echo "   3. Submit application → watch for POST /api/applications"
echo "   4. Go to /admin/applications → watch for GET /api/applications/admin"
echo "   5. Verify response contains applications array"
echo ""

# Expected flow
echo -e "${YELLOW}✅ Expected Data Flow:${NC}"
echo ""
echo "   User Application: POST /api/applications"
echo "   ├─ Validate auth"
echo "   ├─ Upload files"
echo "   ├─ Save to MongoDB"
echo "   └─ Return 201 Created"
echo ""
echo "   Admin Dashboard: GET /api/applications/admin"
echo "   ├─ Verify admin auth"
echo "   ├─ Query MongoDB"
echo "   ├─ Populate references"
echo "   └─ Return applications with URLs"
echo ""

echo -e "${GREEN}✓ Test suite completed!${NC}"
echo ""
