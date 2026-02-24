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

async function checkGroups() {
  try {
    // Check the public health endpoint to see if it gives us info about groups
    const healthRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/groups/health/check',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('Health Check Response:');
    console.log(JSON.stringify(healthRes.body, null, 2));
    
    // Now get token for the test user who has no groups
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

    const token = loginRes.body.token;
    
    // Try to get debug endpoint if it exists
    const debugRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/groups/debug/all-groups',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\nDebug All Groups:');
    console.log('Status:', debugRes.status);
    if (debugRes.body.data && debugRes.body.data.length > 0) {
      console.log(`Found ${debugRes.body.data.length} groups:`);
      debugRes.body.data.forEach((group, i) => {
        console.log(`\n${i + 1}. ${group.name}`);
        console.log(`   ID: ${group._id || group.id}`);
        console.log(`   Created By: ${group.createdBy._id || group.createdBy.id || group.createdBy}`);
        console.log(`   Created By Name: ${group.createdBy.name || group.createdBy}`);
      });
    } else {
      console.log('Response:', JSON.stringify(debugRes.body, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkGroups();
