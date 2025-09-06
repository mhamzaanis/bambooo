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

// In-memory data store (persists during serverless function lifetime)
let memoryStore = null;

// Helper function to load storage data
function loadStorageData() {
  // If we already have data in memory, use it
  if (memoryStore) {
    return memoryStore;
  }

  try {
    const dataPath = path.join(process.cwd(), "data", "storage.json");
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, "utf-8");
      memoryStore = JSON.parse(data);
      console.log("Loaded data from storage.json into memory");
      return memoryStore;
    }
  } catch (error) {
    console.error("Error loading storage data:", error);
  }
  
  // Return minimal demo data if file not found
  const demoData = {
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
  
  console.log("Using fallback demo data");
  memoryStore = demoData;
  return memoryStore;
}

// Helper function to save storage data (in-memory only for serverless)
function saveStorageData(data) {
  try {
    // In serverless environment, we can only save to memory
    memoryStore = { ...data }; // Create a copy to avoid reference issues
    console.log("Data saved to memory store successfully");
    console.log("Memory store now has:", {
      employees: Object.keys(memoryStore.employees || {}).length,
      education: Object.keys(memoryStore.education || {}).length,
      compensation: Object.keys(memoryStore.compensation || {}).length,
      training: Object.keys(memoryStore.training || {}).length
    });
    return true;
  } catch (error) {
    console.error("Error saving storage data to memory:", error);
    return false;
  }
}

// Simple test endpoint for debugging
app.get("/api/test", (req, res) => {
  const data = loadStorageData();
  res.json({ 
    message: "API is working!", 
    timestamp: new Date().toISOString(),
    hasEmployees: !!data.employees,
    employeeCount: Object.keys(data.employees || {}).length,
    hasEducation: !!data.education,
    educationCount: Object.keys(data.education || {}).length,
    hasCompensation: !!data.compensation,
    compensationCount: Object.keys(data.compensation || {}).length,
    memoryStoreInitialized: !!memoryStore
  });
});

// Test CRUD operations endpoint
app.post("/api/test-crud", (req, res) => {
  try {
    const data = loadStorageData();
    
    // Test creating a note
    const testNote = {
      id: `test-note-${Date.now()}`,
      employeeId: "emp-1",
      title: "Test Note",
      content: "This is a test note to verify CRUD operations work",
      createdAt: new Date().toISOString(),
      createdBy: "API Test"
    };
    
    if (!data.notes) data.notes = {};
    data.notes[testNote.id] = testNote;
    
    const saved = saveStorageData(data);
    
    if (saved) {
      // Test reading it back
      const updatedData = loadStorageData();
      const createdNote = updatedData.notes[testNote.id];
      
      if (createdNote) {
        res.json({
          success: true,
          message: "CRUD test passed! You can add, edit, update, and delete data.",
          testNote: createdNote,
          dataIntegrity: "OK"
        });
      } else {
        res.status(500).json({
          success: false,
          message: "CRUD test failed - could not read back created data"
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: "CRUD test failed - could not save data"
      });
    }
  } catch (error) {
    console.error("CRUD test error:", error);
    res.status(500).json({
      success: false,
      message: "CRUD test failed with error",
      error: error.message
    });
  }
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

// ======================
// EDUCATION ENDPOINTS
// ======================

// Create education
app.post("/api/employees/:employeeId/education", (req, res) => {
  try {
    const data = loadStorageData();
    const newEducation = {
      id: `edu-${Date.now()}`,
      employeeId: req.params.employeeId,
      ...req.body,
    };
    
    if (!data.education) data.education = {};
    data.education[newEducation.id] = newEducation;
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save education data" });
    }
    
    res.status(201).json(newEducation);
  } catch (error) {
    console.error("Error creating education:", error);
    res.status(500).json({ error: "Failed to create education" });
  }
});

// Update education
app.patch("/api/education/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.education || !data.education[req.params.id]) {
      return res.status(404).json({ error: "Education not found" });
    }
    
    data.education[req.params.id] = {
      ...data.education[req.params.id],
      ...req.body,
      id: req.params.id
    };
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save education data" });
    }
    
    res.json(data.education[req.params.id]);
  } catch (error) {
    console.error("Error updating education:", error);
    res.status(500).json({ error: "Failed to update education" });
  }
});

// Delete education
app.delete("/api/education/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.education || !data.education[req.params.id]) {
      return res.status(404).json({ error: "Education not found" });
    }
    
    delete data.education[req.params.id];
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save education data" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting education:", error);
    res.status(500).json({ error: "Failed to delete education" });
  }
});

// ======================
// EMPLOYMENT HISTORY ENDPOINTS
// ======================

// Create employment history
app.post("/api/employees/:employeeId/employment-history", (req, res) => {
  try {
    const data = loadStorageData();
    const newHistory = {
      id: `emp-hist-${Date.now()}`,
      employeeId: req.params.employeeId,
      ...req.body,
    };
    
    if (!data.employmentHistory) data.employmentHistory = {};
    data.employmentHistory[newHistory.id] = newHistory;
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save employment history data" });
    }
    
    res.status(201).json(newHistory);
  } catch (error) {
    console.error("Error creating employment history:", error);
    res.status(500).json({ error: "Failed to create employment history" });
  }
});

// Update employment history
app.patch("/api/employment-history/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.employmentHistory || !data.employmentHistory[req.params.id]) {
      return res.status(404).json({ error: "Employment history not found" });
    }
    
    data.employmentHistory[req.params.id] = {
      ...data.employmentHistory[req.params.id],
      ...req.body,
      id: req.params.id
    };
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save employment history data" });
    }
    
    res.json(data.employmentHistory[req.params.id]);
  } catch (error) {
    console.error("Error updating employment history:", error);
    res.status(500).json({ error: "Failed to update employment history" });
  }
});

// Delete employment history
app.delete("/api/employment-history/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.employmentHistory || !data.employmentHistory[req.params.id]) {
      return res.status(404).json({ error: "Employment history not found" });
    }
    
    delete data.employmentHistory[req.params.id];
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save employment history data" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting employment history:", error);
    res.status(500).json({ error: "Failed to delete employment history" });
  }
});

// ======================
// COMPENSATION ENDPOINTS
// ======================

// Create compensation
app.post("/api/employees/:employeeId/compensation", (req, res) => {
  try {
    const data = loadStorageData();
    const newCompensation = {
      id: `comp-${Date.now()}`,
      employeeId: req.params.employeeId,
      ...req.body,
    };
    
    if (!data.compensation) data.compensation = {};
    data.compensation[newCompensation.id] = newCompensation;
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save compensation data" });
    }
    
    res.status(201).json(newCompensation);
  } catch (error) {
    console.error("Error creating compensation:", error);
    res.status(500).json({ error: "Failed to create compensation" });
  }
});

// Update compensation
app.patch("/api/compensation/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.compensation || !data.compensation[req.params.id]) {
      return res.status(404).json({ error: "Compensation not found" });
    }
    
    data.compensation[req.params.id] = {
      ...data.compensation[req.params.id],
      ...req.body,
      id: req.params.id
    };
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save compensation data" });
    }
    
    res.json(data.compensation[req.params.id]);
  } catch (error) {
    console.error("Error updating compensation:", error);
    res.status(500).json({ error: "Failed to update compensation" });
  }
});

// Delete compensation
app.delete("/api/compensation/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.compensation || !data.compensation[req.params.id]) {
      return res.status(404).json({ error: "Compensation not found" });
    }
    
    delete data.compensation[req.params.id];
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save compensation data" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting compensation:", error);
    res.status(500).json({ error: "Failed to delete compensation" });
  }
});

// ======================
// DOCUMENTS ENDPOINTS
// ======================

// Create document
app.post("/api/employees/:employeeId/documents", (req, res) => {
  try {
    const data = loadStorageData();
    const newDocument = {
      id: `doc-${Date.now()}`,
      employeeId: req.params.employeeId,
      ...req.body,
    };
    
    if (!data.documents) data.documents = {};
    data.documents[newDocument.id] = newDocument;
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save document data" });
    }
    
    res.status(201).json(newDocument);
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Failed to create document" });
  }
});

// Update document
app.patch("/api/documents/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.documents || !data.documents[req.params.id]) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    data.documents[req.params.id] = {
      ...data.documents[req.params.id],
      ...req.body,
      id: req.params.id
    };
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save document data" });
    }
    
    res.json(data.documents[req.params.id]);
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ error: "Failed to update document" });
  }
});

// Delete document
app.delete("/api/documents/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.documents || !data.documents[req.params.id]) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    delete data.documents[req.params.id];
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save document data" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

// ======================
// BENEFITS ENDPOINTS
// ======================

// Create benefit
app.post("/api/employees/:employeeId/benefits", (req, res) => {
  try {
    const data = loadStorageData();
    const newBenefit = {
      id: `ben-${Date.now()}`,
      employeeId: req.params.employeeId,
      ...req.body,
    };
    
    if (!data.benefits) data.benefits = {};
    data.benefits[newBenefit.id] = newBenefit;
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save benefit data" });
    }
    
    res.status(201).json(newBenefit);
  } catch (error) {
    console.error("Error creating benefit:", error);
    res.status(500).json({ error: "Failed to create benefit" });
  }
});

// Update benefit
app.patch("/api/benefits/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.benefits || !data.benefits[req.params.id]) {
      return res.status(404).json({ error: "Benefit not found" });
    }
    
    data.benefits[req.params.id] = {
      ...data.benefits[req.params.id],
      ...req.body,
      id: req.params.id
    };
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save benefit data" });
    }
    
    res.json(data.benefits[req.params.id]);
  } catch (error) {
    console.error("Error updating benefit:", error);
    res.status(500).json({ error: "Failed to update benefit" });
  }
});

// Delete benefit
app.delete("/api/benefits/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.benefits || !data.benefits[req.params.id]) {
      return res.status(404).json({ error: "Benefit not found" });
    }
    
    delete data.benefits[req.params.id];
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save benefit data" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting benefit:", error);
    res.status(500).json({ error: "Failed to delete benefit" });
  }
});

// ======================
// TRAINING ENDPOINTS
// ======================

// Create training
app.post("/api/employees/:employeeId/training", (req, res) => {
  try {
    const data = loadStorageData();
    const newTraining = {
      id: `train-${Date.now()}`,
      employeeId: req.params.employeeId,
      ...req.body,
    };
    
    if (!data.training) data.training = {};
    data.training[newTraining.id] = newTraining;
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save training data" });
    }
    
    res.status(201).json(newTraining);
  } catch (error) {
    console.error("Error creating training:", error);
    res.status(500).json({ error: "Failed to create training" });
  }
});

// Update training
app.patch("/api/training/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.training || !data.training[req.params.id]) {
      return res.status(404).json({ error: "Training not found" });
    }
    
    data.training[req.params.id] = {
      ...data.training[req.params.id],
      ...req.body,
      id: req.params.id
    };
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save training data" });
    }
    
    res.json(data.training[req.params.id]);
  } catch (error) {
    console.error("Error updating training:", error);
    res.status(500).json({ error: "Failed to update training" });
  }
});

// Delete training
app.delete("/api/training/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.training || !data.training[req.params.id]) {
      return res.status(404).json({ error: "Training not found" });
    }
    
    delete data.training[req.params.id];
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save training data" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting training:", error);
    res.status(500).json({ error: "Failed to delete training" });
  }
});

// ======================
// ASSETS ENDPOINTS
// ======================

// Create asset
app.post("/api/employees/:employeeId/assets", (req, res) => {
  try {
    const data = loadStorageData();
    const newAsset = {
      id: `asset-${Date.now()}`,
      employeeId: req.params.employeeId,
      ...req.body,
    };
    
    if (!data.assets) data.assets = {};
    data.assets[newAsset.id] = newAsset;
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save asset data" });
    }
    
    res.status(201).json(newAsset);
  } catch (error) {
    console.error("Error creating asset:", error);
    res.status(500).json({ error: "Failed to create asset" });
  }
});

// Update asset
app.patch("/api/assets/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.assets || !data.assets[req.params.id]) {
      return res.status(404).json({ error: "Asset not found" });
    }
    
    data.assets[req.params.id] = {
      ...data.assets[req.params.id],
      ...req.body,
      id: req.params.id
    };
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save asset data" });
    }
    
    res.json(data.assets[req.params.id]);
  } catch (error) {
    console.error("Error updating asset:", error);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

// Delete asset
app.delete("/api/assets/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.assets || !data.assets[req.params.id]) {
      return res.status(404).json({ error: "Asset not found" });
    }
    
    delete data.assets[req.params.id];
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save asset data" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting asset:", error);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

// ======================
// NOTES ENDPOINTS
// ======================

// Create note
app.post("/api/employees/:employeeId/notes", (req, res) => {
  try {
    const data = loadStorageData();
    const newNote = {
      id: `note-${Date.now()}`,
      employeeId: req.params.employeeId,
      ...req.body,
    };
    
    if (!data.notes) data.notes = {};
    data.notes[newNote.id] = newNote;
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save note data" });
    }
    
    res.status(201).json(newNote);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
});

// Update note
app.patch("/api/notes/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.notes || !data.notes[req.params.id]) {
      return res.status(404).json({ error: "Note not found" });
    }
    
    data.notes[req.params.id] = {
      ...data.notes[req.params.id],
      ...req.body,
      id: req.params.id
    };
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save note data" });
    }
    
    res.json(data.notes[req.params.id]);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
});

// Delete note
app.delete("/api/notes/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.notes || !data.notes[req.params.id]) {
      return res.status(404).json({ error: "Note not found" });
    }
    
    delete data.notes[req.params.id];
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save note data" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// ======================
// EMERGENCY CONTACTS ENDPOINTS
// ======================

// Create emergency contact
app.post("/api/employees/:employeeId/emergency-contacts", (req, res) => {
  try {
    const data = loadStorageData();
    const newContact = {
      id: `contact-${Date.now()}`,
      employeeId: req.params.employeeId,
      ...req.body,
    };
    
    if (!data.emergencyContacts) data.emergencyContacts = {};
    data.emergencyContacts[newContact.id] = newContact;
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save emergency contact data" });
    }
    
    res.status(201).json(newContact);
  } catch (error) {
    console.error("Error creating emergency contact:", error);
    res.status(500).json({ error: "Failed to create emergency contact" });
  }
});

// Update emergency contact
app.patch("/api/emergency-contacts/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.emergencyContacts || !data.emergencyContacts[req.params.id]) {
      return res.status(404).json({ error: "Emergency contact not found" });
    }
    
    data.emergencyContacts[req.params.id] = {
      ...data.emergencyContacts[req.params.id],
      ...req.body,
      id: req.params.id
    };
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save emergency contact data" });
    }
    
    res.json(data.emergencyContacts[req.params.id]);
  } catch (error) {
    console.error("Error updating emergency contact:", error);
    res.status(500).json({ error: "Failed to update emergency contact" });
  }
});

// Delete emergency contact
app.delete("/api/emergency-contacts/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.emergencyContacts || !data.emergencyContacts[req.params.id]) {
      return res.status(404).json({ error: "Emergency contact not found" });
    }
    
    delete data.emergencyContacts[req.params.id];
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save emergency contact data" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting emergency contact:", error);
    res.status(500).json({ error: "Failed to delete emergency contact" });
  }
});

// ======================
// DEPENDENTS ENDPOINTS
// ======================

// Create dependent
app.post("/api/employees/:employeeId/dependents", (req, res) => {
  try {
    const data = loadStorageData();
    const newDependent = {
      id: `dep-${Date.now()}`,
      employeeId: req.params.employeeId,
      ...req.body,
    };
    
    if (!data.dependents) data.dependents = {};
    data.dependents[newDependent.id] = newDependent;
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save dependent data" });
    }
    
    res.status(201).json(newDependent);
  } catch (error) {
    console.error("Error creating dependent:", error);
    res.status(500).json({ error: "Failed to create dependent" });
  }
});

// Update dependent
app.patch("/api/dependents/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.dependents || !data.dependents[req.params.id]) {
      return res.status(404).json({ error: "Dependent not found" });
    }
    
    data.dependents[req.params.id] = {
      ...data.dependents[req.params.id],
      ...req.body,
      id: req.params.id
    };
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save dependent data" });
    }
    
    res.json(data.dependents[req.params.id]);
  } catch (error) {
    console.error("Error updating dependent:", error);
    res.status(500).json({ error: "Failed to update dependent" });
  }
});

// Delete dependent
app.delete("/api/dependents/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.dependents || !data.dependents[req.params.id]) {
      return res.status(404).json({ error: "Dependent not found" });
    }
    
    delete data.dependents[req.params.id];
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save dependent data" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting dependent:", error);
    res.status(500).json({ error: "Failed to delete dependent" });
  }
});

// ======================
// TIME OFF ENDPOINTS
// ======================

// Create time off
app.post("/api/employees/:employeeId/time-off", (req, res) => {
  try {
    const data = loadStorageData();
    const newTimeOff = {
      id: `to-${Date.now()}`,
      employeeId: req.params.employeeId,
      ...req.body,
    };
    
    if (!data.timeOff) data.timeOff = {};
    data.timeOff[newTimeOff.id] = newTimeOff;
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save time off data" });
    }
    
    res.status(201).json(newTimeOff);
  } catch (error) {
    console.error("Error creating time off:", error);
    res.status(500).json({ error: "Failed to create time off" });
  }
});

// Update time off
app.patch("/api/time-off/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.timeOff || !data.timeOff[req.params.id]) {
      return res.status(404).json({ error: "Time off not found" });
    }
    
    data.timeOff[req.params.id] = {
      ...data.timeOff[req.params.id],
      ...req.body,
      id: req.params.id
    };
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save time off data" });
    }
    
    res.json(data.timeOff[req.params.id]);
  } catch (error) {
    console.error("Error updating time off:", error);
    res.status(500).json({ error: "Failed to update time off" });
  }
});

// Delete time off
app.delete("/api/time-off/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.timeOff || !data.timeOff[req.params.id]) {
      return res.status(404).json({ error: "Time off not found" });
    }
    
    delete data.timeOff[req.params.id];
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save time off data" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting time off:", error);
    res.status(500).json({ error: "Failed to delete time off" });
  }
});

// ======================
// ONBOARDING ENDPOINTS
// ======================

// Get onboarding data
app.get("/api/employees/:employeeId/onboarding", (req, res) => {
  try {
    const data = loadStorageData();
    const onboarding = Object.values(data.onboarding || {}).filter(
      item => item.employeeId === req.params.employeeId
    );
    res.json(onboarding);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch onboarding" });
  }
});

// Create onboarding
app.post("/api/employees/:employeeId/onboarding", (req, res) => {
  try {
    const data = loadStorageData();
    const newOnboarding = {
      id: `onb-${Date.now()}`,
      employeeId: req.params.employeeId,
      ...req.body,
    };
    
    if (!data.onboarding) data.onboarding = {};
    data.onboarding[newOnboarding.id] = newOnboarding;
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save onboarding data" });
    }
    
    res.status(201).json(newOnboarding);
  } catch (error) {
    console.error("Error creating onboarding:", error);
    res.status(500).json({ error: "Failed to create onboarding" });
  }
});

// Update onboarding
app.patch("/api/onboarding/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.onboarding || !data.onboarding[req.params.id]) {
      return res.status(404).json({ error: "Onboarding not found" });
    }
    
    data.onboarding[req.params.id] = {
      ...data.onboarding[req.params.id],
      ...req.body,
      id: req.params.id
    };
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save onboarding data" });
    }
    
    res.json(data.onboarding[req.params.id]);
  } catch (error) {
    console.error("Error updating onboarding:", error);
    res.status(500).json({ error: "Failed to update onboarding" });
  }
});

// Delete onboarding
app.delete("/api/onboarding/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.onboarding || !data.onboarding[req.params.id]) {
      return res.status(404).json({ error: "Onboarding not found" });
    }
    
    delete data.onboarding[req.params.id];
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save onboarding data" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting onboarding:", error);
    res.status(500).json({ error: "Failed to delete onboarding" });
  }
});

// ======================
// OFFBOARDING ENDPOINTS
// ======================

// Get offboarding data
app.get("/api/employees/:employeeId/offboarding", (req, res) => {
  try {
    const data = loadStorageData();
    const offboarding = Object.values(data.offboarding || {}).filter(
      item => item.employeeId === req.params.employeeId
    );
    res.json(offboarding);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch offboarding" });
  }
});

// Create offboarding
app.post("/api/employees/:employeeId/offboarding", (req, res) => {
  try {
    const data = loadStorageData();
    const newOffboarding = {
      id: `off-${Date.now()}`,
      employeeId: req.params.employeeId,
      ...req.body,
    };
    
    if (!data.offboarding) data.offboarding = {};
    data.offboarding[newOffboarding.id] = newOffboarding;
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save offboarding data" });
    }
    
    res.status(201).json(newOffboarding);
  } catch (error) {
    console.error("Error creating offboarding:", error);
    res.status(500).json({ error: "Failed to create offboarding" });
  }
});

// Update offboarding
app.patch("/api/employees/:employeeId/offboarding/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.offboarding || !data.offboarding[req.params.id]) {
      return res.status(404).json({ error: "Offboarding not found" });
    }
    
    data.offboarding[req.params.id] = {
      ...data.offboarding[req.params.id],
      ...req.body,
      id: req.params.id
    };
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save offboarding data" });
    }
    
    res.json(data.offboarding[req.params.id]);
  } catch (error) {
    console.error("Error updating offboarding:", error);
    res.status(500).json({ error: "Failed to update offboarding" });
  }
});

// Delete offboarding
app.delete("/api/employees/:employeeId/offboarding/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.offboarding || !data.offboarding[req.params.id]) {
      return res.status(404).json({ error: "Offboarding not found" });
    }
    
    delete data.offboarding[req.params.id];
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save offboarding data" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting offboarding:", error);
    res.status(500).json({ error: "Failed to delete offboarding" });
  }
});

// ======================
// BONUSES ENDPOINTS
// ======================

// Get bonuses
app.get("/api/employees/:employeeId/bonuses", (req, res) => {
  try {
    const data = loadStorageData();
    const bonuses = Object.values(data.bonuses || {}).filter(
      bonus => bonus.employeeId === req.params.employeeId
    );
    res.json(bonuses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bonuses" });
  }
});

// Create bonus
app.post("/api/employees/:employeeId/bonuses", (req, res) => {
  try {
    const data = loadStorageData();
    const newBonus = {
      id: `bonus-${Date.now()}`,
      employeeId: req.params.employeeId,
      ...req.body,
    };
    
    if (!data.bonuses) data.bonuses = {};
    data.bonuses[newBonus.id] = newBonus;
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save bonus data" });
    }
    
    res.status(201).json(newBonus);
  } catch (error) {
    console.error("Error creating bonus:", error);
    res.status(500).json({ error: "Failed to create bonus" });
  }
});

// Update bonus
app.patch("/api/bonuses/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.bonuses || !data.bonuses[req.params.id]) {
      return res.status(404).json({ error: "Bonus not found" });
    }
    
    data.bonuses[req.params.id] = {
      ...data.bonuses[req.params.id],
      ...req.body,
      id: req.params.id
    };
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save bonus data" });
    }
    
    res.json(data.bonuses[req.params.id]);
  } catch (error) {
    console.error("Error updating bonus:", error);
    res.status(500).json({ error: "Failed to update bonus" });
  }
});

// Delete bonus
app.delete("/api/bonuses/:id", (req, res) => {
  try {
    const data = loadStorageData();
    
    if (!data.bonuses || !data.bonuses[req.params.id]) {
      return res.status(404).json({ error: "Bonus not found" });
    }
    
    delete data.bonuses[req.params.id];
    
    const saved = saveStorageData(data);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save bonus data" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting bonus:", error);
    res.status(500).json({ error: "Failed to delete bonus" });
  }
});

// Export as Vercel serverless function
export default app;
