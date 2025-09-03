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
  type Onboarding,
  type InsertOnboarding,
  type Offboarding,
  type InsertOffboarding,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Employee operations
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;

  // Education operations
  getEducationByEmployeeId(employeeId: string): Promise<Education[]>;
  createEducation(education: InsertEducation): Promise<Education>;
  updateEducation(id: string, education: Partial<InsertEducation>): Promise<Education>;
  deleteEducation(id: string): Promise<void>;

  // Employment history operations
  getEmploymentHistoryByEmployeeId(employeeId: string): Promise<EmploymentHistory[]>;
  createEmploymentHistory(history: InsertEmploymentHistory): Promise<EmploymentHistory>;
  updateEmploymentHistory(id: string, history: Partial<InsertEmploymentHistory>): Promise<EmploymentHistory>;
  deleteEmploymentHistory(id: string): Promise<void>;

  // Compensation operations
  getCompensationByEmployeeId(employeeId: string): Promise<Compensation[]>;
  createCompensation(compensation: InsertCompensation): Promise<Compensation>;
  updateCompensation(id: string, compensation: Partial<InsertCompensation>): Promise<Compensation>;
  deleteCompensation(id: string): Promise<void>;

  // Time off operations
  getTimeOffByEmployeeId(employeeId: string): Promise<TimeOff[]>;
  createTimeOff(timeOff: InsertTimeOff): Promise<TimeOff>;
  updateTimeOff(id: string, timeOff: Partial<InsertTimeOff>): Promise<TimeOff>;
  deleteTimeOff(id: string): Promise<void>;

  // Document operations
  getDocumentsByEmployeeId(employeeId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;

  // Benefit operations
  getBenefitsByEmployeeId(employeeId: string): Promise<Benefit[]>;
  createBenefit(benefit: InsertBenefit): Promise<Benefit>;
  updateBenefit(id: string, benefit: Partial<InsertBenefit>): Promise<Benefit>;
  deleteBenefit(id: string): Promise<void>;

  // Training operations
  getTrainingByEmployeeId(employeeId: string): Promise<Training[]>;
  createTraining(training: InsertTraining): Promise<Training>;
  updateTraining(id: string, training: Partial<InsertTraining>): Promise<Training>;
  deleteTraining(id: string): Promise<void>;

  // Asset operations
  getAssetsByEmployeeId(employeeId: string): Promise<Asset[]>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: string, asset: Partial<InsertAsset>): Promise<Asset>;
  deleteAsset(id: string): Promise<void>;

  // Note operations
  getNotesByEmployeeId(employeeId: string): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: string, note: Partial<InsertNote>): Promise<Note>;
  deleteNote(id: string): Promise<void>;

  // Emergency contact operations
  getEmergencyContactsByEmployeeId(employeeId: string): Promise<EmergencyContact[]>;
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;
  updateEmergencyContact(id: string, contact: Partial<InsertEmergencyContact>): Promise<EmergencyContact>;
  deleteEmergencyContact(id: string): Promise<void>;

  // Onboarding operations
  getOnboardingByEmployeeId(employeeId: string): Promise<Onboarding[]>;
  createOnboarding(onboarding: InsertOnboarding): Promise<Onboarding>;
  updateOnboarding(id: string, onboarding: Partial<InsertOnboarding>): Promise<Onboarding>;
  deleteOnboarding(id: string): Promise<void>;

  // Offboarding operations
  getOffboardingByEmployeeId(employeeId: string): Promise<Offboarding[]>;
  createOffboarding(offboarding: InsertOffboarding): Promise<Offboarding>;
  updateOffboarding(id: string, offboarding: Partial<InsertOffboarding>): Promise<Offboarding>;
  deleteOffboarding(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private employees: Map<string, Employee> = new Map();
  private education: Map<string, Education> = new Map();
  private employmentHistory: Map<string, EmploymentHistory> = new Map();
  private compensation: Map<string, Compensation> = new Map();
  private timeOff: Map<string, TimeOff> = new Map();
  private documents: Map<string, Document> = new Map();
  private benefits: Map<string, Benefit> = new Map();
  private training: Map<string, Training> = new Map();
  private assets: Map<string, Asset> = new Map();
  private notes: Map<string, Note> = new Map();
  private emergencyContacts: Map<string, EmergencyContact> = new Map();
  private onboarding: Map<string, Onboarding> = new Map();
  private offboarding: Map<string, Offboarding> = new Map();

  constructor() {
    // Initialize with sample employee data
    this.initializeSampleData();
  }

  private initializeSampleData() {
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

    this.employees.set(sampleEmployee.id, sampleEmployee);
  }

  // Employee operations
  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const newEmployee: Employee = {
      ...employee,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.employees.set(id, newEmployee);
    return newEmployee;
  }

  async updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee> {
    const existing = this.employees.get(id);
    if (!existing) {
      throw new Error(`Employee with id ${id} not found`);
    }
    const updated: Employee = {
      ...existing,
      ...employee,
      updatedAt: new Date(),
    };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: string): Promise<void> {
    this.employees.delete(id);
  }

  // Education operations
  async getEducationByEmployeeId(employeeId: string): Promise<Education[]> {
    return Array.from(this.education.values()).filter(edu => edu.employeeId === employeeId);
  }

  async createEducation(education: InsertEducation): Promise<Education> {
    const id = randomUUID();
    const newEducation: Education = { ...education, id };
    this.education.set(id, newEducation);
    return newEducation;
  }

  async updateEducation(id: string, education: Partial<InsertEducation>): Promise<Education> {
    const existing = this.education.get(id);
    if (!existing) {
      throw new Error(`Education with id ${id} not found`);
    }
    const updated: Education = { ...existing, ...education };
    this.education.set(id, updated);
    return updated;
  }

  async deleteEducation(id: string): Promise<void> {
    this.education.delete(id);
  }

  // Employment history operations
  async getEmploymentHistoryByEmployeeId(employeeId: string): Promise<EmploymentHistory[]> {
    return Array.from(this.employmentHistory.values()).filter(history => history.employeeId === employeeId);
  }

  async createEmploymentHistory(history: InsertEmploymentHistory): Promise<EmploymentHistory> {
    const id = randomUUID();
    const newHistory: EmploymentHistory = { ...history, id };
    this.employmentHistory.set(id, newHistory);
    return newHistory;
  }

  async updateEmploymentHistory(id: string, history: Partial<InsertEmploymentHistory>): Promise<EmploymentHistory> {
    const existing = this.employmentHistory.get(id);
    if (!existing) {
      throw new Error(`Employment history with id ${id} not found`);
    }
    const updated: EmploymentHistory = { ...existing, ...history };
    this.employmentHistory.set(id, updated);
    return updated;
  }

  async deleteEmploymentHistory(id: string): Promise<void> {
    this.employmentHistory.delete(id);
  }

  // Compensation operations
  async getCompensationByEmployeeId(employeeId: string): Promise<Compensation[]> {
    return Array.from(this.compensation.values()).filter(comp => comp.employeeId === employeeId);
  }

  async createCompensation(compensation: InsertCompensation): Promise<Compensation> {
    const id = randomUUID();
    const newCompensation: Compensation = { ...compensation, id };
    this.compensation.set(id, newCompensation);
    return newCompensation;
  }

  async updateCompensation(id: string, compensation: Partial<InsertCompensation>): Promise<Compensation> {
    const existing = this.compensation.get(id);
    if (!existing) {
      throw new Error(`Compensation with id ${id} not found`);
    }
    const updated: Compensation = { ...existing, ...compensation };
    this.compensation.set(id, updated);
    return updated;
  }

  async deleteCompensation(id: string): Promise<void> {
    this.compensation.delete(id);
  }

  // Time off operations
  async getTimeOffByEmployeeId(employeeId: string): Promise<TimeOff[]> {
    return Array.from(this.timeOff.values()).filter(timeOff => timeOff.employeeId === employeeId);
  }

  async createTimeOff(timeOff: InsertTimeOff): Promise<TimeOff> {
    const id = randomUUID();
    const newTimeOff: TimeOff = { ...timeOff, id };
    this.timeOff.set(id, newTimeOff);
    return newTimeOff;
  }

  async updateTimeOff(id: string, timeOff: Partial<InsertTimeOff>): Promise<TimeOff> {
    const existing = this.timeOff.get(id);
    if (!existing) {
      throw new Error(`Time off with id ${id} not found`);
    }
    const updated: TimeOff = { ...existing, ...timeOff };
    this.timeOff.set(id, updated);
    return updated;
  }

  async deleteTimeOff(id: string): Promise<void> {
    this.timeOff.delete(id);
  }

  // Document operations
  async getDocumentsByEmployeeId(employeeId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.employeeId === employeeId);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const newDocument: Document = { ...document, id };
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document> {
    const existing = this.documents.get(id);
    if (!existing) {
      throw new Error(`Document with id ${id} not found`);
    }
    const updated: Document = { ...existing, ...document };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
  }

  // Benefit operations
  async getBenefitsByEmployeeId(employeeId: string): Promise<Benefit[]> {
    return Array.from(this.benefits.values()).filter(benefit => benefit.employeeId === employeeId);
  }

  async createBenefit(benefit: InsertBenefit): Promise<Benefit> {
    const id = randomUUID();
    const newBenefit: Benefit = { ...benefit, id };
    this.benefits.set(id, newBenefit);
    return newBenefit;
  }

  async updateBenefit(id: string, benefit: Partial<InsertBenefit>): Promise<Benefit> {
    const existing = this.benefits.get(id);
    if (!existing) {
      throw new Error(`Benefit with id ${id} not found`);
    }
    const updated: Benefit = { ...existing, ...benefit };
    this.benefits.set(id, updated);
    return updated;
  }

  async deleteBenefit(id: string): Promise<void> {
    this.benefits.delete(id);
  }

  // Training operations
  async getTrainingByEmployeeId(employeeId: string): Promise<Training[]> {
    return Array.from(this.training.values()).filter(training => training.employeeId === employeeId);
  }

  async createTraining(training: InsertTraining): Promise<Training> {
    const id = randomUUID();
    const newTraining: Training = { ...training, id };
    this.training.set(id, newTraining);
    return newTraining;
  }

  async updateTraining(id: string, training: Partial<InsertTraining>): Promise<Training> {
    const existing = this.training.get(id);
    if (!existing) {
      throw new Error(`Training with id ${id} not found`);
    }
    const updated: Training = { ...existing, ...training };
    this.training.set(id, updated);
    return updated;
  }

  async deleteTraining(id: string): Promise<void> {
    this.training.delete(id);
  }

  // Asset operations
  async getAssetsByEmployeeId(employeeId: string): Promise<Asset[]> {
    return Array.from(this.assets.values()).filter(asset => asset.employeeId === employeeId);
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const id = randomUUID();
    const newAsset: Asset = { ...asset, id };
    this.assets.set(id, newAsset);
    return newAsset;
  }

  async updateAsset(id: string, asset: Partial<InsertAsset>): Promise<Asset> {
    const existing = this.assets.get(id);
    if (!existing) {
      throw new Error(`Asset with id ${id} not found`);
    }
    const updated: Asset = { ...existing, ...asset };
    this.assets.set(id, updated);
    return updated;
  }

  async deleteAsset(id: string): Promise<void> {
    this.assets.delete(id);
  }

  // Note operations
  async getNotesByEmployeeId(employeeId: string): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(note => note.employeeId === employeeId);
  }

  async createNote(note: InsertNote): Promise<Note> {
    const id = randomUUID();
    const newNote: Note = { ...note, id };
    this.notes.set(id, newNote);
    return newNote;
  }

  async updateNote(id: string, note: Partial<InsertNote>): Promise<Note> {
    const existing = this.notes.get(id);
    if (!existing) {
      throw new Error(`Note with id ${id} not found`);
    }
    const updated: Note = { ...existing, ...note };
    this.notes.set(id, updated);
    return updated;
  }

  async deleteNote(id: string): Promise<void> {
    this.notes.delete(id);
  }

  // Emergency contact operations
  async getEmergencyContactsByEmployeeId(employeeId: string): Promise<EmergencyContact[]> {
    return Array.from(this.emergencyContacts.values()).filter(contact => contact.employeeId === employeeId);
  }

  async createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact> {
    const id = randomUUID();
    const newContact: EmergencyContact = { ...contact, id };
    this.emergencyContacts.set(id, newContact);
    return newContact;
  }

  async updateEmergencyContact(id: string, contact: Partial<InsertEmergencyContact>): Promise<EmergencyContact> {
    const existing = this.emergencyContacts.get(id);
    if (!existing) {
      throw new Error(`Emergency contact with id ${id} not found`);
    }
    const updated: EmergencyContact = { ...existing, ...contact };
    this.emergencyContacts.set(id, updated);
    return updated;
  }

  async deleteEmergencyContact(id: string): Promise<void> {
    this.emergencyContacts.delete(id);
  }

  // Onboarding operations
  async getOnboardingByEmployeeId(employeeId: string): Promise<Onboarding[]> {
    return Array.from(this.onboarding.values()).filter(item => item.employeeId === employeeId);
  }

  async createOnboarding(onboarding: InsertOnboarding): Promise<Onboarding> {
    const id = randomUUID();
    const newOnboarding: Onboarding = { ...onboarding, id };
    this.onboarding.set(id, newOnboarding);
    return newOnboarding;
  }

  async updateOnboarding(id: string, onboarding: Partial<InsertOnboarding>): Promise<Onboarding> {
    const existing = this.onboarding.get(id);
    if (!existing) {
      throw new Error(`Onboarding with id ${id} not found`);
    }
    const updated: Onboarding = { ...existing, ...onboarding };
    this.onboarding.set(id, updated);
    return updated;
  }

  async deleteOnboarding(id: string): Promise<void> {
    this.onboarding.delete(id);
  }

  // Offboarding operations
  async getOffboardingByEmployeeId(employeeId: string): Promise<Offboarding[]> {
    return Array.from(this.offboarding.values()).filter(item => item.employeeId === employeeId);
  }

  async createOffboarding(offboarding: InsertOffboarding): Promise<Offboarding> {
    const id = randomUUID();
    const newOffboarding: Offboarding = { ...offboarding, id };
    this.offboarding.set(id, newOffboarding);
    return newOffboarding;
  }

  async updateOffboarding(id: string, offboarding: Partial<InsertOffboarding>): Promise<Offboarding> {
    const existing = this.offboarding.get(id);
    if (!existing) {
      throw new Error(`Offboarding with id ${id} not found`);
    }
    const updated: Offboarding = { ...existing, ...offboarding };
    this.offboarding.set(id, updated);
    return updated;
  }

  async deleteOffboarding(id: string): Promise<void> {
    this.offboarding.delete(id);
  }
}

export const storage = new MemStorage();
