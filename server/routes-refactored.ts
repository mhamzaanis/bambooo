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
  insertDependentSchema,
  insertOnboardingSchema,
  insertOffboardingSchema,
  insertBonusSchema,
} from "@shared/schema";

// Generic route handler factory to reduce code duplication
interface ResourceConfig {
  resourceName: string;
  collectionMethod: string;
  createMethod: string;
  updateMethod: string;
  deleteMethod: string;
  insertSchema: any;
  requiresEmployeeIdMatch?: boolean;
  enableLogging?: boolean;
  enableCacheControl?: boolean;
}

function createResourceRoutes(app: Express, config: ResourceConfig) {
  const { 
    resourceName, 
    collectionMethod, 
    createMethod, 
    updateMethod, 
    deleteMethod, 
    insertSchema,
    requiresEmployeeIdMatch = false,
    enableLogging = false,
    enableCacheControl = false
  } = config;

  // GET collection route
  app.get(`/api/employees/:employeeId/${resourceName}`, async (req, res) => {
    try {
      if (enableLogging) {
        console.log(`Handling GET /api/employees/:employeeId/${resourceName} for:`, req.params.employeeId);
      }
      const data = await (storage as any)[collectionMethod](req.params.employeeId);
      if (enableCacheControl) {
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      }
      res.json(data);
    } catch (error) {
      if (enableLogging) {
        console.error(`Error in GET /api/employees/:employeeId/${resourceName}:`, error);
      }
      res.status(500).json({ error: `Failed to fetch ${resourceName}` });
    }
  });

  // POST to collection route
  app.post(`/api/employees/:employeeId/${resourceName}`, async (req, res) => {
    try {
      if (enableLogging) {
        console.log(`Handling POST /api/employees/:employeeId/${resourceName} for:`, req.params.employeeId);
      }
      
      const data = insertSchema.parse(requiresEmployeeIdMatch ? req.body : {
        ...req.body,
        employeeId: req.params.employeeId,
      });
      
      if (requiresEmployeeIdMatch && data.employeeId !== req.params.employeeId) {
        return res.status(400).json({ error: "Employee ID mismatch" });
      }
      
      const result = await (storage as any)[createMethod](data);
      if (enableCacheControl) {
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      }
      res.status(201).json(result);
    } catch (error) {
      if (enableLogging) {
        console.error(`Error in POST /api/employees/:employeeId/${resourceName}:`, error);
      }
      res.status(400).json({ error: `Invalid ${resourceName} data` });
    }
  });

  // PATCH individual item route
  app.patch(`/api/${resourceName}/:id`, async (req, res) => {
    try {
      if (enableLogging) {
        console.log(`Handling PATCH /api/${resourceName}/:id for:`, req.params.id);
      }
      const data = insertSchema.partial().parse(req.body);
      const result = await (storage as any)[updateMethod](req.params.id, data);
      if (enableCacheControl) {
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      }
      res.json(result);
    } catch (error) {
      if (enableLogging) {
        console.error(`Error in PATCH /api/${resourceName}/:id:`, error);
      }
      res.status(404).json({ error: `${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} not found` });
    }
  });

  // DELETE individual item route
  app.delete(`/api/${resourceName}/:id`, async (req, res) => {
    try {
      if (enableLogging) {
        console.log(`Handling DELETE /api/${resourceName}/:id for:`, req.params.id);
      }
      await (storage as any)[deleteMethod](req.params.id);
      if (enableCacheControl) {
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      }
      res.status(204).send();
    } catch (error) {
      if (enableLogging) {
        console.error(`Error in DELETE /api/${resourceName}/:id:`, error);
      }
      res.status(404).json({ error: `${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} not found` });
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Employees - Special case that doesn't follow standard pattern
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

  // Create all resource routes using the generic factory
  const resourceConfigs: ResourceConfig[] = [
    {
      resourceName: "education",
      collectionMethod: "getEducationByEmployeeId",
      createMethod: "createEducation",
      updateMethod: "updateEducation",
      deleteMethod: "deleteEducation",
      insertSchema: insertEducationSchema,
    },
    {
      resourceName: "employment-history",
      collectionMethod: "getEmploymentHistoryByEmployeeId",
      createMethod: "createEmploymentHistory",
      updateMethod: "updateEmploymentHistory",
      deleteMethod: "deleteEmploymentHistory",
      insertSchema: insertEmploymentHistorySchema,
    },
    {
      resourceName: "bonuses",
      collectionMethod: "getBonusesByEmployeeId",
      createMethod: "createBonus",
      updateMethod: "updateBonus",
      deleteMethod: "deleteBonus",
      insertSchema: insertBonusSchema,
    },
    {
      resourceName: "compensation",
      collectionMethod: "getCompensationByEmployeeId",
      createMethod: "createCompensation",
      updateMethod: "updateCompensation",
      deleteMethod: "deleteCompensation",
      insertSchema: insertCompensationSchema,
    },
    {
      resourceName: "time-off",
      collectionMethod: "getTimeOffByEmployeeId",
      createMethod: "createTimeOff",
      updateMethod: "updateTimeOff",
      deleteMethod: "deleteTimeOff",
      insertSchema: insertTimeOffSchema,
    },
    {
      resourceName: "documents",
      collectionMethod: "getDocumentsByEmployeeId",
      createMethod: "createDocument",
      updateMethod: "updateDocument",
      deleteMethod: "deleteDocument",
      insertSchema: insertDocumentSchema,
    },
    {
      resourceName: "benefits",
      collectionMethod: "getBenefitsByEmployeeId",
      createMethod: "createBenefit",
      updateMethod: "updateBenefit",
      deleteMethod: "deleteBenefit",
      insertSchema: insertBenefitSchema,
    },
    {
      resourceName: "dependents",
      collectionMethod: "getDependentsByEmployeeId",
      createMethod: "createDependent",
      updateMethod: "updateDependent",
      deleteMethod: "deleteDependent",
      insertSchema: insertDependentSchema,
    },
    {
      resourceName: "training",
      collectionMethod: "getTrainingByEmployeeId",
      createMethod: "createTraining",
      updateMethod: "updateTraining",
      deleteMethod: "deleteTraining",
      insertSchema: insertTrainingSchema,
    },
    {
      resourceName: "assets",
      collectionMethod: "getAssetsByEmployeeId",
      createMethod: "createAsset",
      updateMethod: "updateAsset",
      deleteMethod: "deleteAsset",
      insertSchema: insertAssetSchema,
    },
    {
      resourceName: "notes",
      collectionMethod: "getNotesByEmployeeId",
      createMethod: "createNote",
      updateMethod: "updateNote",
      deleteMethod: "deleteNote",
      insertSchema: insertNoteSchema,
    },
    {
      resourceName: "emergency-contacts",
      collectionMethod: "getEmergencyContactsByEmployeeId",
      createMethod: "createEmergencyContact",
      updateMethod: "updateEmergencyContact",
      deleteMethod: "deleteEmergencyContact",
      insertSchema: insertEmergencyContactSchema,
    },
    {
      resourceName: "onboarding",
      collectionMethod: "getOnboardingByEmployeeId",
      createMethod: "createOnboarding",
      updateMethod: "updateOnboarding",
      deleteMethod: "deleteOnboarding",
      insertSchema: insertOnboardingSchema,
      enableLogging: true,
      enableCacheControl: true,
    },
    {
      resourceName: "offboarding",
      collectionMethod: "getOffboardingByEmployeeId",
      createMethod: "createOffboarding",
      updateMethod: "updateOffboarding",
      deleteMethod: "deleteOffboarding",
      insertSchema: insertOffboardingSchema,
    },
  ];

  // Register all resource routes
  resourceConfigs.forEach(config => {
    createResourceRoutes(app, config);
  });

  const httpServer = createServer(app);
  return httpServer;
}
