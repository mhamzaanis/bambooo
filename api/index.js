import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for Vercel deployment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Helper function to load storage data
function loadStorageData() {
  try {
    const dataPath = path.join(process.cwd(), "data", "storage.json");
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading storage data:", error);
  }
  
  // Return demo data if file not found
  return {
    employees: {
      "emp-1": {
        id: "emp-1",
        firstName: "Muhammad Hamza",
        lastName: "Anis",
        email: "mhamza292156@gmail.com",
        phone: "801-724-6600 x 123",
        jobTitle: "HR Administrator",
        department: "Human Resources",
        location: "Chicago, IL",
        hireDate: "2022-10-11",
        profileData: {
          personal: {
            preferredName: "HamzaAnis",
            gender: "Male",
            dateOfBirth: "1995-03-15",
            maritalStatus: "Married",
            ssn: "555-66-6666"
          },
          address: {
            street: "123x Main Street",
            city: "Salt Lake City",
            state: "Utah",
            zipCode: "84101-5566",
            country: "Other"
          },
          contact: {
            workPhone: "(801) 724-6600",
            mobilePhone: "(801) 724-6655",
            homePhone: "(801) 724-6677",
            personalEmail: "hamza.personal@example.com"
          }
        }
      }
    },
    education: {},
    employmentHistory: {},
    compensation: {},
    timeOff: {},
    documents: {},
    benefits: {},
    training: {},
    assets: {},
    notes: {},
    emergencyContacts: {},
    dependents: {},
    onboarding: {},
    offboarding: {},
    bonuses: {}
  };
}

// Helper function to save storage data
function saveStorageData(data) {
  try {
    const dataPath = path.join(process.cwd(), "data", "storage.json");
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(dataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving storage data:", error);
    return false;
  }
}

// Simple test endpoint for debugging
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!", timestamp: new Date().toISOString() });
});

// Get all employees
app.get("/api/employees", (req, res) => {
  try {
    const data = loadStorageData();
    const employees = Object.values(data.employees || {});
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// Get single employee by ID
app.get("/api/employees/:id", (req, res) => {
  try {
    const data = loadStorageData();
    const employee = data.employees[req.params.id];
    
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    
    res.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ error: "Failed to fetch employee" });
  }
});

// Update employee by ID
app.patch("/api/employees/:id", (req, res) => {
  try {
    const data = loadStorageData();
    const employeeId = req.params.id;
    
    if (!data.employees[employeeId]) {
      return res.status(404).json({ error: "Employee not found" });
    }
    
    // Update employee data with the request body
    data.employees[employeeId] = {
      ...data.employees[employeeId],
      ...req.body,
      id: employeeId // Ensure ID remains unchanged
    };
    
    // Save the updated data back to storage
    const saved = saveStorageData(data);
    
    if (!saved) {
      return res.status(500).json({ error: "Failed to save employee data" });
    }
    
    res.json(data.employees[employeeId]);
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: "Failed to update employee" });
  }
});

// Get employee education
app.get("/api/employees/:employeeId/education", (req, res) => {
  try {
    const data = loadStorageData();
    const education = Object.values(data.education || {}).filter(
      edu => edu.employeeId === req.params.employeeId
    );
    res.json(education);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch education" });
  }
});

// Get employee employment history
app.get("/api/employees/:employeeId/employment-history", (req, res) => {
  try {
    const data = loadStorageData();
    const history = Object.values(data.employmentHistory || {}).filter(
      emp => emp.employeeId === req.params.employeeId
    );
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employment history" });
  }
});

// Get employee compensation
app.get("/api/employees/:employeeId/compensation", (req, res) => {
  try {
    const data = loadStorageData();
    const compensation = Object.values(data.compensation || {}).filter(
      comp => comp.employeeId === req.params.employeeId
    );
    res.json(compensation);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch compensation" });
  }
});

// Get employee time off
app.get("/api/employees/:employeeId/time-off", (req, res) => {
  try {
    const data = loadStorageData();
    const timeOff = Object.values(data.timeOff || {}).filter(
      to => to.employeeId === req.params.employeeId
    );
    res.json(timeOff);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch time off" });
  }
});

// Get employee documents
app.get("/api/employees/:employeeId/documents", (req, res) => {
  try {
    const data = loadStorageData();
    const documents = Object.values(data.documents || {}).filter(
      doc => doc.employeeId === req.params.employeeId
    );
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// Get employee benefits
app.get("/api/employees/:employeeId/benefits", (req, res) => {
  try {
    const data = loadStorageData();
    const benefits = Object.values(data.benefits || {}).filter(
      ben => ben.employeeId === req.params.employeeId
    );
    res.json(benefits);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch benefits" });
  }
});

// Get employee training
app.get("/api/employees/:employeeId/training", (req, res) => {
  try {
    const data = loadStorageData();
    const training = Object.values(data.training || {}).filter(
      tr => tr.employeeId === req.params.employeeId
    );
    res.json(training);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch training" });
  }
});

// Get employee assets
app.get("/api/employees/:employeeId/assets", (req, res) => {
  try {
    const data = loadStorageData();
    const assets = Object.values(data.assets || {}).filter(
      asset => asset.employeeId === req.params.employeeId
    );
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

// Get employee notes
app.get("/api/employees/:employeeId/notes", (req, res) => {
  try {
    const data = loadStorageData();
    const notes = Object.values(data.notes || {}).filter(
      note => note.employeeId === req.params.employeeId
    );
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Get employee emergency contacts
app.get("/api/employees/:employeeId/emergency-contacts", (req, res) => {
  try {
    const data = loadStorageData();
    const contacts = Object.values(data.emergencyContacts || {}).filter(
      contact => contact.employeeId === req.params.employeeId
    );
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch emergency contacts" });
  }
});

// Get employee dependents
app.get("/api/employees/:employeeId/dependents", (req, res) => {
  try {
    const data = loadStorageData();
    const dependents = Object.values(data.dependents || {}).filter(
      dep => dep.employeeId === req.params.employeeId
    );
    res.json(dependents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dependents" });
  }
});

// Export as Vercel serverless function
export default app;
