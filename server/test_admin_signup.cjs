const fetch = require('node-fetch');

async function testAdminRegistration() {
    const adminData = {
        name: "Test Admin",
        email: "test.admin" + Date.now() + "@srec.ac.in",
        password: "password123",
        role: "admin"
    };

    console.log("Testing Admin Registration with payload:", adminData);

    try {
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminData)
        });

        const result = await response.json();

        if (response.ok) {
            console.log("SUCCESS: Admin registered successfully.");
            console.log("Response:", result);
            return result.id; // user ID
        } else {
            console.error("FAILED: Admin registration failed.");
            console.error("Error Response:", result);
            process.exit(1);
        }
    } catch (error) {
        console.error("ERROR: Failed to connect or parse response.", error);
        process.exit(1);
    }
}

async function testAdminLogin(email, password) {
    console.log("\nTesting Admin Login with:", { email, password });

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role: 'admin' })
        });

        const result = await response.json();

        if (response.ok) {
            console.log("SUCCESS: Admin logged in successfully.");
            console.log("Login user details:", result.user);
        } else {
            console.error("FAILED: Admin login failed.");
            console.error("Error Response:", result);
            process.exit(1);
        }
    } catch (error) {
        console.error("ERROR: Failed to connect or parse response.", error);
        process.exit(1);
    }
}

async function run() {
    const email = "test.admin" + Date.now() + "@srec.ac.in";
    const password = "password123";

    const adminData = {
        name: "Test Admin",
        email: email,
        password: password,
        role: "admin"
    };

    console.log("--- PHASE 1: REGISTRATION ---");
    let userId;
    try {
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminData)
        });

        const result = await response.json();

        if (response.ok) {
            console.log("SUCCESS: Admin registered successfully.");
            console.log("Response:", result);
            userId = result.id;
        } else {
            console.error("FAILED: Admin registration failed.");
            console.error("Error Response:", result);
            process.exit(1);
        }
    } catch (error) {
        console.error("ERROR: Failed to connect or parse response.", error);
        process.exit(1);
    }

    console.log("\n--- PHASE 2: LOGIN ---");
    await testAdminLogin(email, password);

    // Cleanup - best effort
    console.log("\n--- CLEANUP --- (Manual check in SQLite required as no delete API exists)");
    console.log(`Test completely successful. Created user ID: ${userId} and email: ${email}`);
}

run();
