"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { SkillsInfo } from "@/lib/recruitment/schema";

const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "React", "Node.js",
  "Next.js", "HTML/CSS", "SQL", "MongoDB", "Git", "Docker", "AWS",
  "UI/UX Design", "Video Editing", "Graphic Design", "Social Media Marketing",
  "Event Management", "Public Speaking", "Leadership", "Project Management"
];

interface SkillsStepProps {
  data: SkillsInfo;
  onChange: (data: SkillsInfo) => void;
  errors: Record<string, string>;
}

export function SkillsStep({ data, onChange, errors }: SkillsStepProps) {
  const [skillInput, setSkillInput] = useState("");

  const handleChange = (field: keyof SkillsInfo, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addSkill = () => {
    if (skillInput.trim() && !data.technicalSkills.includes(skillInput.trim())) {
      handleChange('technicalSkills', [...data.technicalSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    handleChange('technicalSkills', data.technicalSkills.filter(skill => skill !== skillToRemove));
  };

  const addCommonSkill = (skill: string) => {
    if (!data.technicalSkills.includes(skill)) {
      handleChange('technicalSkills', [...data.technicalSkills, skill]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Technical Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Technical Skills *
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            className="flex-1 bg-[#12121a] border border-[#1a1a2e] rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors"
            placeholder="Type a skill and press Enter"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-3 bg-[#4f9eff] hover:bg-[#3a8aee] text-white rounded-lg transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Selected Skills */}
        {data.technicalSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {data.technicalSkills.map((skill) => (
              <div
                key={skill}
                className="flex items-center gap-2 bg-[#4f9eff]/10 border border-[#4f9eff]/30 text-[#4f9eff] px-3 py-2 rounded-lg"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Common Skills Suggestions */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Common skills (click to add):</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => addCommonSkill(skill)}
                disabled={data.technicalSkills.includes(skill)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  data.technicalSkills.includes(skill)
                    ? 'bg-[#4f9eff]/20 text-[#4f9eff] cursor-not-allowed'
                    : 'bg-[#1a1a2e] text-gray-300 hover:bg-[#2a2a3e] hover:text-white'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {errors.technicalSkills && (
          <p className="text-red-400 text-sm mt-2">{errors.technicalSkills}</p>
        )}
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Previous Experience *
        </label>
        <textarea
          value={data.experience}
          onChange={(e) => handleChange('experience', e.target.value)}
          rows={4}
          className={`w-full bg-[#12121a] border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors resize-none ${
            errors.experience ? 'border-red-500' : 'border-[#1a1a2e]'
          }`}
          placeholder="Describe your previous experience in clubs, projects, internships, or any relevant activities..."
        />
        <div className="flex justify-between mt-1">
          {errors.experience && (
            <p className="text-red-400 text-sm">{errors.experience}</p>
          )}
          <p className="text-gray-500 text-sm ml-auto">
            {data.experience.length}/1000 characters
          </p>
        </div>
      </div>

      {/* Projects */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Projects Description *
        </label>
        <textarea
          value={data.projects}
          onChange={(e) => handleChange('projects', e.target.value)}
          rows={4}
          className={`w-full bg-[#12121a] border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors resize-none ${
            errors.projects ? 'border-red-500' : 'border-[#1a1a2e]'
          }`}
          placeholder="Tell us about projects you've worked on, your role, and the technologies used..."
        />
        <div className="flex justify-between mt-1">
          {errors.projects && (
            <p className="text-red-400 text-sm">{errors.projects}</p>
          )}
          <p className="text-gray-500 text-sm ml-auto">
            {data.projects.length}/1000 characters
          </p>
        </div>
      </div>

      {/* Optional URLs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Portfolio URL (Optional)
          </label>
          <input
            type="url"
            value={data.portfolioUrl || ""}
            onChange={(e) => handleChange('portfolioUrl', e.target.value)}
            className={`w-full bg-[#12121a] border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors ${
              errors.portfolioUrl ? 'border-red-500' : 'border-[#1a1a2e]'
            }`}
            placeholder="https://yourportfolio.com"
          />
          {errors.portfolioUrl && (
            <p className="text-red-400 text-sm mt-1">{errors.portfolioUrl}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            GitHub URL (Optional)
          </label>
          <input
            type="url"
            value={data.githubUrl || ""}
            onChange={(e) => handleChange('githubUrl', e.target.value)}
            className={`w-full bg-[#12121a] border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors ${
              errors.githubUrl ? 'border-red-500' : 'border-[#1a1a2e]'
            }`}
            placeholder="https://github.com/username"
          />
          {errors.githubUrl && (
            <p className="text-red-400 text-sm mt-1">{errors.githubUrl}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            LinkedIn URL (Optional)
          </label>
          <input
            type="url"
            value={data.linkedinUrl || ""}
            onChange={(e) => handleChange('linkedinUrl', e.target.value)}
            className={`w-full bg-[#12121a] border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors ${
              errors.linkedinUrl ? 'border-red-500' : 'border-[#1a1a2e]'
            }`}
            placeholder="https://linkedin.com/in/username"
          />
          {errors.linkedinUrl && (
            <p className="text-red-400 text-sm mt-1">{errors.linkedinUrl}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Other Skills (Optional)
          </label>
          <textarea
            value={data.otherSkills || ""}
            onChange={(e) => handleChange('otherSkills', e.target.value)}
            rows={3}
            className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors resize-none"
            placeholder="Any other skills not mentioned above..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Certifications (Optional)
          </label>
          <textarea
            value={data.certifications || ""}
            onChange={(e) => handleChange('certifications', e.target.value)}
            rows={3}
            className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors resize-none"
            placeholder="Any certifications or courses you've completed..."
          />
        </div>
      </div>
    </div>
  );
}