// Data schemas for recruitment system

export interface RecruitmentApplication {
  id: string;
  submittedAt: string;
  status: ApplicationStatus;
  
  // Personal Information
  personalInfo: PersonalInfo;
  
  // Department Interest
  departmentInterest: DepartmentInterest;
  
  // Skills & Experience
  skills: SkillsInfo;
  
  // Questions
  responses: QuestionResponses;
  
  // Resume
  resumeUrl?: string;
  
  // Admin Notes
  adminNotes?: string;
}

export type ApplicationStatus = 'pending' | 'review' | 'interview' | 'accepted' | 'rejected';

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  year: StudentYear;
  branch: string;
  studentId: string;
  city?: string;
  state?: string;
}

export type StudentYear = '1st' | '2nd' | '3rd' | '4th';

export interface DepartmentInterest {
  firstChoice: Department;
  secondChoice: Department;
  thirdChoice?: Department;
  reason: string;
  relevantExperience?: string;
}

export type Department = 'ADMINISTRATION' | 'TECHNOLOGY' | 'MEDIA_AND_MARKETING' | 'OPERATIONS' | 'PARTNERSHIPS';

export interface SkillsInfo {
  technicalSkills: string[];
  experience: string;
  projects: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  otherSkills?: string;
  certifications?: string;
}

export interface QuestionResponses {
  whyJoin: string;
  contribution: string;
  timeCommitment: string;
  otherActivities?: string;
  challenges?: string;
  goals?: string;
}

// Form submission data (without admin fields)
export interface RecruitmentFormData {
  personalInfo: PersonalInfo;
  departmentInterest: DepartmentInterest;
  skills: SkillsInfo;
  responses: QuestionResponses;
  resumeUrl?: string;
}