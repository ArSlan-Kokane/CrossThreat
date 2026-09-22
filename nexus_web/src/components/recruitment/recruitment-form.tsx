"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, RotateCcw } from "lucide-react";
import { PersonalInfoStep } from "./personal-info-step";
import { DepartmentStep } from "./department-step";
import { SkillsStep } from "./skills-step";
import { MotivationStep } from "./motivation-step";
import { ReviewStep } from "./review-step";
import { RecruitmentFormData } from "@/lib/recruitment/schema";
import { validatePersonalInfo, validateDepartmentInterest, validateSkillsInfo, validateResponses } from "@/lib/recruitment/validation";

type FormStep = "personal" | "department" | "skills" | "motivation" | "review";

const STEPS: { id: FormStep; title: string; description: string }[] = [
  { id: "personal", title: "Personal Information", description: "Tell us about yourself" },
  { id: "department", title: "Department Interest", description: "Choose your preferred departments" },
  { id: "skills", title: "Skills & Experience", description: "Showcase your technical skills" },
  { id: "motivation", title: "Motivation & Commitment", description: "Why do you want to join?" },
  { id: "review", title: "Review & Submit", description: "Finalize your application" },
];

export function RecruitmentForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>("personal");
  const [formData, setFormData] = useState<Partial<RecruitmentFormData>>({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      year: "1st",
      branch: "",
      studentId: "",
      city: "",
      state: "",
    },
    departmentInterest: {
      firstChoice: "TECHNOLOGY",
      secondChoice: "MEDIA_AND_MARKETING",
      reason: "",
      relevantExperience: "",
    },
    skills: {
      technicalSkills: [],
      experience: "",
      projects: "",
      otherSkills: "",
      certifications: "",
    },
    responses: {
      whyJoin: "",
      contribution: "",
      timeCommitment: "",
      otherActivities: "",
      challenges: "",
      goals: "",
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedApplicationId, setSubmittedApplicationId] = useState<string>("");
  const [hasSavedData, setHasSavedData] = useState(false);

  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep);

  // Auto-save to localStorage
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem('recruitment-form-draft', JSON.stringify(formData));
      setHasSavedData(true);
    }
  }, [formData]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('recruitment-form-draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
        setHasSavedData(true);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  const clearSavedData = () => {
    localStorage.removeItem('recruitment-form-draft');
    setHasSavedData(false);
    // Reset form to initial state
    setFormData({
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        year: "1st",
        branch: "",
        studentId: "",
        city: "",
        state: "",
      },
      departmentInterest: {
        firstChoice: "TECHNOLOGY",
        secondChoice: "MEDIA_AND_MARKETING",
        reason: "",
        relevantExperience: "",
      },
      skills: {
        technicalSkills: [],
        experience: "",
        projects: "",
        otherSkills: "",
        certifications: "",
      },
      responses: {
        whyJoin: "",
        contribution: "",
        timeCommitment: "",
        otherActivities: "",
        challenges: "",
        goals: "",
      },
    });
  };

  const updateFormData = (section: keyof RecruitmentFormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
    // Clear errors for the updated fields
    if (section === 'personalInfo') {
      setErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(data).forEach(key => delete newErrors[key]);
        return newErrors;
      });
    }
  };

  const validateCurrentStep = (): boolean => {
    let stepErrors: Record<string, string> = {};

    switch (currentStep) {
      case "personal":
        const personalErrors = validatePersonalInfo(formData.personalInfo!);
        stepErrors = Object.fromEntries(personalErrors.map(e => [e.field, e.message]));
        break;
      case "department":
        const deptErrors = validateDepartmentInterest(formData.departmentInterest!);
        stepErrors = Object.fromEntries(deptErrors.map(e => [e.field, e.message]));
        break;
      case "skills":
        const skillsErrors = validateSkillsInfo(formData.skills!);
        stepErrors = Object.fromEntries(skillsErrors.map(e => [e.field, e.message]));
        break;
      case "motivation":
        const responseErrors = validateResponses(formData.responses!);
        stepErrors = Object.fromEntries(responseErrors.map(e => [e.field, e.message]));
        break;
      case "review":
        // Validate all sections for final review
        const personalValidationErrors = validatePersonalInfo(formData.personalInfo!);
        const deptValidationErrors = validateDepartmentInterest(formData.departmentInterest!);
        const skillsValidationErrors = validateSkillsInfo(formData.skills!);
        const responseValidationErrors = validateResponses(formData.responses!);
        
        stepErrors = Object.fromEntries([
          ...personalValidationErrors.map(e => [e.field, e.message]),
          ...deptValidationErrors.map(e => [e.field, e.message]),
          ...skillsValidationErrors.map(e => [e.field, e.message]),
          ...responseValidationErrors.map(e => [e.field, e.message])
        ]);
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      const nextStepIndex = Math.min(currentStepIndex + 1, STEPS.length - 1);
      setCurrentStep(STEPS[nextStepIndex].id);
    }
  };

  const handlePrevious = () => {
    const prevStepIndex = Math.max(currentStepIndex - 1, 0);
    setCurrentStep(STEPS[prevStepIndex].id);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/recruitment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmittedApplicationId(result.applicationId);
        setIsSubmitted(true);
        // Clear saved data after successful submission
        clearSavedData();
      } else {
        setErrors({ submit: result.error || 'Failed to submit application' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Application Submitted Successfully!</h2>
          <p className="text-gray-400 mb-6">
            Thank you for your interest in joining NEXUS. We have received your application and will review it shortly.
          </p>
          <div className="bg-[#12121a] border border-[#1a1a2e] rounded-lg p-4 text-left mb-4">
            <p className="text-sm text-gray-400 mb-2">Application ID:</p>
            <p className="text-white font-mono text-lg">{submittedApplicationId}</p>
          </div>
          <div className="bg-[#12121a] border border-[#1a1a2e] rounded-lg p-4 text-left mb-6">
            <p className="text-sm text-gray-400 mb-2">Email:</p>
            <p className="text-white font-mono">{formData.personalInfo?.email}</p>
          </div>
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg p-4 text-left mb-6">
            <p className="text-sm text-gray-400">
              <span className="text-[#4f9eff] font-medium">Important:</span> Please save your Application ID for future reference. 
              You can use it to track your application status.
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-2 bg-[#4f9eff] hover:bg-[#3a8aee] text-white px-6 py-3 rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    index <= currentStepIndex
                      ? 'bg-[#4f9eff] text-white'
                      : 'bg-[#1a1a2e] text-gray-500'
                  }`}
                >
                  {index < currentStepIndex ? <CheckCircle size={20} /> : index + 1}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${
                    index <= currentStepIndex ? 'text-white' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors ${
                    index < currentStepIndex ? 'bg-[#4f9eff]' : 'bg-[#1a1a2e]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {STEPS[currentStepIndex].title}
              </h2>
              <p className="text-gray-400">
                {STEPS[currentStepIndex].description}
              </p>
            </div>
            {hasSavedData && (
              <button
                onClick={clearSavedData}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                title="Clear saved progress"
              >
                <RotateCcw size={16} />
                Clear Draft
              </button>
            )}
          </div>
        </div>

        {currentStep === "personal" && (
          <PersonalInfoStep
            data={formData.personalInfo!}
            onChange={(data) => updateFormData('personalInfo', data)}
            errors={errors}
          />
        )}

        {currentStep === "department" && (
          <DepartmentStep
            data={formData.departmentInterest!}
            onChange={(data) => updateFormData('departmentInterest', data)}
            errors={errors}
          />
        )}

        {currentStep === "skills" && (
          <SkillsStep
            data={formData.skills!}
            onChange={(data) => updateFormData('skills', data)}
            errors={errors}
          />
        )}

        {currentStep === "motivation" && (
          <MotivationStep
            data={formData.responses!}
            onChange={(data) => updateFormData('responses', data)}
            errors={errors}
          />
        )}

        {currentStep === "review" && (
          <ReviewStep
            formData={formData as RecruitmentFormData}
            onChange={setFormData}
            errors={errors}
          />
        )}

        {/* Error Display */}
        {errors.submit && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400">
            {errors.submit}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#1a1a2e] text-gray-300 hover:text-white hover:bg-[#1a1a2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {currentStep === "review" ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#4f9eff] hover:bg-[#3a8aee] text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
              {isSubmitting ? null : <CheckCircle size={20} />}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-[#4f9eff] hover:bg-[#3a8aee] text-white px-6 py-3 rounded-lg transition-colors"
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}