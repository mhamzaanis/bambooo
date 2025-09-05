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

export class FileStorage implements IStorage {
  private dataDir: string;
  private dataFile: string;
  private data: StorageData;

  constructor(dataDir = "./data") {
    this.dataDir = dataDir;
    this.dataFile = join(dataDir, "storage.json");
    
    // Ensure data directory exists
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    // Load existing data or initialize with sample data
    this.loadData();
  }

  private loadData(): void {
    try {
      if (existsSync(this.dataFile)) {
        console.log("Loading data from file:", this.dataFile);
        const fileContent = readFileSync(this.dataFile, "utf-8");
        this.data = JSON.parse(fileContent);
        
        // Convert date strings back to Date objects for employees
        Object.values(this.data.employees).forEach(employee => {
          if (employee.createdAt && typeof employee.createdAt === 'string') {
            employee.createdAt = new Date(employee.createdAt);
          }
          if (employee.updatedAt && typeof employee.updatedAt === 'string') {
            employee.updatedAt = new Date(employee.updatedAt);
          }
        });
        
        console.log("Data loaded successfully");
      } else {
        console.log("No existing data file found, initializing with sample data");
        this.initializeSampleData();
      }
    } catch (error) {
      console.error("Error loading data file:", error);
      console.log("Initializing with sample data");
      this.initializeSampleData();
    }
  }

  private saveData(): void {
    try {
      const dataToSave = JSON.stringify(this.data, null, 2);
      writeFileSync(this.dataFile, dataToSave, "utf-8");
      console.log("Data saved successfully to", this.dataFile);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }

  private initializeSampleData(): void {
    console.log("Initializing sample data");

    const sampleBonuses: Bonus[] = [
      {
        id: randomUUID(),
        employeeId: "emp-1",
        type: "Performance Bonus",
        amount: "$5000",
        frequency: "One-time",
        eligibilityDate: "2025-09-01",
        description: "For outstanding project delivery",
      },
      {
        id: randomUUID(),
        employeeId: "emp-1",
        type: "Annual Bonus",
        amount: "$10000",
        frequency: "Annual",
        eligibilityDate: "2025-12-31",
        description: "Year-end performance bonus",
      },
    ];

    const sampleTraining: Training[] = [
      {
        id: randomUUID(),
        employeeId: "emp-1",
        name: "Unlawful Harassment",
        category: "General",
        status: "Pending",
        dueDate: "2025-12-02",
        completedDate: "",
        credits: "1.0",
      },
      {
        id: randomUUID(),
        employeeId: "emp-1",
        name: "BambooHR Advantage Package Demo Video",
        category: "BambooHR Product Training",
        status: "Pending",
        dueDate: "",
        completedDate: "",
        credits: "0.5",
      },
      {
        id: randomUUID(),
        employeeId: "emp-1",
        name: "Quarterly Security Training",
        category: "BambooHR Product Training",
        status: "Pending",
        dueDate: "2025-11-18",
        completedDate: "",
        credits: "1.0",
      },
      {
        id: randomUUID(),
        employeeId: "emp-1",
        name: "Sexual Harassment Training",
        category: "Quarterly Training",
        status: "Pending",
        dueDate: "2022-11-10",
        completedDate: "",
        credits: "1.0",
      },
      {
        id: randomUUID(),
        employeeId: "emp-1",
        name: "Annual Security Training",
        category: "Required Annual Trainings",
        status: "Pending",
        dueDate: "",
        completedDate: "",
        credits: "1.0",
      },
      {
        id: randomUUID(),
        employeeId: "emp-1",
        name: "HIPAA Training",
        category: "Required Annual Trainings",
        status: "Pending",
        dueDate: "",
        completedDate: "",
        credits: "1.0",
      },
      {
        id: randomUUID(),
        employeeId: "emp-1",
        name: "OSHA Training",
        category: "Required Annual Trainings",
        status: "Pending",
        dueDate: "2022-10-14",
        completedDate: "",
        credits: "1.0",
      },
      {
        id: randomUUID(),
        employeeId: "emp-1",
        name: "Unlawful Harassment",
        category: "General",
        status: "Completed",
        dueDate: "2025-12-02",
        completedDate: "2025-12-02",
        credits: "1.0",
      },
      {
        id: randomUUID(),
        employeeId: "emp-1",
        name: "Quarterly Security Training",
        category: "BambooHR Product Training",
        status: "Completed",
        dueDate: "2025-08-19",
        completedDate: "2025-08-19",
        credits: "1.0",
      },
      {
        id: randomUUID(),
        employeeId: "emp-1",
        name: "Getting Started in BambooHR",
        category: "BambooHR Product Training",
        status: "Completed",
        dueDate: "2025-08-19",
        completedDate: "2025-08-19",
        credits: "0.5",
      },
      {
        id: randomUUID(),
        employeeId: "emp-1",
        name: "Working from home during COVID-19",
        category: "COVID-19",
        status: "Completed",
        dueDate: "2025-08-19",
        completedDate: "2025-08-19",
        credits: "0.5",
      },
    ];

    const sampleEmployee: Employee = {
      id: "emp-1",
      firstName: "Muhammad Hamza",
      lastName: "Anis",
      email: "mhamza292156@gmail.com",
      phone: "801-724-6600 x 123",
      jobTitle: "HR Administrator",
      department: "Operations",
      location: "Salt Lake City, Utah",
      hireDate: "2022-10-11",
      profileData: {
        personal: {
          preferredName: "Hamza",
          gender: "Male",
          dateOfBirth: "1995-03-15",
          maritalStatus: "Single",
        },
        address: {
          street: "123 Main Street",
          city: "Salt Lake City",
          state: "Utah",
          zipCode: "84101",
          country: "United States",
        },
        contact: {
          workPhone: "801-724-6600",
          mobilePhone: "801-724-6600",
          homePhone: "",
          personalEmail: "hamza.personal@gmail.com",
        },
        social: {
          linkedin: "https://linkedin.com/in/hamza-anis",
          twitter: "https://twitter.com/hamza_anis",
          website: "",
        },
        visa: {
          type: "US Citizen",
          status: "Active",
          expiration: "",
          sponsorshipRequired: false,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Initialize data structure
    this.data = {
      employees: { [sampleEmployee.id]: sampleEmployee },
      education: {},
      employmentHistory: {},
      compensation: {},
      timeOff: {},
      documents: {},
      benefits: {},
      training: Object.fromEntries(sampleTraining.map(t => [t.id, t])),
      assets: {},
      notes: {},
      emergencyContacts: {},
      dependents: {},
      onboarding: {},
      offboarding: {},
      bonuses: Object.fromEntries(sampleBonuses.map(b => [b.id, b])),
    };

    // Save initial data to file
    this.saveData();
    console.log("Sample data initialized and saved");
  }

  // Employee operations
  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.data.employees[id];
  }

  async getEmployees(): Promise<Employee[]> {
    return Object.values(this.data.employees);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const newEmployee: Employee = {
      ...employee,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.employees[id] = newEmployee;
    this.saveData();
    return newEmployee;
  }

  async updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee> {
    const existing = this.data.employees[id];
    if (!existing) {
      throw new Error(`Employee with id ${id} not found`);
    }
    const updated: Employee = {
      ...existing,
      ...employee,
      updatedAt: new Date(),
    };
    this.data.employees[id] = updated;
    this.saveData();
    console.log("Employee updated and saved:", updated);
    return updated;
  }

  async deleteEmployee(id: string): Promise<void> {
    delete this.data.employees[id];
    this.saveData();
  }

  // Bonus operations
  async getBonusesByEmployeeId(employeeId: string): Promise<Bonus[]> {
    return Object.values(this.data.bonuses).filter(bonus => bonus.employeeId === employeeId);
  }

  async createBonus(bonus: InsertBonus): Promise<Bonus> {
    const id = randomUUID();
    const newBonus: Bonus = { ...bonus, id };
    this.data.bonuses[id] = newBonus;
    this.saveData();
    return newBonus;
  }

  async updateBonus(id: string, bonus: Partial<InsertBonus>): Promise<Bonus> {
    const existing = this.data.bonuses[id];
    if (!existing) {
      throw new Error(`Bonus with id ${id} not found`);
    }
    const updated: Bonus = { ...existing, ...bonus };
    this.data.bonuses[id] = updated;
    this.saveData();
    return updated;
  }

  async deleteBonus(id: string): Promise<void> {
    delete this.data.bonuses[id];
    this.saveData();
  }

  // Education operations
  async getEducationByEmployeeId(employeeId: string): Promise<Education[]> {
    return Object.values(this.data.education).filter(edu => edu.employeeId === employeeId);
  }

  async createEducation(education: InsertEducation): Promise<Education> {
    const id = randomUUID();
    const newEducation: Education = { ...education, id };
    this.data.education[id] = newEducation;
    this.saveData();
    return newEducation;
  }

  async updateEducation(id: string, education: Partial<InsertEducation>): Promise<Education> {
    const existing = this.data.education[id];
    if (!existing) {
      throw new Error(`Education with id ${id} not found`);
    }
    const updated: Education = { ...existing, ...education };
    this.data.education[id] = updated;
    this.saveData();
    return updated;
  }

  async deleteEducation(id: string): Promise<void> {
    delete this.data.education[id];
    this.saveData();
  }

  // Employment history operations
  async getEmploymentHistoryByEmployeeId(employeeId: string): Promise<EmploymentHistory[]> {
    return Object.values(this.data.employmentHistory).filter(history => history.employeeId === employeeId);
  }

  async createEmploymentHistory(history: InsertEmploymentHistory): Promise<EmploymentHistory> {
    const id = randomUUID();
    const newHistory: EmploymentHistory = { ...history, id };
    this.data.employmentHistory[id] = newHistory;
    this.saveData();
    return newHistory;
  }

  async updateEmploymentHistory(id: string, history: Partial<InsertEmploymentHistory>): Promise<EmploymentHistory> {
    const existing = this.data.employmentHistory[id];
    if (!existing) {
      throw new Error(`Employment history with id ${id} not found`);
    }
    const updated: EmploymentHistory = { ...existing, ...history };
    this.data.employmentHistory[id] = updated;
    this.saveData();
    return updated;
  }

  async deleteEmploymentHistory(id: string): Promise<void> {
    delete this.data.employmentHistory[id];
    this.saveData();
  }

  // Compensation operations
  async getCompensationByEmployeeId(employeeId: string): Promise<Compensation[]> {
    return Object.values(this.data.compensation).filter(comp => comp.employeeId === employeeId);
  }

  async createCompensation(compensation: InsertCompensation): Promise<Compensation> {
    const id = randomUUID();
    const newCompensation: Compensation = { ...compensation, id };
    this.data.compensation[id] = newCompensation;
    this.saveData();
    return newCompensation;
  }

  async updateCompensation(id: string, compensation: Partial<InsertCompensation>): Promise<Compensation> {
    const existing = this.data.compensation[id];
    if (!existing) {
      throw new Error(`Compensation with id ${id} not found`);
    }
    const updated: Compensation = { ...existing, ...compensation };
    this.data.compensation[id] = updated;
    this.saveData();
    return updated;
  }

  async deleteCompensation(id: string): Promise<void> {
    delete this.data.compensation[id];
    this.saveData();
  }

  // Time off operations
  async getTimeOffByEmployeeId(employeeId: string): Promise<TimeOff[]> {
    return Object.values(this.data.timeOff).filter(timeOff => timeOff.employeeId === employeeId);
  }

  async createTimeOff(timeOff: InsertTimeOff): Promise<TimeOff> {
    const id = randomUUID();
    const newTimeOff: TimeOff = { ...timeOff, id };
    this.data.timeOff[id] = newTimeOff;
    this.saveData();
    return newTimeOff;
  }

  async updateTimeOff(id: string, timeOff: Partial<InsertTimeOff>): Promise<TimeOff> {
    const existing = this.data.timeOff[id];
    if (!existing) {
      throw new Error(`Time off with id ${id} not found`);
    }
    const updated: TimeOff = { ...existing, ...timeOff };
    this.data.timeOff[id] = updated;
    this.saveData();
    return updated;
  }

  async deleteTimeOff(id: string): Promise<void> {
    delete this.data.timeOff[id];
    this.saveData();
  }

  // Document operations
  async getDocumentsByEmployeeId(employeeId: string): Promise<Document[]> {
    return Object.values(this.data.documents).filter(doc => doc.employeeId === employeeId);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const newDocument: Document = { ...document, id };
    this.data.documents[id] = newDocument;
    this.saveData();
    return newDocument;
  }

  async updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document> {
    const existing = this.data.documents[id];
    if (!existing) {
      throw new Error(`Document with id ${id} not found`);
    }
    const updated: Document = { ...existing, ...document };
    this.data.documents[id] = updated;
    this.saveData();
    return updated;
  }

  async deleteDocument(id: string): Promise<void> {
    delete this.data.documents[id];
    this.saveData();
  }

  // Benefit operations
  async getBenefitsByEmployeeId(employeeId: string): Promise<Benefit[]> {
    return Object.values(this.data.benefits).filter(benefit => benefit.employeeId === employeeId);
  }

  async createBenefit(benefit: InsertBenefit): Promise<Benefit> {
    const id = randomUUID();
    const newBenefit: Benefit = { ...benefit, id };
    this.data.benefits[id] = newBenefit;
    this.saveData();
    return newBenefit;
  }

  async updateBenefit(id: string, benefit: Partial<InsertBenefit>): Promise<Benefit> {
    const existing = this.data.benefits[id];
    if (!existing) {
      throw new Error(`Benefit with id ${id} not found`);
    }
    const updated: Benefit = { ...existing, ...benefit };
    this.data.benefits[id] = updated;
    this.saveData();
    return updated;
  }

  async deleteBenefit(id: string): Promise<void> {
    delete this.data.benefits[id];
    this.saveData();
  }

  // Training operations
  async getTrainingByEmployeeId(employeeId: string): Promise<Training[]> {
    return Object.values(this.data.training).filter(training => training.employeeId === employeeId);
  }

  async createTraining(training: InsertTraining): Promise<Training> {
    const id = randomUUID();
    const newTraining: Training = { ...training, id };
    this.data.training[id] = newTraining;
    this.saveData();
    return newTraining;
  }

  async updateTraining(id: string, training: Partial<InsertTraining>): Promise<Training> {
    const existing = this.data.training[id];
    if (!existing) {
      throw new Error(`Training with id ${id} not found`);
    }
    const updated: Training = { ...existing, ...training };
    this.data.training[id] = updated;
    this.saveData();
    return updated;
  }

  async deleteTraining(id: string): Promise<void> {
    delete this.data.training[id];
    this.saveData();
  }

  // Asset operations
  async getAssetsByEmployeeId(employeeId: string): Promise<Asset[]> {
    return Object.values(this.data.assets).filter(asset => asset.employeeId === employeeId);
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const id = randomUUID();
    const newAsset: Asset = { ...asset, id };
    this.data.assets[id] = newAsset;
    this.saveData();
    return newAsset;
  }

  async updateAsset(id: string, asset: Partial<InsertAsset>): Promise<Asset> {
    const existing = this.data.assets[id];
    if (!existing) {
      throw new Error(`Asset with id ${id} not found`);
    }
    const updated: Asset = { ...existing, ...asset };
    this.data.assets[id] = updated;
    this.saveData();
    return updated;
  }

  async deleteAsset(id: string): Promise<void> {
    delete this.data.assets[id];
    this.saveData();
  }

  // Note operations
  async getNotesByEmployeeId(employeeId: string): Promise<Note[]> {
    return Object.values(this.data.notes).filter(note => note.employeeId === employeeId);
  }

  async createNote(note: InsertNote): Promise<Note> {
    const id = randomUUID();
    const newNote: Note = { 
      ...note, 
      id,
      createdAt: new Date().toISOString()
    };
    this.data.notes[id] = newNote;
    this.saveData();
    return newNote;
  }

  async updateNote(id: string, note: Partial<InsertNote>): Promise<Note> {
    const existing = this.data.notes[id];
    if (!existing) {
      throw new Error(`Note with id ${id} not found`);
    }
    const updated: Note = { ...existing, ...note };
    this.data.notes[id] = updated;
    this.saveData();
    return updated;
  }

  async deleteNote(id: string): Promise<void> {
    delete this.data.notes[id];
    this.saveData();
  }

  // Emergency contact operations
  async getEmergencyContactsByEmployeeId(employeeId: string): Promise<EmergencyContact[]> {
    return Object.values(this.data.emergencyContacts).filter(contact => contact.employeeId === employeeId);
  }

  async createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact> {
    const id = randomUUID();
    const newContact: EmergencyContact = { ...contact, id };
    this.data.emergencyContacts[id] = newContact;
    this.saveData();
    return newContact;
  }

  async updateEmergencyContact(id: string, contact: Partial<InsertEmergencyContact>): Promise<EmergencyContact> {
    const existing = this.data.emergencyContacts[id];
    if (!existing) {
      throw new Error(`Emergency contact with id ${id} not found`);
    }
    const updated: EmergencyContact = { ...existing, ...contact };
    this.data.emergencyContacts[id] = updated;
    this.saveData();
    return updated;
  }

  async deleteEmergencyContact(id: string): Promise<void> {
    delete this.data.emergencyContacts[id];
    this.saveData();
  }

  // Onboarding operations
  async getOnboardingByEmployeeId(employeeId: string): Promise<Onboarding[]> {
    return Object.values(this.data.onboarding).filter(onboarding => onboarding.employeeId === employeeId);
  }

  async createOnboarding(onboarding: InsertOnboarding): Promise<Onboarding> {
    const id = randomUUID();
    const newOnboarding: Onboarding = { ...onboarding, id };
    this.data.onboarding[id] = newOnboarding;
    this.saveData();
    return newOnboarding;
  }

  async updateOnboarding(id: string, onboarding: Partial<InsertOnboarding>): Promise<Onboarding> {
    const existing = this.data.onboarding[id];
    if (!existing) {
      throw new Error(`Onboarding with id ${id} not found`);
    }
    const updated: Onboarding = { ...existing, ...onboarding };
    this.data.onboarding[id] = updated;
    this.saveData();
    return updated;
  }

  async deleteOnboarding(id: string): Promise<void> {
    delete this.data.onboarding[id];
    this.saveData();
  }

  // Offboarding operations
  async getOffboardingByEmployeeId(employeeId: string): Promise<Offboarding[]> {
    return Object.values(this.data.offboarding).filter(offboarding => offboarding.employeeId === employeeId);
  }

  async createOffboarding(offboarding: InsertOffboarding): Promise<Offboarding> {
    const id = randomUUID();
    const newOffboarding: Offboarding = { ...offboarding, id };
    this.data.offboarding[id] = newOffboarding;
    this.saveData();
    return newOffboarding;
  }

  async updateOffboarding(id: string, offboarding: Partial<InsertOffboarding>): Promise<Offboarding> {
    const existing = this.data.offboarding[id];
    if (!existing) {
      throw new Error(`Offboarding with id ${id} not found`);
    }
    const updated: Offboarding = { ...existing, ...offboarding };
    this.data.offboarding[id] = updated;
    this.saveData();
    return updated;
  }

  async deleteOffboarding(id: string): Promise<void> {
    delete this.data.offboarding[id];
    this.saveData();
  }

  // Dependent operations
  async getDependentsByEmployeeId(employeeId: string): Promise<Dependent[]> {
    return Object.values(this.data.dependents).filter(d => d.employeeId === employeeId);
  }

  async createDependent(dependent: InsertDependent): Promise<Dependent> {
    const id = randomUUID();
    const newDependent: Dependent = { 
      id,
      firstName: dependent.firstName,
      lastName: dependent.lastName,
      relationship: dependent.relationship,
      dateOfBirth: dependent.dateOfBirth,
      employeeId: dependent.employeeId || null,
      ssn: dependent.ssn || null,
      gender: dependent.gender || null,
      isStudent: dependent.isStudent || null,
      createdAt: new Date()
    };
    this.data.dependents[id] = newDependent;
    this.saveData();
    return newDependent;
  }

  async updateDependent(id: string, dependent: Partial<InsertDependent>): Promise<Dependent> {
    const existing = this.data.dependents[id];
    if (!existing) {
      throw new Error(`Dependent with id ${id} not found`);
    }
    const updated: Dependent = { ...existing, ...dependent };
    this.data.dependents[id] = updated;
    this.saveData();
    return updated;
  }

  async deleteDependent(id: string): Promise<void> {
    delete this.data.dependents[id];
    this.saveData();
  }

  // This method is required by IStorage interface but not used in the current implementation
  async updateJobInfo(employeeId: string, jobInfo: Partial<Employee>): Promise<Employee> {
    return this.updateEmployee(employeeId, jobInfo);
  }
}
