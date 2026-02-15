const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/students',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const students = JSON.parse(data);
            console.log('Total Students:', students.length);
            if (students.length > 0) {
                // Check first student or a specific one
                const sample = students.find(s => s.payment_status) || students[0];
                console.log('Sample Student Keys:', Object.keys(sample));
                console.log('Sample Student Data:', sample);

                // Count with new fields
                const withPayment = students.filter(s => s.payment_status).length;
                const withBus = students.filter(s => s.bus_number).length;
                console.log(`Students with Payment Status: ${withPayment}`);
                console.log(`Students with Bus Number: ${withBus}`);
            } else {
                console.log("No students returned.");
            }
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw Data:', data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
