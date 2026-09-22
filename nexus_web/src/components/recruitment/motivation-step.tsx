"use client";

import { QuestionResponses } from "@/lib/recruitment/schema";

interface MotivationStepProps {
  data: QuestionResponses;
  onChange: (data: QuestionResponses) => void;
  errors: Record<string, string>;
}

export function MotivationStep({ data, onChange, errors }: MotivationStepProps) {
  const handleChange = (field: keyof QuestionResponses, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Why do you want to join NEXUS? *
        </label>
        <textarea
          value={data.whyJoin}
          onChange={(e) => handleChange('whyJoin', e.target.value)}
          rows={4}
          className={`w-full bg-[#12121a] border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors resize-none ${
            errors.whyJoin ? 'border-red-500' : 'border-[#1a1a2e]'
          }`}
          placeholder="Share your motivation for joining NEXUS and what excites you about our organization..."
        />
        <div className="flex justify-between mt-1">
          {errors.whyJoin && (
            <p className="text-red-400 text-sm">{errors.whyJoin}</p>
          )}
          <p className="text-gray-500 text-sm ml-auto">
            {data.whyJoin.length}/1000 characters
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          How can you contribute to NEXUS? *
        </label>
        <textarea
          value={data.contribution}
          onChange={(e) => handleChange('contribution', e.target.value)}
          rows={4}
          className={`w-full bg-[#12121a] border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors resize-none ${
            errors.contribution ? 'border-red-500' : 'border-[#1a1a2e]'
          }`}
          placeholder="Describe your skills, ideas, or initiatives that could benefit NEXUS..."
        />
        <div className="flex justify-between mt-1">
          {errors.contribution && (
            <p className="text-red-400 text-sm">{errors.contribution}</p>
          )}
          <p className="text-gray-500 text-sm ml-auto">
            {data.contribution.length}/1000 characters
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Time Commitment *
        </label>
        <textarea
          value={data.timeCommitment}
          onChange={(e) => handleChange('timeCommitment', e.target.value)}
          rows={3}
          className={`w-full bg-[#12121a] border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors resize-none ${
            errors.timeCommitment ? 'border-red-500' : 'border-[#1a1a2e]'
          }`}
          placeholder="Describe your availability and how much time you can dedicate to NEXUS activities..."
        />
        <div className="flex justify-between mt-1">
          {errors.timeCommitment && (
            <p className="text-red-400 text-sm">{errors.timeCommitment}</p>
          )}
          <p className="text-gray-500 text-sm ml-auto">
            {data.timeCommitment.length}/500 characters
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Other Campus Activities (Optional)
        </label>
        <textarea
          value={data.otherActivities || ""}
          onChange={(e) => handleChange('otherActivities', e.target.value)}
          rows={3}
          className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors resize-none"
          placeholder="Mention any other clubs, sports, or activities you're involved in on campus..."
        />
        <p className="text-gray-500 text-sm mt-1 ml-auto">
          {data.otherActivities?.length || 0}/500 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Biggest Challenges You've Overcome (Optional)
        </label>
        <textarea
          value={data.challenges || ""}
          onChange={(e) => handleChange('challenges', e.target.value)}
          rows={3}
          className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors resize-none"
          placeholder="Describe a significant challenge you've overcome and what you learned from it..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Your Goals for the Next Year (Optional)
        </label>
        <textarea
          value={data.goals || ""}
          onChange={(e) => handleChange('goals', e.target.value)}
          rows={3}
          className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors resize-none"
          placeholder="What are your personal and professional goals for the upcoming year..."
        />
      </div>

      <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg p-4">
        <h4 className="text-white font-semibold mb-2">Tips for Great Responses:</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Be specific about your skills and experiences</li>
          <li>• Show genuine enthusiasm for NEXUS's mission</li>
          <li>• Connect your contributions to NEXUS's goals</li>
          <li>• Be realistic about your time availability</li>
          <li>• Highlight unique perspectives or experiences you bring</li>
        </ul>
      </div>
    </div>
  );
}