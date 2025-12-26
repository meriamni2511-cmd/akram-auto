
export enum PropertyStatus {
  DRAFT = 'DRAFT',
  PUBLISHING = 'PUBLISHING',
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD'
}

export type AuthMethod = 'credentials' | 'cookies';

export enum AuthFailureReason {
  INVALID_API_KEY = 'INVALID_API_KEY',
  WRONG_CREDENTIALS = 'WRONG_CREDENTIALS',
  TWO_FACTOR_REQUIRED = 'TWO_FACTOR_REQUIRED',
  AUTH_CHALLENGE = 'AUTH_CHALLENGE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  COOKIES_EXPIRED = 'COOKIES_EXPIRED',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

export interface FacebookCredentials {
  email?: string;
  password?: string;
  cookies?: string;
  authMethod: AuthMethod;
  isSet: boolean;
}

export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  beds: number;
  baths: number;
  sqft: number;
  status: PropertyStatus;
  description: string;
  imageUrl: string;
  createdAt: string; // ISO string for DB compatibility
  source?: 'TELEGRAM' | 'MANUAL';
}

// Added PropertyData interface to resolve import errors in App.tsx and automationService.ts
export interface PropertyData {
  isPropertyListing?: boolean;
  reply?: string;
  pagePostCaption?: string;
  messengerTemplate?: string;
  title: string;
  price: number;
  location: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  description: string;
}

// Added AirtopSession interface to resolve import errors in automationService.ts
export interface AirtopSession {
  id: string;
  cdpUrl?: string;
  interactiveUrl?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  source: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED';
  propertyId: string;
  createdAt: string;
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  module: 'INGESTOR' | 'AI_AGENT' | 'AIRTOP' | 'SYSTEM' | 'NETWORK';
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

export type AutomationStep = 'IDLE' | 'ANALYZING' | 'GENERATING_SCRIPT' | 'AIRTOP_LOGIN' | 'AIRTOP_EXECUTING' | 'SUCCESS' | 'ERROR' | 'AIRTOP_CONNECT' | 'FB_NAVIGATE' | 'FB_FORM_FILL' | 'FB_MEDIA_UPLOAD' | 'COMPLETED';
