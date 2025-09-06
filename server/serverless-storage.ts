import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import {
  type Employee,
  type InsertEmployee,
  type Education,
  type InsertEducation,
  type EmploymentHistory,
  type InsertEmploymentHistory,
  type Compensation,
  type InsertCompensation,
  type TimeOff,
  type InsertTimeOff,
  type Document,
  type InsertDocument,
  type Benefit,
  type InsertBenefit,
  type Training,
  type InsertTraining,
  type Asset,
  type InsertAsset,
  type Note,
  type InsertNote,
  type EmergencyContact,
  type InsertEmergencyContact,
  type Dependent,
  type InsertDependent,
  type Onboarding,
  type InsertOnboarding,
  type Offboarding,
  type InsertOffboarding,
  type Bonus,
  type InsertBonus
} from "@shared/schema";
import { randomUUID } from "crypto";
import { IStorage } from "./storage";

interface StorageData {
  employees: Record<string, Employee>;
  education: Record<string, Education>;
  employmentHistory: Record<string, EmploymentHistory>;
  compensation: Record<string, Compensation>;
  timeOff: Record<string, TimeOff>;
  documents: Record<string, Document>;
  benefits: Record<string, Benefit>;
  training: Record<string, Training>;
  assets: Record<string, Asset>;
  notes: Record<string, Note>;
  emergencyContacts: Record<string, EmergencyContact>;
  dependents: Record<string, Dependent>;
  onboarding: Record<string, Onboarding>;
  offboarding: Record<string, Offboarding>;
  bonuses: Record<string, Bonus>;
}

export class ServerlessFileStorage implements IStorage {
  private dataPath: string;
  private memoryStorage: StorageData | null = null;

  constructor() {
    // In serverless environment, use /tmp for temporary storage
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    if (isServerless) {
      this.dataPath = "/tmp/storage.json";
    } else {
      this.dataPath = join(process.cwd(), "data", "storage.json");
    }
  }

  private loadData(): StorageData {
    // If we have memory storage (for serverless), use it
    if (this.memoryStorage) {
      return this.memoryStorage;
    }

    try {
      // Try to read from file system first
      if (existsSync(this.dataPath)) {
        const data = readFileSync(this.dataPath, "utf-8");
        const parsed = JSON.parse(data);
        this.memoryStorage = parsed;
        return parsed;
      }
      
      // If file doesn't exist, try to read from the original data directory
      const originalPath = join(process.cwd(), "data", "storage.json");
      if (existsSync(originalPath)) {
        const data = readFileSync(originalPath, "utf-8");
        const parsed = JSON.parse(data);
        this.memoryStorage = parsed;
        return parsed;
      }
    } catch (error) {
      console.error("Error loading storage data:", error);
    }

    // Return empty structure if no data found
    const emptyData: StorageData = {
      employees: {},
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
    
    this.memoryStorage = emptyData;
    return emptyData;
  }

  private saveData(data: StorageData): void {
    // Update memory storage
    this.memoryStorage = data;
    
    // In serverless environment, we can't persist to file system
    // For demo purposes, changes will only persist in memory during the request
    try {
      const dir = join(this.dataPath, "..");
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      // Ignore file system errors in serverless environment
      console.warn("Unable to save to file system (serverless environment)");
    }
  }

  // Employee operations
  async getEmployee(id: string): Promise<Employee | undefined> {
    const data = this.loadData();
    return data.employees[id];
  }

  async getEmployees(): Promise<Employee[]> {
    const data = this.loadData();
    return Object.values(data.employees);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const data = this.loadData();
    const id = randomUUID();
    const newEmployee: Employee = { ...employee, id };
    data.employees[id] = newEmployee;
    this.saveData(data);
    return newEmployee;
  }

  async updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee> {
    const data = this.loadData();
    const existing = data.employees[id];
    if (!existing) {
      throw new Error(`Employee with id ${id} not found`);
    }
    const updated = { ...existing, ...employee };
    data.employees[id] = updated;
    this.saveData(data);
    return updated;
  }

  async deleteEmployee(id: string): Promise<void> {
    const data = this.loadData();
    delete data.employees[id];
    this.saveData(data);
  }

  async updateJobInfo(employeeId: string, jobInfo: Partial<Employee>): Promise<Employee> {
    return this.updateEmployee(employeeId, jobInfo);
  }

  // Education operations
  async getEducationByEmployeeId(employeeId: string): Promise<Education[]> {
    const data = this.loadData();
    return Object.values(data.education).filter(edu => edu.employeeId === employeeId);
  }

  async createEducation(education: InsertEducation): Promise<Education> {
    const data = this.loadData();
    const id = randomUUID();
    const newEducation: Education = { ...education, id };
    data.education[id] = newEducation;
    this.saveData(data);
    return newEducation;
  }

  async updateEducation(id: string, education: Partial<InsertEducation>): Promise<Education> {
    const data = this.loadData();
    const existing = data.education[id];
    if (!existing) {
      throw new Error(`Education with id ${id} not found`);
    }
    const updated = { ...existing, ...education };
    data.education[id] = updated;
    this.saveData(data);
    return updated;
  }

  async deleteEducation(id: string): Promise<void> {
    const data = this.loadData();
    delete data.education[id];
    this.saveData(data);
  }

  // Add placeholder implementations for other methods...
  // (I'll add the most commonly used ones, but you can extend this as needed)

  async getEmploymentHistoryByEmployeeId(employeeId: string): Promise<EmploymentHistory[]> {
    const data = this.loadData();
    return Object.values(data.employmentHistory).filter(emp => emp.employeeId === employeeId);
  }

  async createEmploymentHistory(employment: InsertEmploymentHistory): Promise<EmploymentHistory> {
    const data = this.loadData();
    const id = randomUUID();
    const newEmployment: EmploymentHistory = { ...employment, id };
    data.employmentHistory[id] = newEmployment;
    this.saveData(data);
    return newEmployment;
  }

  // Add other methods as needed...
  // For brevity, I'm adding placeholder implementations
  async updateEmploymentHistory(id: string, employment: Partial<InsertEmploymentHistory>): Promise<EmploymentHistory> { throw new Error("Not implemented"); }
  async deleteEmploymentHistory(id: string): Promise<void> { throw new Error("Not implemented"); }
  async getCompensationByEmployeeId(employeeId: string): Promise<Compensation[]> { return []; }
  async createCompensation(compensation: InsertCompensation): Promise<Compensation> { throw new Error("Not implemented"); }
  async updateCompensation(id: string, compensation: Partial<InsertCompensation>): Promise<Compensation> { throw new Error("Not implemented"); }
  async deleteCompensation(id: string): Promise<void> { throw new Error("Not implemented"); }
  async getTimeOffByEmployeeId(employeeId: string): Promise<TimeOff[]> { return []; }
  async createTimeOff(timeOff: InsertTimeOff): Promise<TimeOff> { throw new Error("Not implemented"); }
  async updateTimeOff(id: string, timeOff: Partial<InsertTimeOff>): Promise<TimeOff> { throw new Error("Not implemented"); }
  async deleteTimeOff(id: string): Promise<void> { throw new Error("Not implemented"); }
  async getDocumentsByEmployeeId(employeeId: string): Promise<Document[]> { return []; }
  async createDocument(document: InsertDocument): Promise<Document> { throw new Error("Not implemented"); }
  async updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document> { throw new Error("Not implemented"); }
  async deleteDocument(id: string): Promise<void> { throw new Error("Not implemented"); }
  async getBenefitsByEmployeeId(employeeId: string): Promise<Benefit[]> { return []; }
  async createBenefit(benefit: InsertBenefit): Promise<Benefit> { throw new Error("Not implemented"); }
  async updateBenefit(id: string, benefit: Partial<InsertBenefit>): Promise<Benefit> { throw new Error("Not implemented"); }
  async deleteBenefit(id: string): Promise<void> { throw new Error("Not implemented"); }
  async getTrainingByEmployeeId(employeeId: string): Promise<Training[]> { return []; }
  async createTraining(training: InsertTraining): Promise<Training> { throw new Error("Not implemented"); }
  async updateTraining(id: string, training: Partial<InsertTraining>): Promise<Training> { throw new Error("Not implemented"); }
  async deleteTraining(id: string): Promise<void> { throw new Error("Not implemented"); }
  async getAssetsByEmployeeId(employeeId: string): Promise<Asset[]> { return []; }
  async createAsset(asset: InsertAsset): Promise<Asset> { throw new Error("Not implemented"); }
  async updateAsset(id: string, asset: Partial<InsertAsset>): Promise<Asset> { throw new Error("Not implemented"); }
  async deleteAsset(id: string): Promise<void> { throw new Error("Not implemented"); }
  async getNotesByEmployeeId(employeeId: string): Promise<Note[]> { return []; }
  async createNote(note: InsertNote): Promise<Note> { throw new Error("Not implemented"); }
  async updateNote(id: string, note: Partial<InsertNote>): Promise<Note> { throw new Error("Not implemented"); }
  async deleteNote(id: string): Promise<void> { throw new Error("Not implemented"); }
  async getEmergencyContactsByEmployeeId(employeeId: string): Promise<EmergencyContact[]> { return []; }
  async createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact> { throw new Error("Not implemented"); }
  async updateEmergencyContact(id: string, contact: Partial<InsertEmergencyContact>): Promise<EmergencyContact> { throw new Error("Not implemented"); }
  async deleteEmergencyContact(id: string): Promise<void> { throw new Error("Not implemented"); }
  async getDependentsByEmployeeId(employeeId: string): Promise<Dependent[]> { return []; }
  async createDependent(dependent: InsertDependent): Promise<Dependent> { throw new Error("Not implemented"); }
  async updateDependent(id: string, dependent: Partial<InsertDependent>): Promise<Dependent> { throw new Error("Not implemented"); }
  async deleteDependent(id: string): Promise<void> { throw new Error("Not implemented"); }
  async getOnboardingByEmployeeId(employeeId: string): Promise<Onboarding[]> { return []; }
  async createOnboarding(onboarding: InsertOnboarding): Promise<Onboarding> { throw new Error("Not implemented"); }
  async updateOnboarding(id: string, onboarding: Partial<InsertOnboarding>): Promise<Onboarding> { throw new Error("Not implemented"); }
  async deleteOnboarding(id: string): Promise<void> { throw new Error("Not implemented"); }
  async getOffboardingByEmployeeId(employeeId: string): Promise<Offboarding[]> { return []; }
  async createOffboarding(offboarding: InsertOffboarding): Promise<Offboarding> { throw new Error("Not implemented"); }
  async updateOffboarding(id: string, offboarding: Partial<InsertOffboarding>): Promise<Offboarding> { throw new Error("Not implemented"); }
  async deleteOffboarding(id: string): Promise<void> { throw new Error("Not implemented"); }
  async getBonusesByEmployeeId(employeeId: string): Promise<Bonus[]> { return []; }
  async createBonus(bonus: InsertBonus): Promise<Bonus> { throw new Error("Not implemented"); }
  async updateBonus(id: string, bonus: Partial<InsertBonus>): Promise<Bonus> { throw new Error("Not implemented"); }
  async deleteBonus(id: string): Promise<void> { throw new Error("Not implemented"); }
}
