
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
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  COOKIES_EXPIRED = 'COOKIES_EXPIRED',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

export interface FacebookCredentials {
  email?: string;
  password?: string;
  cookies?: string; // JSON string of cookies
  authMethod: AuthMethod;
  isSet: boolean;
}

export interface AirtopSession {
  id: string;
  status: 'running' | 'completed' | 'failed';
  websocketUrl?: string;
  cdpUrl?: string;
}

export interface PropertyData {
  title: string;
  price: number;
  location: string;
  description: string;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  features?: string[];
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
  createdAt: string;
  source?: 'TELEGRAM' | 'MANUAL';
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  module: 'INGESTOR' | 'AI_AGENT' | 'AIRTOP' | 'SYSTEM' | 'NETWORK';
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

export type AutomationStep = 'IDLE' | 'ANALYZING' | 'GENERATING_SCRIPT' | 'AIRTOP_LOGIN' | 'AIRTOP_EXECUTING' | 'SUCCESS' | 'ERROR';

export interface AirtopResponse {
  sessionId: string;
  status: 'running' | 'completed' | 'failed';
  outputUrl?: string;
  logs?: string[];
}
