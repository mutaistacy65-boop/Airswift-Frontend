# Application Form Submission - Debug Guide

## Issues Fixed

### 1. **Improved Frontend Error Handling**
   - Changed from axios to native fetch for FormData
   - Added detailed console logging of errors
   - Shows actual server error messages instead of generic messages
   - Logs full error details for debugging

### 2. **Enhanced Backend Error Logging**
   - Better error messages for form parsing failures
   - Specific authentication error messages
   - File upload error details
   - Detailed error context logging

### 3. **Better Validation**
   - Added comprehensive step 3 validation
   - Clear validation error messages
   - Validation logging for debugging

## How to Debug Submission Errors

### Step 1: Open Browser Developer Tools
1. Press `F12` or right-click → "Inspect"
2. Go to **Console** tab
3. Go to **Network** tab

### Step 2: Fill Out and Submit the Form
1. Fill in all required fields
2. Upload Passport (PDF)
3. Upload CV (PDF)
4. Click "Submit Application"

### Step 3: Check Console for Errors
Look for these console messages:

```
SUBMITTING APPLICATION: {
  jobIdToSend: "...",
  nationalId: "...",
  phone: "...",
  hasPassport: true,
  hasCv: true,
}
```

### Step 4: Check Network Tab
1. Look for a POST request to `/api/applications`
2. Check Response tab to see server response
3. Common status codes:
   - **400**: Validation error (check error message)
   - **401**: Authentication failed - log in again
   - **500**: Server error - check server logs

### Common Error Solutions

#### Error: "Unauthorized - please log in again"
**Solution**: 
- Check if you're logged in
- Clear localStorage: `localStorage.clear()` in console
- Log out and log in again

#### Error: "Already applied for this job"
**Solution**: 
- You can only apply once per job
- Try applying to a different job

#### Error: "Passport and CV are required"
**Solution**:
- Make sure both files are selected
- Check file sizes (keep under 5MB for each)
- Ensure files are PDF format

#### Error: "File upload failed"
**Solution**:
- Check file permissions on server
- Verify file sizes
- Try different PDF files

#### Error: "Invalid job ID format"
**Solution**:
- Make sure the job ID is valid
- Check if the job exists in the system
- Try selecting from the dropdown if available

## Server-Side Debugging

### Check Backend Logs
Run this command to see the backend server output:
```bash
# Check for recent logs
tail -f /path/to/backend/logs

# OR if using Docker
docker logs <container-name> -f
```

### Test API Manually
```bash
# Get auth token
curl -X GET http://localhost:3000/api/auth/user \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check if authenticated
echo "Auth token: $YOUR_TOKEN"
```

## Common Causes of "Error submitting application"

1. **Files not uploading properly**
   - Check browser console for file errors
   - Verify file sizes and formats

2. **Authentication expired**
   - Session timeout
   - Token invalid
   - Solution: Log in again

3. **Server connectivity issues**
   - Backend server down
   - Network timeout
   - Check backend logs

4. **Database issues**
   - MongoDB connection failure
   - Database full
   - Duplicate entry error

5. **File system issues**
   - No disk space
   - Permission denied
   - File system full

## Enabling Verbose Logging

### Add this to browser console to see all requests:
```javascript
// Intercept fetch to log all requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch request:', args);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('Fetch response:', response.status, response.statusText);
      return response;
    })
    .catch(error => {
      console.error('Fetch error:', error);
      throw error;
    });
};
```

## Next Steps

1. Try submitting the form again
2. Check console for detailed error message
3. Share the error message and network response from step 4
4. If still failing, check backend server logs

---

**Still having issues?** 
- Clear browser cache: Ctrl+Shift+Delete
- Hard refresh: Ctrl+F5
- Try incognito/private mode
- Check internet connection
