import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertEmployeeSchema,
  insertEducationSchema,
  insertEmploymentHistorySchema,
  insertCompensationSchema,
  insertTimeOffSchema,
  insertDocumentSchema,
  insertBenefitSchema,
  insertTrainingSchema,
  insertAssetSchema,
  insertNoteSchema,
  insertEmergencyContactSchema,
  insertOnboardingSchema,
  insertOffboardingSchema,
  insertBonusSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      res.status(400).json({ error: "Invalid employee data" });
    }
  });

  app.patch("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.updateEmployee(req.params.id, req.body);
      res.json(employee);
    } catch (error) {
      res.status(404).json({ error: "Employee not found" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      await storage.deleteEmployee(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: "Employee not found" });
    }
  });

  // Education routes
  app.get("/api/employees/:employeeId/education", async (req, res) => {
    try {
      const education = await storage.getEducationByEmployeeId(req.params.employeeId);
      res.json(education);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch education" });
    }
  });

  app.post("/api/employees/:employeeId/education", async (req, res) => {
    try {
      const educationData = insertEducationSchema.parse({
        ...req.body,
        employeeId: req.params.employeeId,
      });
      const education = await storage.createEducation(educationData);
      res.status(201).json(education);
    } catch (error) {
      res.status(400).json({ error: "Invalid education data" });
    }
  });

  app.patch("/api/education/:id", async (req, res) => {
    try {
      const education = await storage.updateEducation(req.params.id, req.body);
      res.json(education);
    } catch (error) {
      res.status(404).json({ error: "Education not found" });
    }
  });

  app.delete("/api/education/:id", async (req, res) => {
    try {
      await storage.deleteEducation(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: "Education not found" });
    }
  });

  //bonus 
  app.get("/api/employees/:employeeId/bonuses", async (req, res) => {
    try {
      console.log(`Handling GET /api/employees/${req.params.employeeId}/bonuses`);
      const bonuses = await storage.getBonusesByEmployeeId(req.params.employeeId);
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.json(bonuses);
    } catch (error) {
      console.error("Error in GET /api/employees/:employeeId/bonuses:", error);
      res.status(500).json({ error: "Failed to fetch bonuses" });
    }
  });

  app.post("/api/employees/:employeeId/bonuses", async (req, res) => {
    try {
      console.log(`Handling POST /api/employees/${req.params.employeeId}/bonuses`, req.body);
      const bonusData = insertBonusSchema.parse({
        ...req.body,
        employeeId: req.params.employeeId,
      });
      const bonus = await storage.createBonus(bonusData);
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.status(201).json(bonus);
    } catch (error) {
      console.error("Error in POST /api/employees/:employeeId/bonuses:", error);
      res.status(400).json({ error: "Invalid bonus data" });
    }
  });

  app.patch("/api/bonuses/:id", async (req, res) => {
    try {
      console.log(`Handling PATCH /api/bonuses/${req.params.id}`, req.body);
      const bonusData = insertBonusSchema.partial().parse(req.body);
      const bonus = await storage.updateBonus(req.params.id, bonusData);
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.json(bonus);
    } catch (error) {
      console.error("Error in PATCH /api/bonuses/:id:", error);
      res.status(404).json({ error: "Bonus not found" });
    }
  });

  app.delete("/api/bonuses/:id", async (req, res) => {
    try {
      console.log(`Handling DELETE /api/bonuses/${req.params.id}`);
      await storage.deleteBonus(req.params.id);
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.status(204).send();
    } catch (error) {
      console.error("Error in DELETE /api/bonuses/:id:", error);
      res.status(404).json({ error: "Bonus not found" });
    }
  });

  // Employment history routes
  app.get("/api/employees/:employeeId/employment-history", async (req, res) => {
  try {
    console.log("Handling GET /api/employees/:employeeId/employment-history for:", req.params.employeeId);
    const history = await storage.getEmploymentHistoryByEmployeeId(req.params.employeeId);
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.json(history);
  } catch (error) {
    console.error("Error in GET /api/employees/:employeeId/employment-history:", error);
    res.status(500).json({ error: "Failed to fetch employment history" });
  }
});

  app.post("/api/employees/:employeeId/employment-history", async (req, res) => {
  try {
    console.log("Handling POST /api/employees/:employeeId/employment-history for:", req.params.employeeId);
    const data = insertEmploymentHistorySchema.parse(req.body);
    if (data.employeeId !== req.params.employeeId) {
      return res.status(400).json({ error: "Employee ID mismatch" });
    }
    const history = await storage.createEmploymentHistory(data);
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.json(history);
  } catch (error) {
    console.error("Error in POST /api/employees/:employeeId/employment-history:", error);
    res.status(500).json({ error: "Failed to create employment history" });
  }
});

  app.patch("/api/employment-history/:id", async (req, res) => {
  try {
    console.log("Handling PATCH /api/employment-history/:id for:", req.params.id);
    const data = insertEmploymentHistorySchema.partial().parse(req.body);
    const history = await storage.updateEmploymentHistory(req.params.id, data);
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.json(history);
  } catch (error) {
    console.error("Error in PATCH /api/employment-history/:id:", error);
    res.status(500).json({ error: "Failed to update employment history" });
  }
});

  app.delete("/api/employment-history/:id", async (req, res) => {
  try {
    console.log("Handling DELETE /api/employment-history/:id for:", req.params.id);
    await storage.deleteEmploymentHistory(req.params.id);
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.status(204).send();
  } catch (error) {
    console.error("Error in DELETE /api/employment-history/:id:", error);
    res.status(500).json({ error: "Failed to delete employment history" });
  }
});

app.get("/api/employees/:employeeId/compensation", async (req, res) => {
  try {
    console.log("Handling GET /api/employees/:employeeId/compensation for:", req.params.employeeId);
    const compensation = await storage.getCompensationByEmployeeId(req.params.employeeId);
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.json(compensation);
  } catch (error) {
    console.error("Error in GET /api/employees/:employeeId/compensation:", error);
    res.status(500).json({ error: "Failed to fetch compensation" });
  }
});

app.post("/api/employees/:employeeId/compensation", async (req, res) => {
  try {
    console.log("Handling POST /api/employees/:employeeId/compensation for:", req.params.employeeId);
    const data = insertCompensationSchema.parse(req.body);
    if (data.employeeId !== req.params.employeeId) {
      return res.status(400).json({ error: "Employee ID mismatch" });
    }
    const compensation = await storage.createCompensation(data);
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.json(compensation);
  } catch (error) {
    console.error("Error in POST /api/employees/:employeeId/compensation:", error);
    res.status(500).json({ error: "Failed to create compensation" });
  }
});

app.patch("/api/compensation/:id", async (req, res) => {
  try {
    console.log("Handling PATCH /api/compensation/:id for:", req.params.id);
    const data = insertCompensationSchema.partial().parse(req.body);
    const compensation = await storage.updateCompensation(req.params.id, data);
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.json(compensation);
  } catch (error) {
    console.error("Error in PATCH /api/compensation/:id:", error);
    res.status(500).json({ error: "Failed to update compensation" });
  }
});

app.delete("/api/compensation/:id", async (req, res) => {
  try {
    console.log("Handling DELETE /api/compensation/:id for:", req.params.id);
    await storage.deleteCompensation(req.params.id);
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.status(204).send();
  } catch (error) {
    console.error("Error in DELETE /api/compensation/:id:", error);
    res.status(500).json({ error: "Failed to delete compensation" });
  }
});

  // Compensation routes
  app.get("/api/employees/:employeeId/compensation", async (req, res) => {
    try {
      const compensation = await storage.getCompensationByEmployeeId(req.params.employeeId);
      res.json(compensation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch compensation" });
    }
  });

  app.post("/api/employees/:employeeId/compensation", async (req, res) => {
    try {
      const compensationData = insertCompensationSchema.parse({
        ...req.body,
        employeeId: req.params.employeeId,
      });
      const compensation = await storage.createCompensation(compensationData);
      res.status(201).json(compensation);
    } catch (error) {
      res.status(400).json({ error: "Invalid compensation data" });
    }
  });

  app.patch("/api/compensation/:id", async (req, res) => {
    try {
      const compensation = await storage.updateCompensation(req.params.id, req.body);
      res.json(compensation);
    } catch (error) {
      res.status(404).json({ error: "Compensation not found" });
    }
  });

  app.delete("/api/compensation/:id", async (req, res) => {
    try {
      await storage.deleteCompensation(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: "Compensation not found" });
    }
  });

  // Time off routes
  app.get("/api/employees/:employeeId/time-off", async (req, res) => {
    try {
      const timeOff = await storage.getTimeOffByEmployeeId(req.params.employeeId);
      res.json(timeOff);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch time off" });
    }
  });

  app.post("/api/employees/:employeeId/time-off", async (req, res) => {
    try {
      const timeOffData = insertTimeOffSchema.parse({
        ...req.body,
        employeeId: req.params.employeeId,
      });
      const timeOff = await storage.createTimeOff(timeOffData);
      res.status(201).json(timeOff);
    } catch (error) {
      res.status(400).json({ error: "Invalid time off data" });
    }
  });

  app.patch("/api/time-off/:id", async (req, res) => {
    try {
      const timeOff = await storage.updateTimeOff(req.params.id, req.body);
      res.json(timeOff);
    } catch (error) {
      res.status(404).json({ error: "Time off not found" });
    }
  });

  app.delete("/api/time-off/:id", async (req, res) => {
    try {
      await storage.deleteTimeOff(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: "Time off not found" });
    }
  });

  // Document routes
  app.get("/api/employees/:employeeId/documents", async (req, res) => {
    try {
      const documents = await storage.getDocumentsByEmployeeId(req.params.employeeId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.post("/api/employees/:employeeId/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse({
        ...req.body,
        employeeId: req.params.employeeId,
      });
      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ error: "Invalid document data" });
    }
  });

  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.updateDocument(req.params.id, req.body);
      res.json(document);
    } catch (error) {
      res.status(404).json({ error: "Document not found" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      await storage.deleteDocument(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: "Document not found" });
    }
  });

  // Benefits routes
  app.get("/api/employees/:employeeId/benefits", async (req, res) => {
    try {
      const benefits = await storage.getBenefitsByEmployeeId(req.params.employeeId);
      res.json(benefits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch benefits" });
    }
  });

  app.post("/api/employees/:employeeId/benefits", async (req, res) => {
    try {
      const benefitData = insertBenefitSchema.parse({
        ...req.body,
        employeeId: req.params.employeeId,
      });
      const benefit = await storage.createBenefit(benefitData);
      res.status(201).json(benefit);
    } catch (error) {
      res.status(400).json({ error: "Invalid benefit data" });
    }
  });

  app.patch("/api/benefits/:id", async (req, res) => {
    try {
      const benefit = await storage.updateBenefit(req.params.id, req.body);
      res.json(benefit);
    } catch (error) {
      res.status(404).json({ error: "Benefit not found" });
    }
  });

  app.delete("/api/benefits/:id", async (req, res) => {
    try {
      await storage.deleteBenefit(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: "Benefit not found" });
    }
  });

  // Training routes
  app.get("/api/employees/:employeeId/training", async (req, res) => {
    try {
      console.log("Handling GET /api/employees/:employeeId/training for:", req.params.employeeId);
      const training = await storage.getTrainingByEmployeeId(req.params.employeeId);
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.json(training);
    } catch (error) {
      console.error("Error in GET /api/employees/:employeeId/training:", error);
      res.status(500).json({ error: "Failed to fetch training" });
    }
  });

  app.post("/api/employees/:employeeId/training", async (req, res) => {
    try {
      const trainingData = insertTrainingSchema.parse({
        ...req.body,
        employeeId: req.params.employeeId,
      });
      const training = await storage.createTraining(trainingData);
      res.status(201).json(training);
    } catch (error) {
      res.status(400).json({ error: "Invalid training data" });
    }
  });

  app.post("/api/employees/:employeeId/training", async (req, res) => {
    try {
      console.log("Handling POST /api/employees/:employeeId/training for:", req.params.employeeId);
      const data = insertTrainingSchema.parse(req.body);
      if (data.employeeId !== req.params.employeeId) {
        return res.status(400).json({ error: "Employee ID mismatch" });
      }
      const training = await storage.createTraining(data);
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.json(training);
    } catch (error) {
      console.error("Error in POST /api/employees/:employeeId/training:", error);
      res.status(500).json({ error: "Failed to create training" });
    }
  });

  app.patch("/api/training/:id", async (req, res) => {
    try {
      console.log("Handling PATCH /api/training/:id for:", req.params.id);
      const data = insertTrainingSchema.partial().parse(req.body);
      const training = await storage.updateTraining(req.params.id, data);
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.json(training);
    } catch (error) {
      console.error("Error in PATCH /api/training/:id:", error);
      res.status(500).json({ error: "Failed to update training" });
    }
  });

  app.delete("/api/training/:id", async (req, res) => {
    try {
      console.log("Handling DELETE /api/training/:id for:", req.params.id);
      await storage.deleteTraining(req.params.id);
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.status(204).send();
    } catch (error) {
      console.error("Error in DELETE /api/training/:id:", error);
      res.status(500).json({ error: "Failed to delete training" });
    }
  });

  // Assets routes
  app.get("/api/employees/:employeeId/assets", async (req, res) => {
    try {
      const assets = await storage.getAssetsByEmployeeId(req.params.employeeId);
      res.json(assets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assets" });
    }
  });

  app.post("/api/employees/:employeeId/assets", async (req, res) => {
    try {
      const assetData = insertAssetSchema.parse({
        ...req.body,
        employeeId: req.params.employeeId,
      });
      const asset = await storage.createAsset(assetData);
      res.status(201).json(asset);
    } catch (error) {
      res.status(400).json({ error: "Invalid asset data" });
    }
  });

  app.patch("/api/assets/:id", async (req, res) => {
    try {
      const asset = await storage.updateAsset(req.params.id, req.body);
      res.json(asset);
    } catch (error) {
      res.status(404).json({ error: "Asset not found" });
    }
  });

  app.delete("/api/assets/:id", async (req, res) => {
    try {
      await storage.deleteAsset(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: "Asset not found" });
    }
  });

  // Notes routes
  app.get("/api/employees/:employeeId/notes", async (req, res) => {
    try {
      const notes = await storage.getNotesByEmployeeId(req.params.employeeId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/employees/:employeeId/notes", async (req, res) => {
    try {
      const noteData = insertNoteSchema.parse({
        ...req.body,
        employeeId: req.params.employeeId,
      });
      const note = await storage.createNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  app.patch("/api/notes/:id", async (req, res) => {
    try {
      const note = await storage.updateNote(req.params.id, req.body);
      res.json(note);
    } catch (error) {
      res.status(404).json({ error: "Note not found" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      await storage.deleteNote(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: "Note not found" });
    }
  });

  // Emergency contacts routes
  app.get("/api/employees/:employeeId/emergency-contacts", async (req, res) => {
    try {
      const contacts = await storage.getEmergencyContactsByEmployeeId(req.params.employeeId);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch emergency contacts" });
    }
  });

  app.post("/api/employees/:employeeId/emergency-contacts", async (req, res) => {
    try {
      const contactData = insertEmergencyContactSchema.parse({
        ...req.body,
        employeeId: req.params.employeeId,
      });
      const contact = await storage.createEmergencyContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      res.status(400).json({ error: "Invalid emergency contact data" });
    }
  });

  app.patch("/api/emergency-contacts/:id", async (req, res) => {
    try {
      const contact = await storage.updateEmergencyContact(req.params.id, req.body);
      res.json(contact);
    } catch (error) {
      res.status(404).json({ error: "Emergency contact not found" });
    }
  });

  app.delete("/api/emergency-contacts/:id", async (req, res) => {
    try {
      await storage.deleteEmergencyContact(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: "Emergency contact not found" });
    }
  });

  // Onboarding routes
  app.get("/api/employees/:employeeId/onboarding", async (req, res) => {
    try {
      const onboarding = await storage.getOnboardingByEmployeeId(req.params.employeeId);
      res.json(onboarding);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch onboarding" });
    }
  });

  app.post("/api/employees/:employeeId/onboarding", async (req, res) => {
    try {
      const onboardingData = insertOnboardingSchema.parse({
        ...req.body,
        employeeId: req.params.employeeId,
      });
      const onboarding = await storage.createOnboarding(onboardingData);
      res.status(201).json(onboarding);
    } catch (error) {
      res.status(400).json({ error: "Invalid onboarding data" });
    }
  });

  app.patch("/api/onboarding/:id", async (req, res) => {
    try {
      const onboarding = await storage.updateOnboarding(req.params.id, req.body);
      res.json(onboarding);
    } catch (error) {
      res.status(404).json({ error: "Onboarding not found" });
    }
  });

  app.delete("/api/onboarding/:id", async (req, res) => {
    try {
      await storage.deleteOnboarding(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: "Onboarding not found" });
    }
  });

  // Offboarding routes
  app.get("/api/employees/:employeeId/offboarding", async (req, res) => {
    try {
      const offboarding = await storage.getOffboardingByEmployeeId(req.params.employeeId);
      res.json(offboarding);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch offboarding" });
    }
  });

  app.post("/api/employees/:employeeId/offboarding", async (req, res) => {
    try {
      const offboardingData = insertOffboardingSchema.parse({
        ...req.body,
        employeeId: req.params.employeeId,
      });
      const offboarding = await storage.createOffboarding(offboardingData);
      res.status(201).json(offboarding);
    } catch (error) {
      res.status(400).json({ error: "Invalid offboarding data" });
    }
  });

  app.patch("/api/offboarding/:id", async (req, res) => {
    try {
      const offboarding = await storage.updateOffboarding(req.params.id, req.body);
      res.json(offboarding);
    } catch (error) {
      res.status(404).json({ error: "Offboarding not found" });
    }
  });

  app.delete("/api/offboarding/:id", async (req, res) => {
    try {
      await storage.deleteOffboarding(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: "Offboarding not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
