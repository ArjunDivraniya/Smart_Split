const http = require('http');

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data),
            headers: res.headers
          });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testWithGroupOwner() {
  try {
    // Login with the test user first to get a token
    const testUserLogin = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'arjundiv@test.com',
      password: 'TestPassword123'
    });

    const testToken = testUserLogin.body.token;
    console.log('Test user logged in with ID: 699d6d10931f8cd8644b9695');
    
    // Try to fetch all groups (public endpoint - let me check if it exists)
    const allGroupsRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/groups/debug/all-groups',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (allGroupsRes.status === 200) {
      const groups = allGroupsRes.body.groups || [];
      const creatorId = groups[0]?.createdBy;
      console.log(`\nFound ${groups.length} groups created by: ${creatorId}`);
      
      // Now the crucial question: How do we get the email of the user with ID 699bd16eaec2026404d5ecc9?
      // Maybe there's a user endpoint or we need to check the database directly
      
      console.log('\n🔍 Looking for endpoint to get user by ID...');
      // Try to get user info
      const userInfoRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: `/api/users/${creatorId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('User info endpoint response:', userInfoRes.status);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testWithGroupOwner();
