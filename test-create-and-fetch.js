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

async function testCreateAndFetchGroups() {
  try {
    // Step 1: Login
    console.log('📝 Step 1: Logging in...');
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

    if (loginRes.status !== 200) {
      console.error('✗ Login failed!');
      return;
    }

    const token = loginRes.body.token;
    const userId = loginRes.body.user.id;
    console.log(`✅ Logged in as: ${loginRes.body.user.name} (${userId})`);

    // Step 2: Create a group
    console.log('\n✨ Step 2: Creating a group...');
    const createGroupRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/groups',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, {
      name: 'Test Group 1',
      type: 'college',
      emoji: '🎉',
      description: 'A test group created programmatically'
    });

    console.log(`Create Group Status: ${createGroupRes.status}`);
    if (createGroupRes.status === 201) {
      console.log(`✅ Group created: ${createGroupRes.body.data.name}`);
    } else {
      console.log('Response:', JSON.stringify(createGroupRes.body, null, 2));
    }

    // Step 3: Create another group
    console.log('\n✨ Step 3: Creating another group...');
    const createGroup2Res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/groups',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, {
      name: 'Friend Group',
      type: 'food',
      emoji: '👥',
      description: 'Group with friends'
    });

    if (createGroup2Res.status === 201) {
      console.log(`✅ Group created: ${createGroup2Res.body.data.name}`);
    }

    // Step 4: Fetch all groups
    console.log('\n📥 Step 4: Fetching all groups...');
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
    if (groupsRes.status === 200 && groupsRes.body.data) {
      const groupCount = groupsRes.body.data.length;
      console.log(`\n✅ SUCCESS! Found ${groupCount} groups:`);
      console.log('\n📋 Sample group structure:');
      console.log(JSON.stringify(groupsRes.body.data[0], null, 2));
      
      groupsRes.body.data.forEach((group, i) => {
        const emoji = group.emoji || group.type;
        const name = group.name || 'Unknown';
        const type = group.type;
        console.log(`   ${i + 1}. ${emoji} ${name} (type: ${type})`);
      });
    } else {
      console.log('Response:', JSON.stringify(groupsRes.body, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testCreateAndFetchGroups();
