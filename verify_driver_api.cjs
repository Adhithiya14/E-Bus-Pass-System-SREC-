const http = require('http');

const test = (name, options, payload) => {
    return new Promise((resolve) => {
        console.log(`Testing: ${name}...`);
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: options.path,
            method: options.method,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`✅ ${name} passed.`);
                    resolve(JSON.parse(data));
                } else {
                    console.error(`❌ ${name} failed with status ${res.statusCode}: ${data}`);
                    resolve(null);
                }
            });
        });

        req.on('error', (err) => {
            console.error(`❌ ${name} failed: ${err.message}`);
            resolve(null);
        });

        if (payload) req.write(JSON.stringify(payload));
        req.end();
    });
};

async function runTests() {
    console.log("Starting Driver API Verification...\n");

    // 1. Test Driver Registration
    const regData = await test('Driver Registration', { path: '/api/register', method: 'POST' }, {
        name: 'New Driver',
        email: `driver_${Date.now()}@srec.edu`,
        password: 'password123',
        role: 'driver',
        phone_number: '9876543210',
        bus_number: 'TN-37-G-999',
        route_number: '999'
    });

    if (!regData) return;

    // 2. Test Driver Login
    const loginData = await test('Driver Login', { path: '/api/login', method: 'POST' }, {
        email: 'driver@srec.edu',
        password: 'driver123',
        role: 'driver'
    });

    if (!loginData) return;

    const driverId = loginData.user.id;
    const token = loginData.token;
    const headers = { 'Authorization': `Bearer ${token}` };

    // 2. Test Bus Details
    await test('Fetch Bus Details', { path: `/api/driver/bus-details/${driverId}`, method: 'GET', headers });

    // 3. Test Student List
    await test('Fetch Students', { path: `/api/driver/students/101`, method: 'GET', headers });

    // 4. Test Trip Status
    await test('Check Trip Status', { path: `/api/driver/trip/status/${driverId}`, method: 'GET', headers });

    // 5. Test Start Trip
    await test('Start Trip', { path: '/api/driver/trip/action', method: 'POST', headers }, {
        driverId,
        action: 'start',
        busNumber: 'TN-37-G-101',
        routeNumber: '101',
        tripType: 'Morning'
    });

    // 6. Test End Trip
    await test('End Trip', { path: '/api/driver/trip/action', method: 'POST', headers }, {
        driverId,
        action: 'end'
    });

    // 7. Test Notifications
    await test('Fetch Notifications', { path: '/api/driver/notifications', method: 'GET', headers });

    console.log("\nVerification Finished.");
}

runTests();
