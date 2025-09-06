const express = require("express");

const app = express();

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for Vercel deployment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Simple test endpoint for debugging
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!", timestamp: new Date().toISOString() });
});

// Basic employees endpoint to test
app.get("/api/employees", (req, res) => {
  // Return demo data for now
  res.json([
    {
      id: "emp-1",
      firstName: "Muhammad Hamza",
      lastName: "Anis",
      email: "mhamza292156@gmail.com",
      phone: "801-724-6600 x 123",
      jobTitle: "HR Administrator",
      department: "Human Resources",
      location: "Chicago, IL",
      hireDate: "2022-10-11"
    }
  ]);
});

// Export as Vercel serverless function
module.exports = app;
