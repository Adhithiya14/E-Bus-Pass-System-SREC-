const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = path.resolve(__dirname, 'qride.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + dbPath + ': ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Initialize tables
db.serialize(() => {
  // Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('student', 'admin')) NOT NULL DEFAULT 'student',
    profile_pic TEXT,
    roll_number TEXT,
    department TEXT,
    year TEXT,
    phone_number TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Migration for existing databases
  db.run(`ALTER TABLE users ADD COLUMN profile_pic TEXT`, (err) => { });
  db.run(`ALTER TABLE users ADD COLUMN roll_number TEXT`, (err) => { });
  db.run(`ALTER TABLE users ADD COLUMN department TEXT`, (err) => { });
  db.run(`ALTER TABLE users ADD COLUMN year TEXT`, (err) => { });
  db.run(`ALTER TABLE users ADD COLUMN phone_number TEXT`, (err) => { });
  db.run(`ALTER TABLE users ADD COLUMN gender TEXT`, (err) => { });
  db.run(`ALTER TABLE users ADD COLUMN student_type TEXT`, (err) => { });
  db.run(`ALTER TABLE users ADD COLUMN bus_number TEXT`, (err) => { });
  db.run(`ALTER TABLE users ADD COLUMN bus_stop_name TEXT`, (err) => { });

  // Unique index for SREC Register Number (Roll Number)
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_roll_num ON users (roll_number) WHERE roll_number IS NOT NULL`, (err) => {
    if (err) console.error("Error creating unique index on roll_number:", err.message);
  });

  // Pass table migrations


  // Seed Admin User with hashed password
  db.get(`SELECT * FROM users WHERE email = 'admin@srec.edu'`, async (err, row) => {
    if (!row) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        ['System Admin', 'admin@srec.edu', hashedPassword, 'admin']);
      console.log('✅ Default Admin account seeded: admin@srec.edu / admin123');
    }
  });

  // Bus Routes Table
  db.run(`CREATE TABLE IF NOT EXISTS bus_routes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        route_number TEXT UNIQUE,
        route_name TEXT,
        stops TEXT,
        timings TEXT,
        bus_number TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
    if (!err) {
      // Migration for existing table
      db.all("PRAGMA table_info(bus_routes)", (err, rows) => {
        if (rows) {
          const hasTimings = rows.some(r => r.name === 'timings');
          const hasBusNum = rows.some(r => r.name === 'bus_number');
          if (!hasTimings) db.run("ALTER TABLE bus_routes ADD COLUMN timings TEXT");
          if (!hasBusNum) db.run("ALTER TABLE bus_routes ADD COLUMN bus_number TEXT");
        }
      });
      // Seed default routes
      db.get(`SELECT COUNT(*) as count FROM bus_routes`, (err, row) => {
        if (row && row.count === 0) {
          const defaultRoutes = [
            ['101', 'Green Valley Route', 'Main Gate, Library, Hostels, Sports Complex'],
            ['102', 'City Express', 'Railway Station, City Center, North Campus, Admin Block'],
            ['103', 'South Line', 'South Gate, Engineering Dept, Medical Centre, Cafeteria']
          ];
          defaultRoutes.forEach(r => {
            db.run(`INSERT INTO bus_routes (route_number, route_name, stops) VALUES (?, ?, ?)`, r);
          });
          console.log('✅ Default Bus Routes seeded');
        }
      });
    }
  });

  // Passes Table
  db.run(`CREATE TABLE IF NOT EXISTS passes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    boarding_point TEXT,
    bus_stop TEXT,
    route_number TEXT,
    duration TEXT,
    id_proof TEXT,
    photo TEXT,
    status TEXT CHECK(status IN ('pending', 'active', 'rejected', 'expired')),
    payment_status TEXT DEFAULT 'unpaid',
    amount INTEGER,
    qr_code TEXT,
    valid_until TIMESTAMP,
    rejection_reason TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`, (err) => {
    if (!err) {
      // Migration: Add rejection_reason if it doesn't exist
      db.run(`ALTER TABLE passes ADD COLUMN rejection_reason TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          // Ignore error if column already exists
        }
      });
    }
  });

  // Notifications Table
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    message TEXT,
    type TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pass_id INTEGER,
        route_id TEXT,
        scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT,
        FOREIGN KEY (pass_id) REFERENCES passes(id)
    )`);

  // Robust Migration for Passes Table (Moved to after Table Creation)
  db.all("PRAGMA table_info(passes)", (err, rows) => {
    if (rows) {
      const columns = rows.map(r => r.name);
      if (!columns.includes('status')) db.run(`ALTER TABLE passes ADD COLUMN status TEXT CHECK(status IN ('pending', 'active', 'rejected', 'expired')) DEFAULT 'pending'`);
      if (!columns.includes('boarding_point')) db.run(`ALTER TABLE passes ADD COLUMN boarding_point TEXT`);
      if (!columns.includes('bus_stop')) db.run(`ALTER TABLE passes ADD COLUMN bus_stop TEXT`);
      if (!columns.includes('duration')) db.run(`ALTER TABLE passes ADD COLUMN duration TEXT`);
      if (!columns.includes('id_proof')) db.run(`ALTER TABLE passes ADD COLUMN id_proof TEXT`);
      if (!columns.includes('photo')) db.run(`ALTER TABLE passes ADD COLUMN photo TEXT`);
      if (!columns.includes('applied_at')) db.run(`ALTER TABLE passes ADD COLUMN applied_at TIMESTAMP`);
      if (!columns.includes('payment_status')) db.run(`ALTER TABLE passes ADD COLUMN payment_status TEXT DEFAULT 'unpaid'`);
      if (!columns.includes('amount')) db.run(`ALTER TABLE passes ADD COLUMN amount INTEGER`);
      if (!columns.includes('paid_at')) db.run(`ALTER TABLE passes ADD COLUMN paid_at TIMESTAMP`);
      if (!columns.includes('qr_code')) db.run(`ALTER TABLE passes ADD COLUMN qr_code TEXT`);
      if (!columns.includes('valid_until')) db.run(`ALTER TABLE passes ADD COLUMN valid_until TIMESTAMP`);
    }
  });

  // Migration to add route_number to passes if it doesn't exist
  db.all("PRAGMA table_info(passes)", (err, rows) => {
    const hasRoute = rows.some(row => row.name === 'route_number');
    if (!hasRoute) {
      db.run("ALTER TABLE passes ADD COLUMN route_number TEXT");
    }
  });

  // UNIFIED PASS MODEL & ALTERNATIVE ACCESS MIGRATIONS
  db.all("PRAGMA table_info(passes)", (err, rows) => {
    if (rows) {
      const columns = rows.map(r => r.name);
      if (!columns.includes('pass_type')) db.run(`ALTER TABLE passes ADD COLUMN pass_type TEXT DEFAULT 'standard'`);
      if (!columns.includes('usage_limit')) db.run(`ALTER TABLE passes ADD COLUMN usage_limit INTEGER`);
      if (!columns.includes('usage_count')) db.run(`ALTER TABLE passes ADD COLUMN usage_count INTEGER DEFAULT 0`);
      if (!columns.includes('travel_date')) db.run(`ALTER TABLE passes ADD COLUMN travel_date TEXT`);
    }
  });

  // OTPs Table
  db.run(`CREATE TABLE IF NOT EXISTS otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    otp_code TEXT,
    valid_until TIMESTAMP,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Route Change Requests Table
  db.run(`CREATE TABLE IF NOT EXISTS route_change_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    original_route TEXT,
    new_route TEXT,
    travel_date TEXT,
    reason TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

module.exports = db;
