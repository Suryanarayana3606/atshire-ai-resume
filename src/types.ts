export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: 'candidate' | 'admin';
  createdAt: string;
}

export interface ResumeData {
  id: string;
  userId: string;
  title: string;
  originalFileUrl?: string;
  textContent: string;
  parsedData: {
    name: string;
    email: string;
    phone: string;
    summary: string;
    skills: string[];
    education: { degree: string; institution: string; year: string }[];
    experience: { title: string; company: string; duration: string; description: string }[];
    projects: { title: string; description: string }[];
  };
  atsScore: number;
  createdAt: string;
}

export interface JobDescription {
  id: string;
  userId: string;
  title: string;
  content: string;
  extractedKeywords: string[];
  createdAt: string;
}

export interface JobMatchResult {
  id: string;
  resumeId: string;
  jdId: string;
  matchScore: number;
  missingKeywords: string[];
  suggestions: string[];
  breakdown: {
    skills: number;
    experience: number;
    education: number;
  };
  createdAt: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}
