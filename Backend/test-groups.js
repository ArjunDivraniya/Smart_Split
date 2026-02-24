// Simple test to check groups in database
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// For testing, we need a valid token. 
// Let's create one with a test user ID
const jwt = require('jsonwebtoken');

// Hardcoded test values - replace with actual data
const TEST_USER_ID = 'YOUR_USER_ID_HERE';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Create a test token
const testToken = jwt.sign(
  { userId: TEST_USER_ID, email: 'test@example.com' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('πŸ"„ Testing Groups API...\n');
console.log('Test User ID:', TEST_USER_ID);
console.log('Token:', testToken.substring(0, 50) + '...\n');

async function testAPI() {
  try {
    // Test 1: Check all groups in database (debug endpoint)
    console.log('1οΈβƒ£ Checking ALL groups in database...');
    try {
      const allGroupsRes = await axios.get(`${API_BASE}/groups/debug/all-groups`, {
        headers: { Authorization: `Bearer ${testToken}` }
      });
      console.log(`βœ… Total groups in DB: ${allGroupsRes.data.totalGroupsInDB}`);
      if (allGroupsRes.data.groups.length > 0) {
        console.log('📋 First group:', JSON.stringify(allGroupsRes.data.groups[0], null, 2));
      }
    } catch (err) {
      console.log('❌ Debug endpoint error:', err.message);
    }

    // Test 2: Get user's groups
    console.log('\n2οΈβƒ£ Fetching user groups...');
    const userGroupsRes = await axios.get(`${API_BASE}/groups`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    console.log(`βœ… User groups count: ${userGroupsRes.data.data.length}`);
    if (userGroupsRes.data.data.length > 0) {
      console.log('πŸ"' User first group:', JSON.stringify(userGroupsRes.data.data[0], null, 2));
    } else {
      console.log('β„Ή No groups found for user');
    }

  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
  }
}

testAPI();
