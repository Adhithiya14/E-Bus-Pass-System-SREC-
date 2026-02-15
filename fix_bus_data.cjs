const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'server/qride.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("Checking for 'TN' bus numbers...");

    // Check bus_routes
    db.all("SELECT * FROM bus_routes WHERE bus_number LIKE '%TN%' OR bus_number LIKE '%tn%'", (err, rows) => {
        if (err) console.error("Error checking routes:", err);
        else console.log("Problematic Routes found:", rows);

        if (rows && rows.length > 0) {
            console.log("Fixing routes...");
            db.run("UPDATE bus_routes SET bus_number = '1' WHERE bus_number LIKE '%TN%' OR bus_number LIKE '%tn%'", function (err) {
                if (err) console.log("Update error:", err);
                else console.log(`Updated ${this.changes} routes.`);
            });
        }
    });

    // Check passes
    db.all("SELECT * FROM passes WHERE route_number LIKE '%TN%' OR route_number LIKE '%tn%'", (err, rows) => {
        if (err) console.error("Error checking passes:", err);
        else console.log("Problematic Passes found:", rows);

        if (rows && rows.length > 0) {
            console.log("Fixing passes...");
            db.run("UPDATE passes SET route_number = '101' WHERE route_number LIKE '%TN%' OR route_number LIKE '%tn%'", function (err) {
                if (err) console.log("Update error:", err);
                else console.log(`Updated ${this.changes} passes.`);
            });
        }
    });

    // Force set all valid routes to have correct bus numbers just in case
    db.run("UPDATE bus_routes SET bus_number = '1' WHERE route_number = '101'");
    db.run("UPDATE bus_routes SET bus_number = '2' WHERE route_number = '102'");
    db.run("UPDATE bus_routes SET bus_number = '3' WHERE route_number = '103'");
    db.run("UPDATE bus_routes SET bus_number = '4' WHERE route_number = '3'"); // Route 3 gets Bus 4
    // Any other route gets default 1
    db.run("UPDATE bus_routes SET bus_number = '1' WHERE bus_number IS NULL OR length(bus_number) > 4");

});

// Close later
setTimeout(() => {
    db.close();
    console.log("Done.");
}, 3000);
