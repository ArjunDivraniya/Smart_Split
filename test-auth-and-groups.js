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

async function testAuthAndGroups() {
  try {
    // Step 1: Register a test user
    console.log('📝 Registering test user...');
    const registerRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'arjundiv@test.com',
      password: 'TestPassword123',
      name: 'Test User'
    });

    console.log(`Register Status: ${registerRes.status}`);
    console.log('Register Response:', JSON.stringify(registerRes.body, null, 2));

    if (registerRes.status === 400 && registerRes.body.message === 'User already exists') {
      console.log('ℹ️  User already exists, proceeding to login...');
    } else if (registerRes.status !== 201) {
      console.error('✗ Registration failed!');
      return;
    } else {
      console.log('✅ User registered successfully!');
    }

    // Step 1.5: Login to get token
    console.log('\n🔐 Logging in to get token...');
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'arjundiv@test.com',
      password: 'TestPassword123'
    });

    console.log(`Login Status: ${loginRes.status}`);
    console.log('Login Response:', JSON.stringify(loginRes.body, null, 2));

    if (loginRes.status !== 200) {
      console.error('✗ Login failed!');
      return;
    }

    const token = loginRes.body.token;
    console.log(`\n✅ Token received: ${token.substring(0, 50)}...`);

    // Step 2: Use token to fetch groups
    console.log('\n📥 Fetching groups with token...');
    const groupsRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/groups',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Groups Status: ${groupsRes.status}`);
    console.log('Groups Response:', JSON.stringify(groupsRes.body, null, 2));

    if (groupsRes.status === 200 && groupsRes.body.data) {
      console.log(`\n✅ SUCCESS! Found ${groupsRes.body.data.length} groups`);
    } else {
      console.log(`\n✗ Failed to fetch groups`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAuthAndGroups();
