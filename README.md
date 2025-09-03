# Employee Management System

## Overview

This is a comprehensive full-stack employee management application built with React frontend and Express backend. The system provides detailed employee profiles with comprehensive HR functionality including personal information management, job details, time-off tracking, document management, benefits administration, training records, and asset management. The application features a modern, responsive interface with tabbed navigation and real-time data management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built using **React with TypeScript** and follows a component-based architecture pattern. The application uses **Vite** as the build tool for fast development and optimized production builds. State management is handled through a combination of **Zustand** for global application state and **TanStack Query** for server state management and caching.

The UI is constructed using **shadcn/ui** components built on top of **Radix UI** primitives, providing accessible and customizable interface elements. **Tailwind CSS** handles styling with a custom design system featuring CSS variables for theming. The routing is implemented using **Wouter** for lightweight client-side navigation.

The frontend architecture emphasizes modularity with separate components for each feature area (employees, documents, benefits, etc.) and reusable UI components. Form handling is managed through **React Hook Form** with **Zod** schema validation for type-safe data handling.

### Backend Architecture
The server-side is built with **Express.js** using TypeScript and follows a RESTful API design pattern. The application implements a storage abstraction layer that provides a consistent interface for data operations while remaining database-agnostic in the implementation.

API routes are organized by resource type (employees, documents, benefits, etc.) with standard CRUD operations. The server includes comprehensive error handling, request logging, and validation using Zod schemas shared between frontend and backend for consistency.

The development environment integrates Vite middleware for hot module replacement and includes specific Replit optimizations for cloud development.

### Data Storage Solution
The application uses **Drizzle ORM** with **PostgreSQL** as the primary database. The schema is defined using Drizzle's type-safe schema builder with comprehensive table definitions for all HR-related entities. Database configuration supports **Neon Database** through serverless PostgreSQL connections.

The schema includes tables for employees, education records, employment history, compensation, time-off requests, documents, benefits, training records, assets, notes, emergency contacts, and onboarding/offboarding processes. All tables include proper relationships and constraints with UUID primary keys and timestamp tracking.

Migration management is handled through Drizzle Kit with schema definitions in TypeScript for type safety and version control.

### Authentication and Authorization
The current implementation includes session management infrastructure with **connect-pg-simple** for PostgreSQL-backed session storage, though specific authentication flows are not yet implemented. The architecture is prepared for role-based access control and user authentication.

## External Dependencies

### Core Framework Dependencies
- **React 18** with TypeScript for frontend component architecture
- **Express.js** for backend API server
- **Vite** for build tooling and development server
- **Drizzle ORM** for type-safe database operations

### Database and Storage
- **PostgreSQL** via **@neondatabase/serverless** for cloud database connectivity
- **connect-pg-simple** for session storage management

### UI and Styling
- **shadcn/ui** component library built on **Radix UI** primitives
- **Tailwind CSS** for utility-first styling
- **Lucide React** for consistent iconography
- **class-variance-authority** for component variant management

### State Management and Data Fetching
- **TanStack Query** for server state management and caching
- **Zustand** for client-side global state management
- **React Hook Form** with **@hookform/resolvers** for form handling

### Validation and Type Safety
- **Zod** for runtime type validation and schema definition
- **drizzle-zod** for integrating Drizzle schemas with Zod validation

### Development and Deployment
- **Replit-specific plugins** for cloud development environment integration
- **tsx** for TypeScript execution in development
- **esbuild** for production bundling

### Utility Libraries
- **date-fns** for date manipulation and formatting
- **nanoid** for unique identifier generation
- **wouter** for lightweight client-side routing
- **cmdk** for command palette functionality