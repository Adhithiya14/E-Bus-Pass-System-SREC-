# Student Dashboard Documentation & Technical Report

## 1. Overview
The **Student Dashboard** is a core component of the **QRide** E-Bus Pass System. It serves as the central hub for students to manage their transport profiles, view their bus pass status, apply for new passes, and access route information. The system is designed with a modern, responsive user interface and a robust backend to ensure secure data handling.

## 2. How It Works

The system operates on a **Client-Server Architecture**.

### **2.1 Workflow Overview**
1.  **Authentication**:
    - Student logs in via the `LoginModal`.
    - Credentials are sent to the backend (`/login` endpoint).
    - If valid, the server returns a JWT, which the client stores (e.g., in localStorage) to maintain the session.

2.  **Dashboard Initialization**:
    - Upon loading `StudentDashboard.jsx`, the app fetches the student's profile and pass status from the backend using the stored token.
    - The UI renders dynamically based on the state (e.g., showing a "No Active Pass" card or the actual "Digital Bus Pass").

3.  **Applying for a Pass**:
    - The `Apply for New Pass` button triggers the `ApplyPassModal`.
    - Students fill out a multi-step form (Personal Details -> Route Selection -> Payment).
    - Data is validated and sent to the backend, which creates a new entry in the `sqlite3` database with a "Pending" status.

4.  **Digital Pass Generation**:
    - Once approved, the dashboard generates a Digital Pass.
    - The **QR Code** is generated dynamically based on the Student ID or Pass ID.
    - Students can download this pass using the `html2canvas` utility, which snaps a picture of the pass UI.

### **2.2 Key System Components**

#### **Frontend Components**
- **`StudentDashboard.jsx`**:
    - The main container. Organizes the layout into a Sidebar (navigation) and Main Content (Pass Card, Profile, Routes).
- **`ApplyPassModal.jsx`**:
    - A complex, multi-step form wizard for pass applications. Handles input validation and API submission.
- **`PaymentModal.jsx`**:
    - Simulates the payment gateway interface for pass fees.

#### **Backend Structure**
- **`server/index.cjs`**:
    - The entry point. Configures the Express app, defines API routes (e.g., `/api/student/profile`, `/api/apply-pass`), and starts the server.
- **`server/database.cjs`**:
    - Manages the SQLite database connection and schema initialization (creating tables if they don't exist).
