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
  type Bonus,
  type InsertBonus
} from "@shared/schema";
import { randomUUID } from "crypto";
import { FileStorage } from "./file-storage";

export interface IStorage {
  // Employee operations
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;
  updateJobInfo(employeeId: string, jobInfo: Partial<Employee>): Promise<Employee>;

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

  // Bonus operations
  getBonusesByEmployeeId(employeeId: string): Promise<Bonus[]>;
  createBonus(bonus: InsertBonus): Promise<Bonus>;
  updateBonus(id: string, bonus: Partial<InsertBonus>): Promise<Bonus>;
  deleteBonus(id: string): Promise<void>;

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

export const storage = new FileStorage();
