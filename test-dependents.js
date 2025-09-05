const http = require('http');

// Test GET dependents
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/employees/emp-1/dependents',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`GET dependents status: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('GET response:', data);
    testPost();
  });
});

req.on('error', (error) => {
  console.error('GET error:', error);
});

req.end();

function testPost() {
  // Test POST dependent
  const postData = JSON.stringify({
    firstName: 'Test',
    lastName: 'Dependent',
    relationship: 'child',
    dateOfBirth: '2010-01-01',
    gender: 'male'
  });

  const postOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/employees/emp-1/dependents',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const postReq = http.request(postOptions, (res) => {
    console.log(`POST dependents status: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('POST response:', data);
    });
  });

  postReq.on('error', (error) => {
    console.error('POST error:', error);
  });

  postReq.write(postData);
  postReq.end();
}
