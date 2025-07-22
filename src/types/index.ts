export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  image?: string;
  phone?: string;
  licenseNumber?: string;
  brokerageName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  status: TransactionStatus;
  propertyAddress: string;
  listingId?: string;
  price: number;
  commissionPercent: number;
  primaryAgentId: string;
  closingDate?: Date;
  contractDate?: Date;
  listingDate?: Date;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  lotSize?: string;
  yearBuilt?: number;
  mlsNumber?: string;
  earnestMoney?: number;
  downPayment?: number;
  loanAmount?: number;
  createdAt: Date;
  updatedAt: Date;
  primaryAgent: User;
  tasks: Task[];
  documents: Document[];
  activities: Activity[];
  property?: Property;
}

export interface Property {
  id: string;
  transactionId: string;
  mlsData?: any;
  description?: string;
  features?: string[];
  images?: string[];
  schoolDistrict?: string;
  taxes?: number;
  hoaFees?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  completedAt?: Date;
  category?: string;
  tags?: string[];
  color?: string;
  transactionId?: string;
  assignedToId: string;
  createdById: string;
  assignedTo: User;
  createdBy: User;
  transaction?: Transaction;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  filePath: string;
  originalName: string;
  size: number;
  mimeType: string;
  parsedData?: any;
  transactionId?: string;
  uploadedById: string;
  transaction?: Transaction;
  uploadedBy: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  type: EventType;
  color?: string;
  transactionId?: string;
  userId: string;
  transaction?: Transaction;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  metadata?: any;
  userId: string;
  transactionId?: string;
  user: User;
  transaction?: Transaction;
  createdAt: Date;
}

export interface EmailAccount {
  id: string;
  email: string;
  provider: string;
  accessToken: string;
  refreshToken: string;
  isActive: boolean;
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum UserRole {
  ADMIN = "ADMIN",
  BROKER = "BROKER",
  AGENT = "AGENT",
  ASSISTANT = "ASSISTANT",
}

export enum TransactionStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  UNDER_CONTRACT = "UNDER_CONTRACT",
  CLOSED = "CLOSED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum DocumentType {
  CONTRACT = "CONTRACT",
  DISCLOSURE = "DISCLOSURE",
  INSPECTION = "INSPECTION",
  APPRAISAL = "APPRAISAL",
  COMMISSION_AGREEMENT = "COMMISSION_AGREEMENT",
  LISTING_AGREEMENT = "LISTING_AGREEMENT",
  EARNEST_MONEY = "EARNEST_MONEY",
  CLOSING_DOCUMENT = "CLOSING_DOCUMENT",
  OTHER = "OTHER",
}

export enum ActivityType {
  TASK_CREATED = "TASK_CREATED",
  TASK_COMPLETED = "TASK_COMPLETED",
  TRANSACTION_CREATED = "TRANSACTION_CREATED",
  TRANSACTION_UPDATED = "TRANSACTION_UPDATED",
  DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED",
  EMAIL_SENT = "EMAIL_SENT",
  EMAIL_RECEIVED = "EMAIL_RECEIVED",
  CALENDAR_EVENT_CREATED = "CALENDAR_EVENT_CREATED",
  PROPERTY_VIEWED = "PROPERTY_VIEWED",
  OFFER_SUBMITTED = "OFFER_SUBMITTED",
  CONTRACT_SIGNED = "CONTRACT_SIGNED",
}

export enum EventType {
  TASK = "TASK",
  APPOINTMENT = "APPOINTMENT",
  DEADLINE = "DEADLINE",
  CLOSING = "CLOSING",
  INSPECTION = "INSPECTION",
  SHOWING = "SHOWING",
  MEETING = "MEETING",
}

// Dashboard Types
export interface DashboardStats {
  totalTransactions: number;
  activeTransactions: number;
  monthlyRevenue: number;
  pendingTasks: number;
  overdueDocuments: number;
  upcomingClosings: number;
}

export interface PipelineData {
  stage: string;
  count: number;
  value: number;
  transactions: Transaction[];
}

// Form Types
export interface CreateTransactionData {
  propertyAddress: string;
  listingId?: string;
  price: number;
  commissionPercent: number;
  primaryAgentId: string;
  closingDate?: Date;
  contractDate?: Date;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: Date;
  category?: string;
  tags?: string[];
  color?: string;
  transactionId?: string;
  assignedToId: string;
}
