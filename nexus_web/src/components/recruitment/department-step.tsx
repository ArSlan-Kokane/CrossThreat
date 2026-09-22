"use client";

import { DepartmentInterest, Department } from "@/lib/recruitment/schema";

const DEPARTMENTS: { value: Department; label: string; description: string }[] = [
  {
    value: "ADMINISTRATION",
    label: "Administration",
    description: "Strategic leadership, organizational oversight, and institutional alignment"
  },
  {
    value: "TECHNOLOGY",
    label: "Technology",
    description: "Software development, architecture, and technical mentorship"
  },
  {
    value: "MEDIA_AND_MARKETING",
    label: "Media & Marketing",
    description: "Brand identity, creative direction, and social media management"
  },
  {
    value: "OPERATIONS",
    label: "Operations",
    description: "Event logistics, financial management, and operational workflows"
  },
  {
    value: "PARTNERSHIPS",
    label: "Partnerships",
    description: "External relations, sponsorships, and collaborative opportunities"
  },
];

interface DepartmentStepProps {
  data: DepartmentInterest;
  onChange: (data: DepartmentInterest) => void;
  errors: Record<string, string>;
}

export function DepartmentStep({ data, onChange, errors }: DepartmentStepProps) {
  const handleChange = (field: keyof DepartmentInterest, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const getAvailableDepartments = (exclude?: Department) => {
    return DEPARTMENTS.filter(dept => dept.value !== exclude);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            First Choice Department *
          </label>
          <select
            value={data.firstChoice}
            onChange={(e) => handleChange('firstChoice', e.target.value as Department)}
            className={`w-full bg-[#12121a] border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#4f9eff] transition-colors ${
              errors.firstChoice ? 'border-red-500' : 'border-[#1a1a2e]'
            }`}
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>
          {errors.firstChoice && (
            <p className="text-red-400 text-sm mt-1">{errors.firstChoice}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Second Choice Department *
          </label>
          <select
            value={data.secondChoice}
            onChange={(e) => handleChange('secondChoice', e.target.value as Department)}
            className={`w-full bg-[#12121a] border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#4f9eff] transition-colors ${
              errors.secondChoice ? 'border-red-500' : 'border-[#1a1a2e]'
            }`}
          >
            {getAvailableDepartments(data.firstChoice).map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>
          {errors.secondChoice && (
            <p className="text-red-400 text-sm mt-1">{errors.secondChoice}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Third Choice Department (Optional)
          </label>
          <select
            value={data.thirdChoice || ""}
            onChange={(e) => handleChange('thirdChoice', e.target.value as Department || undefined)}
            className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#4f9eff] transition-colors"
          >
            <option value="">Select a department (optional)</option>
            {getAvailableDepartments(data.firstChoice)
              .filter(dept => dept.value !== data.secondChoice)
              .map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Why do you prefer these departments? *
        </label>
        <textarea
          value={data.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
          rows={4}
          className={`w-full bg-[#12121a] border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors resize-none ${
            errors.reason ? 'border-red-500' : 'border-[#1a1a2e]'
          }`}
          placeholder="Explain your interest in these departments and how your skills align with them..."
        />
        <div className="flex justify-between mt-1">
          {errors.reason && (
            <p className="text-red-400 text-sm">{errors.reason}</p>
          )}
          <p className="text-gray-500 text-sm ml-auto">
            {data.reason.length}/500 characters
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Relevant Experience (Optional)
        </label>
        <textarea
          value={data.relevantExperience || ""}
          onChange={(e) => handleChange('relevantExperience', e.target.value)}
          rows={3}
          className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors resize-none"
          placeholder="Any specific experience relevant to your chosen departments..."
        />
      </div>

      {/* Department Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEPARTMENTS.map((dept) => (
          <div
            key={dept.value}
            className={`p-4 rounded-lg border transition-colors ${
              [data.firstChoice, data.secondChoice, data.thirdChoice].includes(dept.value)
                ? 'bg-[#4f9eff]/10 border-[#4f9eff]'
                : 'bg-[#12121a] border-[#1a1a2e]'
            }`}
          >
            <h4 className="text-white font-semibold mb-1">{dept.label}</h4>
            <p className="text-sm text-gray-400">{dept.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}