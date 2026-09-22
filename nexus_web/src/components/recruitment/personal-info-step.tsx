"use client";

import { PersonalInfo } from "@/lib/recruitment/schema";

interface PersonalInfoStepProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
  errors: Record<string, string>;
}

export function PersonalInfoStep({ data, onChange, errors }: PersonalInfoStepProps) {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className={`w-full bg-[#12121a] border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors ${
              errors.fullName ? 'border-red-500' : 'border-[#1a1a2e]'
            }`}
            placeholder="Enter your full name"
          />
          {errors.fullName && (
            <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full bg-[#12121a] border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors ${
              errors.email ? 'border-red-500' : 'border-[#1a1a2e]'
            }`}
            placeholder="your.email@example.com"
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full bg-[#12121a] border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors ${
              errors.phone ? 'border-red-500' : 'border-[#1a1a2e]'
            }`}
            placeholder="10-digit phone number"
          />
          {errors.phone && (
            <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Current Year *
          </label>
          <select
            value={data.year}
            onChange={(e) => handleChange('year', e.target.value)}
            className={`w-full bg-[#12121a] border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#4f9eff] transition-colors ${
              errors.year ? 'border-red-500' : 'border-[#1a1a2e]'
            }`}
          >
            <option value="1st">1st Year</option>
            <option value="2nd">2nd Year</option>
            <option value="3rd">3rd Year</option>
            <option value="4th">4th Year</option>
          </select>
          {errors.year && (
            <p className="text-red-400 text-sm mt-1">{errors.year}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Branch/Department *
          </label>
          <input
            type="text"
            value={data.branch}
            onChange={(e) => handleChange('branch', e.target.value)}
            className={`w-full bg-[#12121a] border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors ${
              errors.branch ? 'border-red-500' : 'border-[#1a1a2e]'
            }`}
            placeholder="e.g., Computer Engineering, Mechanical, etc."
          />
          {errors.branch && (
            <p className="text-red-400 text-sm mt-1">{errors.branch}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Student ID *
          </label>
          <input
            type="text"
            value={data.studentId}
            onChange={(e) => handleChange('studentId', e.target.value)}
            className={`w-full bg-[#12121a] border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors ${
              errors.studentId ? 'border-red-500' : 'border-[#1a1a2e]'
            }`}
            placeholder="Your college student ID"
          />
          {errors.studentId && (
            <p className="text-red-400 text-sm mt-1">{errors.studentId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            City (Optional)
          </label>
          <input
            type="text"
            value={data.city || ""}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors"
            placeholder="Your city"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            State (Optional)
          </label>
          <input
            type="text"
            value={data.state || ""}
            onChange={(e) => handleChange('state', e.target.value)}
            className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors"
            placeholder="Your state"
          />
        </div>
      </div>

      <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg p-4">
        <p className="text-sm text-gray-400">
          <span className="text-[#4f9eff] font-medium">Note:</span> All fields marked with * are required. 
          Please ensure your contact information is accurate as we will use it to communicate about your application.
        </p>
      </div>
    </div>
  );
}