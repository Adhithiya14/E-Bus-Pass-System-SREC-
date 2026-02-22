const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/route-stops/3',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('API RESPONSE STATUS:', res.statusCode);
        console.log('API RESPONSE BODY:', data);
        process.exit(0);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    process.exit(1);
});

req.end();
