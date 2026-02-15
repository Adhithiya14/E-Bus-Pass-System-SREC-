const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'server/qride.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. Create a Defaulter Student (Pending Payment)
    db.run("INSERT INTO users (name, email, password, role, roll_number, department, year, phone_number) VALUES ('Test Defaulter', 'defaulter@test.com', 'hashedpassword', 'student', 'DEF001', 'CSE', '1st Year', '1234567890')", function (err) {
        if (!err) {
            const userId = this.lastID;
            console.log("Created Defaulter User ID:", userId);
            // Link a pending pass to them
            // Needs a valid route number, let's use 101
            db.run("INSERT INTO passes (user_id, status, payment_status, amount, pass_type, route_number, boarding_point, valid_until) VALUES (?, 'pending', 'pending', 50, 'ticket', '101', 'Test Stop', '2026-12-31')", [userId]);
            db.run("INSERT INTO credentials (user_id, email, password) VALUES (?, 'defaulter@test.com', 'hashedpassword')", [userId]);
        }
    });

    // 2. Create an Expired Student
    db.run("INSERT INTO users (name, email, password, role, roll_number, department, year, phone_number) VALUES ('Test Expired', 'expired@test.com', 'hashedpassword', 'student', 'EXP001', 'ECE', '2nd Year', '0987654321')", function (err) {
        if (!err) {
            const userId = this.lastID;
            console.log("Created Expired User ID:", userId);
            // Link an expired pass
            db.run("INSERT INTO passes (user_id, status, payment_status, amount, pass_type, route_number, boarding_point, valid_until) VALUES (?, 'expired', 'paid', 50, 'ticket', '101', 'Old Stop', '2025-01-01')", [userId]);
            db.run("INSERT INTO credentials (user_id, email, password) VALUES (?, 'expired@test.com', 'hashedpassword')", [userId]);
        }
    });
});

setTimeout(() => {
    db.close();
    console.log("Test data created.");
}, 2000);
