QRide – Smart Campus Bus Pass Management System

QRide is a web-based smart campus bus pass management system developed for Sri Ramakrishna Engineering College (SREC).
It digitizes the complete bus pass lifecycle — issuance, renewal, verification, and route management — using QR code–based validation, making the system secure, efficient, and fully paperless.

Project Objective

The goal of QRide is to eliminate manual bus pass handling and introduce a secure, transparent, and automated system that benefits students, bus checkers, and administrators by:

Reducing paperwork

Preventing pass misuse

Enabling real-time verification

Simplifying fee and route management


Key Features

Student Module

Student registration with profile photo

Digital bus pass with unique Pass ID

QR code–based bus pass

Regular bus pass fee payment

Pay-per-ride tickets for occasional travel

Hosteller Lite Pass support

Emergency pass generation

Route flexibility & alternate bus travel

View pass status (Active / Expired / Pending)

QR scanner to verify pass validity

Admin Module

Admin dashboard for verification & approval

Approve / reject bus pass applications

Manage students, routes, and buses

View fee defaulters

Identify expired passes

Download reports (PDF) for:

Fee defaulters

Expired passes

Generate QR codes for validation

Notification alerts for upcoming pass expiry

Checker / Verification Support

QR code validation for pass authenticity

Real-time verification of:

Valid student

Expired pass

Invalid or fake pass

System Highlights

Fully paperless bus pass system

Secure QR code–based validation

Role-based access (Student / Admin)

Real-time pass verification

Scalable and modular architecture

Technologies Used

Frontend

React.js

Vite

HTML5

CSS3

JavaScript

Backend

Node.js

Express.js

Database

SQLite (Local database)

Other Tools

QR Code generation & scanning

Git & GitHub for version control

Project Structure (Overview)

QRide/
│
├── server/                 # Backend (Express + SQLite)
│   ├── index.cjs
│   ├── database.cjs
│   └── qride.db
│
├── src/                    # Frontend (React)
│   ├── components/
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── package.json
├── vite.config.js
└── README.md


How to Run the Project

Prerequisites

Ensure the following are installed on your system:

Node.js (v16 or above)

npm

Git (optional)

Step 1: Clone the Repository

/// 
git clone https://github.com/Adhithiya14/E-Bus-Pass-System-SREC-.git
///

Step 2: Navigate to Project Folder

///
cd E-Bus-Pass-System-SREC-
///

Step 3: Install Dependencies

///b
npm install
///

Step 4: Start Backend Server

Open Terminal 1 and run:

///
npm run server
///
Keep this terminal running 

Step 5: Start Frontend Server

Open Terminal 2 and run:

npm run dev

Application URL

http://localhost:5173

Important Notes

Backend must be running before accessing the frontend

node_modules are not included in the repository

SQLite database runs locally (qride.db)

QR verification works only when backend APIs are active

Default admin credentials (if any) are configured in backend

Future Enhancements

Online payment gateway integration

Mobile application support

Email / SMS notifications

Cloud database deployment

Analytics dashboard for admin

 Developed For

Sri Ramakrishna Engineering College (SREC)
Smart Campus Transportation Management

Conclusion

QRide provides a secure, scalable, and efficient solution for managing campus transportation digitally.
By integrating QR-based validation and role-based dashboards, it significantly improves transparency, security, and ease of use for all stakeholders.
