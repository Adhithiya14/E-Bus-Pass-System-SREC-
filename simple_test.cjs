const http = require('http');

const data = JSON.stringify({
    name: 'Test Driver',
    email: 'testdriver@example.com',
    password: 'password123',
    role: 'driver',
    phone_number: '1234567890',
    bus_number: 'BUS-123',
    route_number: 'R-123'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
