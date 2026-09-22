// Validation utilities for recruitment form

import { RecruitmentFormData, PersonalInfo, DepartmentInterest, SkillsInfo, QuestionResponses } from './schema';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation (10 digits)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Validate personal info
export function validatePersonalInfo(personalInfo: PersonalInfo): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!personalInfo.fullName || personalInfo.fullName.trim().length < 2) {
    errors.push({ field: 'fullName', message: 'Full name must be at least 2 characters' });
  }

  if (!personalInfo.email || !isValidEmail(personalInfo.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!personalInfo.phone || !isValidPhone(personalInfo.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid 10-digit phone number' });
  }

  if (!personalInfo.year) {
    errors.push({ field: 'year', message: 'Please select your current year' });
  }

  if (!personalInfo.branch || personalInfo.branch.trim().length < 2) {
    errors.push({ field: 'branch', message: 'Please enter your branch/department' });
  }

  if (!personalInfo.studentId || personalInfo.studentId.trim().length < 1) {
    errors.push({ field: 'studentId', message: 'Please enter your student ID' });
  }

  return errors;
}

// Validate department interest
export function validateDepartmentInterest(departmentInterest: DepartmentInterest): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!departmentInterest.firstChoice) {
    errors.push({ field: 'firstChoice', message: 'Please select your first choice department' });
  }

  if (!departmentInterest.secondChoice) {
    errors.push({ field: 'secondChoice', message: 'Please select your second choice department' });
  }

  if (departmentInterest.firstChoice === departmentInterest.secondChoice) {
    errors.push({ field: 'secondChoice', message: 'Second choice must be different from first choice' });
  }

  if (departmentInterest.thirdChoice && 
      (departmentInterest.thirdChoice === departmentInterest.firstChoice || 
       departmentInterest.thirdChoice === departmentInterest.secondChoice)) {
    errors.push({ field: 'thirdChoice', message: 'Third choice must be different from first and second choices' });
  }

  if (!departmentInterest.reason || departmentInterest.reason.trim().length < 10) {
    errors.push({ field: 'reason', message: 'Please provide a reason (at least 10 characters)' });
  }

  return errors;
}

// Validate skills info
export function validateSkillsInfo(skills: SkillsInfo): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!skills.technicalSkills || skills.technicalSkills.length === 0) {
    errors.push({ field: 'technicalSkills', message: 'Please select at least one technical skill' });
  }

  if (!skills.experience || skills.experience.trim().length < 10) {
    errors.push({ field: 'experience', message: 'Please describe your experience (at least 10 characters)' });
  }

  if (!skills.projects || skills.projects.trim().length < 10) {
    errors.push({ field: 'projects', message: 'Please describe your projects (at least 10 characters)' });
  }

  // Validate URLs if provided
  if (skills.portfolioUrl && !isValidUrl(skills.portfolioUrl)) {
    errors.push({ field: 'portfolioUrl', message: 'Please enter a valid portfolio URL' });
  }

  if (skills.githubUrl && !isValidUrl(skills.githubUrl)) {
    errors.push({ field: 'githubUrl', message: 'Please enter a valid GitHub URL' });
  }

  if (skills.linkedinUrl && !isValidUrl(skills.linkedinUrl)) {
    errors.push({ field: 'linkedinUrl', message: 'Please enter a valid LinkedIn URL' });
  }

  return errors;
}

// Validate question responses
export function validateResponses(responses: QuestionResponses): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!responses.whyJoin || responses.whyJoin.trim().length < 20) {
    errors.push({ field: 'whyJoin', message: 'Please explain why you want to join (at least 20 characters)' });
  }

  if (!responses.contribution || responses.contribution.trim().length < 20) {
    errors.push({ field: 'contribution', message: 'Please explain how you can contribute (at least 20 characters)' });
  }

  if (!responses.timeCommitment || responses.timeCommitment.trim().length < 10) {
    errors.push({ field: 'timeCommitment', message: 'Please describe your time commitment (at least 10 characters)' });
  }

  return errors;
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate complete form data
export function validateFormData(formData: RecruitmentFormData): ValidationResult {
  const errors: ValidationError[] = [];

  errors.push(...validatePersonalInfo(formData.personalInfo));
  errors.push(...validateDepartmentInterest(formData.departmentInterest));
  errors.push(...validateSkillsInfo(formData.skills));
  errors.push(...validateResponses(formData.responses));

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Sanitize form data
export function sanitizeFormData(formData: RecruitmentFormData): RecruitmentFormData {
  return {
    personalInfo: {
      ...formData.personalInfo,
      fullName: sanitizeInput(formData.personalInfo.fullName),
      email: sanitizeInput(formData.personalInfo.email),
      phone: sanitizeInput(formData.personalInfo.phone),
      branch: sanitizeInput(formData.personalInfo.branch),
      studentId: sanitizeInput(formData.personalInfo.studentId),
      city: formData.personalInfo.city ? sanitizeInput(formData.personalInfo.city) : undefined,
      state: formData.personalInfo.state ? sanitizeInput(formData.personalInfo.state) : undefined,
    },
    departmentInterest: {
      ...formData.departmentInterest,
      reason: sanitizeInput(formData.departmentInterest.reason),
      relevantExperience: formData.departmentInterest.relevantExperience ? sanitizeInput(formData.departmentInterest.relevantExperience) : undefined,
    },
    skills: {
      ...formData.skills,
      technicalSkills: formData.skills.technicalSkills.map(skill => sanitizeInput(skill)),
      experience: sanitizeInput(formData.skills.experience),
      projects: sanitizeInput(formData.skills.projects),
      portfolioUrl: formData.skills.portfolioUrl ? sanitizeInput(formData.skills.portfolioUrl) : undefined,
      githubUrl: formData.skills.githubUrl ? sanitizeInput(formData.skills.githubUrl) : undefined,
      linkedinUrl: formData.skills.linkedinUrl ? sanitizeInput(formData.skills.linkedinUrl) : undefined,
      otherSkills: formData.skills.otherSkills ? sanitizeInput(formData.skills.otherSkills) : undefined,
      certifications: formData.skills.certifications ? sanitizeInput(formData.skills.certifications) : undefined,
    },
    responses: {
      whyJoin: sanitizeInput(formData.responses.whyJoin),
      contribution: sanitizeInput(formData.responses.contribution),
      timeCommitment: sanitizeInput(formData.responses.timeCommitment),
      otherActivities: formData.responses.otherActivities ? sanitizeInput(formData.responses.otherActivities) : undefined,
      challenges: formData.responses.challenges ? sanitizeInput(formData.responses.challenges) : undefined,
      goals: formData.responses.goals ? sanitizeInput(formData.responses.goals) : undefined,
    },
    resumeUrl: formData.resumeUrl,
  };
}