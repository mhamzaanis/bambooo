import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  jobTitle: text("job_title"),
  department: text("department"),
  location: text("location"),
  hireDate: text("hire_date"),
  profileData: jsonb("profile_data").$type<{
    personal: {
      preferredName?: string;
      gender?: string;
      dateOfBirth?: string;
      maritalStatus?: string;
      ssn?: string;
    };
    address: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    contact: {
      workPhone?: string;
      mobilePhone?: string;
      homePhone?: string;
      personalEmail?: string;
    };
    social: {
      linkedin?: string;
      twitter?: string;
      website?: string;
    };
    visa: {
      type?: string;
      status?: string;
      expiration?: string;
      sponsorshipRequired?: boolean;
    };
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const education = pgTable("education", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id),
  institution: text("institution"),
  degree: text("degree"),
  fieldOfStudy: text("field_of_study"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  description: text("description"),
});

export const employmentHistory = pgTable("employment_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id),
  effectiveDate: text("effective_date"),
  status: text("status"),
  location: text("location"),
  division: text("division"),
  department: text("department"),
  jobTitle: text("job_title"),
  reportsTo: text("reports_to"),
  comment: text("comment"),
});

export const compensation = pgTable("compensation", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id),
  effectiveDate: text("effective_date"),
  payRate: text("pay_rate"),
  payType: text("pay_type"),
  overtime: text("overtime"),
  changeReason: text("change_reason"),
  comment: text("comment"),
});

export const timeOff = pgTable("time_off", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id),
  type: text("type"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  days: text("days"),
  status: text("status"),
  comment: text("comment"),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id),
  category: text("category"),
  name: text("name"),
  fileName: text("file_name"),
  uploadDate: text("upload_date"),
});

export const benefits = pgTable("benefits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id),
  type: text("type"),
  plan: text("plan"),
  status: text("status"),
  enrollmentDate: text("enrollment_date"),
});

export const training = pgTable("training", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id),
  name: text("name"),
  category: text("category"),
  status: text("status"),
  dueDate: text("due_date"),
  completedDate: text("completed_date"),
  credits: text("credits"),
});

export const assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id),
  category: text("category"),
  description: text("description"),
  serialNumber: text("serial_number"),
  dateAssigned: text("date_assigned"),
});

export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id),
  title: text("title"),
  content: text("content"),
  createdBy: text("created_by"),
  createdAt: text("created_at"),
});

export const emergencyContacts = pgTable("emergency_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id),
  firstName: text("first_name"),
  lastName: text("last_name"),
  relationship: text("relationship"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
});

export const dependents = pgTable("dependents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  relationship: text("relationship").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  ssn: text("ssn"),
  gender: text("gender"),
  isStudent: boolean("is_student").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bonuses = pgTable("bonuses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id),
  type: text("type"),
  amount: text("amount"),
  frequency: text("frequency"),
  eligibilityDate: text("eligibility_date"),
  description: text("description"),
});
export interface Bonus {
  id: string;
  employeeId: string;
  type: string;
  amount: string;
  frequency: string;
  eligibilityDate?: string;
  description?: string;
}

export interface InsertBonus {
  employeeId: string;
  type: string;
  amount: string;
  frequency: string;
  eligibilityDate?: string;
  description?: string;
}

import { z } from "zod";

export const insertBonusSchema = z.object({
  employeeId: z.string().min(1),
  type: z.string().min(1),
  amount: z.string().min(1),
  frequency: z.string().min(1),
  eligibilityDate: z.string().optional(),
  description: z.string().optional(),
});

export const onboarding = pgTable("onboarding", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id),
  task: text("task"),
  description: text("description"),
  dueDate: text("due_date"),
  status: text("status"),
  completedDate: text("completed_date"),
});

export const offboarding = pgTable("offboarding", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id),
  task: text("task"),
  description: text("description"),
  dueDate: text("due_date"),
  status: text("status"),
  completedDate: text("completed_date"),
});

// Insert schemas
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEducationSchema = createInsertSchema(education).omit({
  id: true,
});

export const insertEmploymentHistorySchema = createInsertSchema(employmentHistory).omit({
  id: true,
});

export const insertCompensationSchema = createInsertSchema(compensation).omit({
  id: true,
});

export const insertTimeOffSchema = createInsertSchema(timeOff).omit({
  id: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
});

export const insertBenefitSchema = createInsertSchema(benefits).omit({
  id: true,
});

export const insertTrainingSchema = createInsertSchema(training).omit({
  id: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
});

export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).omit({
  id: true,
});

export const insertDependentSchema = createInsertSchema(dependents).omit({
  id: true,
  createdAt: true,
});

export const insertOnboardingSchema = createInsertSchema(onboarding).omit({
  id: true,
});

export const insertOffboardingSchema = createInsertSchema(offboarding).omit({
  id: true,
});

export const insertBonusSchema2 = createInsertSchema(bonuses).omit({
  id: true,
});

// Types
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Education = typeof education.$inferSelect;
export type InsertEducation = z.infer<typeof insertEducationSchema>;
export type EmploymentHistory = typeof employmentHistory.$inferSelect;
export type InsertEmploymentHistory = z.infer<typeof insertEmploymentHistorySchema>;
export type Compensation = typeof compensation.$inferSelect;
export type InsertCompensation = z.infer<typeof insertCompensationSchema>;
export type TimeOff = typeof timeOff.$inferSelect;
export type InsertTimeOff = z.infer<typeof insertTimeOffSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Benefit = typeof benefits.$inferSelect;
export type InsertBenefit = z.infer<typeof insertBenefitSchema>;
export type Training = typeof training.$inferSelect;
export type InsertTraining = z.infer<typeof insertTrainingSchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;
export type Dependent = typeof dependents.$inferSelect;
export type InsertDependent = z.infer<typeof insertDependentSchema>;
export type Onboarding = typeof onboarding.$inferSelect;
export type InsertOnboarding = z.infer<typeof insertOnboardingSchema>;
export type Offboarding = typeof offboarding.$inferSelect;
export type InsertOffboarding = z.infer<typeof insertOffboardingSchema>;
export type Bonus2 = typeof bonuses.$inferSelect;
export type InsertBonus2 = z.infer<typeof insertBonusSchema2>;
