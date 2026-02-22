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
    checker_id TEXT UNIQUE,
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
  db.run(`ALTER TABLE users ADD COLUMN checker_id TEXT`, (err) => { });

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
      db.run(`INSERT INTO users (name, email, password, role, checker_id) VALUES (?, ?, ?, ?, ?)`,
        ['System Admin', 'admin@srec.edu', hashedPassword, 'admin', 'CHK-ADMIN-1']);
      console.log('✅ Default Admin account seeded: admin@srec.edu / admin123');
    }
  });

  // Assign checker_id to existing admins who don't have one
  db.all(`SELECT id FROM users WHERE role = 'admin' AND checker_id IS NULL`, (err, rows) => {
    if (rows && rows.length > 0) {
      rows.forEach(row => {
        const checkerId = `CHK-AD-${row.id}-${Math.random().toString(36).substring(7).toUpperCase()}`;
        db.run(`UPDATE users SET checker_id = ? WHERE id = ?`, [checkerId, row.id]);
      });
      console.log(`✅ Assigned checker_id to ${rows.length} existing admins.`);
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
            { no: '1', name: 'Route 1', stops: 'Singanallur, Varadharajapuuram, ESI, Lions, Ramanujam Nagar, Manis theatre, Gandhimanagar, VOC Nagar, FC Godown', timings: '7.35, 7.37, 7.40, 7.42, 7.45, 7.47, 7.55, 7.58, 8.02', bus: 'TN 38 BA 6699' },
            { no: '2', name: 'Route 2', stops: 'Chinniampalayam, R.G.Pudur, Thottipalayam pirivu, Gold winner, SITRA, Mahindra Pumps, Nehru Nagar I, Nehru Nagar II, NGP, Kalapatti, VilanKuruchi', timings: '7.40, 7.42, 7.44, 7.46, 7.48, 7.50, 7.52, 7.52, 7.54, 7.58, 8.00', bus: 'TN 38 BR 1299' },
            { no: '3', name: 'Route 3', stops: 'Omni Bus Stop, Lakshmi puram, Ganapathy, ROOTS, Sanganoor, Kannappa Nagar', timings: '7.50, 7.52, 7.55, 7.58, 8.00, 8.02', bus: 'TN 38 BA 6499' },
            { no: '4', name: 'Route 4', stops: 'Nava India, ESSO Bunk, Krishnammal college, Tidel Park, Thanneer pandal, Bharathi Nagar, Cheran Ma Nagar, Water Tank', timings: '7.30, 7.32, 7.35, 7.40, 7.45, 7.46, 7.50, 8.00', bus: 'TN 38 BA 5799' },
            { no: '5', name: 'Route 5', stops: 'Peelamedu, Anna Nagar, National Model School, GRG School, Amman Kovil', timings: '7.35, 7.37, 7.40, 7.45, 8.0', bus: 'TN 38 BE 2599' },
            { no: '6', name: 'Route 6', stops: 'Sri Ramakrishna Hospital, Lakshmi Mills, Kaikadai, GKNM Hospital, Women’s Polytechnic, Gandhipuram, Cheran Nagar', timings: '7.35, 7.45, 7.50, 7.52, 7.58, 8.00, 8.10', bus: 'TN 38 AV 2867' },
            { no: '7', name: 'Route 7', stops: 'VKK Menon Road, Kalyan, Karpagam Complex, Sivananda Colony, Pudhuppalam', timings: '7.40, 7.45, 7.47, 7.55, 8.00', bus: 'TN 38 AY 4045' },
            { no: '8', name: 'Route 8', stops: 'Textool, CMS, Bharathi Nagar, Sivanandapuram, Amman Kovil, Saravanampatti, Sunnambukalvai', timings: '7.55, 8.00, 8.05, 8.10, 8.15, 8.16, 8.20', bus: 'TN 38 AL 9577' },
            { no: '9', name: 'Route 9', stops: 'Power House, Alegesan Road, Sree Valli, Eru Company, Teacher Colony', timings: '7.45, 7.50, 7.55, 8.00, 8.20', bus: 'TN 38 BP 8299' },
            { no: '10', name: 'Route 10', stops: 'Pachapalayam, Chettipalaym, Priya Nagar, LIC Colony, Selvapuram-pulimara, High School, ChettiVeedi, Theppakulam, Best Bakery', timings: '7.25, 7.27, 7.32, 7.35, 7.37, 7.40, 7.42, 7.43, 7.45', bus: 'TN 38 BP 7399' },
            { no: '11', name: 'Route 11', stops: 'Marudhamalai, Kalveerampalayam, Navavoor pirivu, Thiruvalluvar Nagar, Gopala Puram, Anna Nagar, TVS Nagar, KNG pudur', timings: '7.35, 7.40, 7.43, 7.45, 7.55, 8.00, 8.05, 8.10', bus: 'TN 38 AS 8899' },
            { no: '12', name: 'Route 12', stops: 'Vadavalli, Mullai Nagar Stop I, Mullai Nagar Stop II, Perumal kovil', timings: '7.45, 7.48, 7.50, 7.52', bus: 'TN 38 BE 2499' },
            { no: '13', name: 'Route 13', stops: 'Venkitapuram, Velandipalayam, Kovilmedu, Sivaji Colony, Poompuhar Nagar, P & T Colony, Sakthi Nagar', timings: '7.48, 7.50, 7.51, 7.52, 8.00, 8.02, 8.03', bus: 'TN 38 BA 4699' },
            { no: '14', name: 'Route 14', stops: 'R.S. Puram, Milk Depot, Lawley Road, KTVR, P & T Colony, Puliyamaram, Kavundampalayam', timings: '7.40, 7.45, 7.50, 7.55, 7.57, 8.00, 8.05', bus: 'TN 38 AV 9190' },
            { no: '15', name: 'Route 15', stops: 'Thondamuthur, Deenampalayam, Onampalayam, P.N. Pudur, Agri College-GateI, Kovilmedu, Edayarpalayam', timings: '7.30, 7.35, 7.40, 7.50, 7.52, 7.55, 8.00', bus: 'TN 38 AV 2874' },
            { no: '16', name: 'Route 16', stops: 'TVS Bus stop, Venkitapuram, Siva Sakthi Theatre, ITI, Goundar Mills', timings: '7.50, 7.55, 8.00, 8.10, 8.12', bus: 'TN 28 L 2566' },
            { no: '17', name: 'Route 17', stops: 'LMW, Lions Club, Gas Company, NSN Palayam, Raaki Palayam, Thoppampatti Pirivu, NGGO Colony – Gate', timings: '7.55, 8.00, 8.02, 8.10, 8.12, 8.15, 8.20', bus: 'TN 38 BR 1499' },
            { no: '18', name: 'Route 18', stops: 'Veerapandi Pirivu, Pricol, Thirumurugan Nagar', timings: '7.55, 8.00, 8.15', bus: 'TN 38 AC 2700' },
            { no: '19', name: 'Route 19', stops: 'Annur Bus Stop, Karuna Theatre, KG School, KariamPalayam, EllamPalayam, Ganeshapuram, Kunnathur, KovilPalayam I, KovilPalayam II, Kottai Pirivu, Kottai, Vaiyampalayam, Idigarai', timings: '7.35, 7.37, 7.40, 7.45, 7.47, 7.50, 7.55, 8.00, 8.02, 8.10, 8.15, 8.20, 8.22', bus: 'TN 38 AY 3951' },
            { no: '20', name: 'Route 20', stops: 'Mettupalayam, Annai Velankanni', timings: '7.35, 7.45', bus: 'TN 38 BA 4899' },
            { no: '21', name: 'Route 21', stops: 'Co-op Colony, Meenakshi Hospital, CTC, Kuttayur, Gandhi Nagar, EB Colony, Teachers Colony, Union Office, Karamadai Bus stand, Jothipuram', timings: '7.30, 7.32, 7.33, 7.38, 7.40, 7.42, 7.44, 7.50, 7.55, 8.10', bus: 'BA 6399' },
            { no: '22', name: 'Route 22', stops: 'Karamadai, RV College, Bettathapuram, Thanneer pandal, Kottaipirivu, Mathampalayam, Shanthi Medu, Press colony, Thiruvalluvar Nagar', timings: '7.40, 7.41, 7.43, 7.45, 7.47, 7.50, 7.55, 7.57, 8.00', bus: 'TN 38 AE 9468' },
            { no: '23', name: 'Route 23', stops: 'Vannan Kovil, Perianaicken Palayam', timings: '7.55, 8.00', bus: 'TN 38 BR 2199' },
            { no: '24', name: 'Route 24', stops: 'Perks School, Sowripalayam I, Sowripalayam II, Udayampalayam, Meena Estate, Puliyakulam, Ramanathapuram, Thomas Park, Central Theatre', timings: '7.30, 7.33, 7.34, 7.37, 7.40, 7.42, 7.45, 7.50, 8.00', bus: 'TN 38 BR 1699' },
            { no: '25', name: 'Route 25', stops: 'Sundakkamuthur, Ever Bright, Om Sakthi Nagar, TVS Matric. School, Kulathupalayam, VLB College, Kovaipudhur pirivu, B.K. Pudhur, Vijayalakshmi Mills, Edayarpalayam pirivu, Kuniamuthur, Athupalam', timings: '7.25, 7.28, 7.30, 7.32, 7.35, 7.37, 7.40, 7.42, 7.44, 7.46, 7.50, 7.53', bus: 'TN 38 BR 0799' },
            { no: '26', name: 'Route 26', stops: 'Jayendra School, Ondhipudur Raja-Rani, Shanthi Gears, Vasantha Milla, Singanallur Hous. Unit, Kulatheri, Sowripalayam pirivu', timings: '7.25, 7.30, 7.32, 7.34, 7.38, 7.40, 7.45', bus: 'TN 38 BR 1099' },
            { no: '27', name: 'Route 27', stops: 'Sulur, Ranganathapuram, Pappampatti Pirivu, Ondhipudur, Studio, Sungam, Housing Unit, Venugopal Hosital', timings: '7.10, 7.15, 7.25, 7.30, 7.40, 7.45, 8.00, 8.10', bus: 'TN 38 BP 8199' },
            { no: '28', name: 'Route 28', stops: 'Premier Mills, Othakal Mandapam, Malumichampatty, Eachanari Temple, Sundarapuram, Podanur, Ukkadam, Vysial Street, G.N.Mills', timings: '7.12, 7.15, 7.20, 7.25, 7.30, 7.45, 7.51, 7.56, 8.10', bus: 'TN 38 BR 2399' },
            { no: '29', name: 'Route 29', stops: 'DSP, Marakkadai, V.H.Road, Perumal Kovil, Flower Market, Thudiyalur, Vadamadurai, NGGO Colony', timings: '7.45, 7.50, 7.52, 7.55, 7.57, 8.15, 8.17, 8.20', bus: 'TN 38 AE 9015' }
          ];
          defaultRoutes.forEach(r => {
            db.run(`INSERT INTO bus_routes (route_number, route_name, stops, timings, bus_number) VALUES (?, ?, ?, ?, ?)`,
              [r.no, r.name, r.stops, r.timings, r.bus]);
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

  // Credentials Table
  db.run(`CREATE TABLE IF NOT EXISTS credentials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`, (err) => {
    if (!err) {
      // Data Migration: Move existing passwords/emails to credentials table
      db.all(`SELECT id, email, password FROM users WHERE email IS NOT NULL`, (err, rows) => {
        if (rows && rows.length > 0) {
          rows.forEach(user => {
            db.run(`INSERT OR IGNORE INTO credentials (user_id, email, password) VALUES (?, ?, ?)`,
              [user.id, user.email, user.password]);
          });
          console.log(`✅ Migrated ${rows.length} users to credentials table.`);
        }
      });
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

  // Drivers Table
  db.run(`CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone_number TEXT,
    bus_number TEXT,
    morning_timing TEXT,
    evening_timing TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Migration for Drivers
  db.run(`ALTER TABLE drivers ADD COLUMN morning_timing TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) console.error(err);
  });
  db.run(`ALTER TABLE drivers ADD COLUMN evening_timing TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) console.error(err);
  });


  // Seed Default Driver
  db.get(`SELECT * FROM drivers WHERE email = 'driver@srec.edu'`, async (err, row) => {
    if (!row) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('driver123', 10);
      db.run(`INSERT INTO drivers (name, email, password, phone_number, bus_number, route_number) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Senthil Kumar', 'driver@srec.edu', hashedPassword, '9876543210', 'TN-37-G-101', '101']);
      console.log('✅ Default Driver account seeded: driver@srec.edu / driver123');
    }
  });
});

module.exports = db;
