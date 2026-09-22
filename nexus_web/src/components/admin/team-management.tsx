"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, ChevronDown, ChevronUp } from "lucide-react";
import { teamMembers } from "@/data/team";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  responsibilities: string;
  avatarUrl: string;
  socials: {
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
  tenure: string;
  isCoreLead: boolean;
  order: number;
}

export function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  useEffect(() => {
    // Load actual team data
    setMembers(teamMembers);
  }, []);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this team member?")) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setIsAddModalOpen(true);
  };

  const handleSave = (member: TeamMember) => {
    if (editingMember) {
      setMembers(members.map(m => m.id === member.id ? member : m));
    } else {
      setMembers([...members, { ...member, id: member.name.toLowerCase().replace(/\s+/g, "-") }]);
    }
    setIsAddModalOpen(false);
    setEditingMember(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Team Members</h2>
          <p className="text-gray-400 mt-1">Manage team member profiles and roles</p>
        </div>
        <button
          onClick={() => {
            setEditingMember(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#4f9eff] hover:bg-[#3a8aee] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Member
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors"
        />
      </div>

      {/* Team Members List */}
      <div className="space-y-3">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1a1a2e] rounded-full flex items-center justify-center text-white font-bold">
                  {member.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{member.name}</h3>
                  <p className="text-sm text-gray-400">{member.role} • {member.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {expandedMember === member.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <button
                  onClick={() => handleEdit(member)}
                  className="text-gray-400 hover:text-[#4f9eff] transition-colors"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {expandedMember === member.id && (
              <div className="px-4 pb-4 border-t border-[#1a1a2e] pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Bio</p>
                    <p className="text-white mt-1">{member.bio}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Responsibilities</p>
                    <p className="text-white mt-1">{member.responsibilities}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tenure</p>
                    <p className="text-white mt-1">{member.tenure}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Core Lead</p>
                    <p className="text-white mt-1">{member.isCoreLead ? "Yes" : "No"}</p>
                  </div>
                </div>
                {Object.keys(member.socials).length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-500 text-sm">Social Links</p>
                    <div className="flex gap-2 mt-2">
                      {member.socials.linkedin && (
                        <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#4f9eff] hover:underline">
                          LinkedIn
                        </a>
                      )}
                      {member.socials.github && (
                        <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="text-[#4f9eff] hover:underline">
                          GitHub
                        </a>
                      )}
                      {member.socials.instagram && (
                        <a href={member.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-[#4f9eff] hover:underline">
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <TeamMemberModal
          member={editingMember}
          onSave={handleSave}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
}

function TeamMemberModal({
  member,
  onSave,
  onClose,
}: {
  member: TeamMember | null;
  onSave: (member: TeamMember) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<TeamMember>(
    member || {
      id: "",
      name: "",
      role: "",
      department: "TECHNOLOGY",
      bio: "",
      responsibilities: "",
      avatarUrl: "",
      socials: {},
      tenure: "",
      isCoreLead: false,
      order: 0,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-6">
          {member ? "Edit Team Member" : "Add Team Member"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
            >
              <option value="ADMINISTRATION">Administration</option>
              <option value="TECHNOLOGY">Technology</option>
              <option value="MEDIA_AND_MARKETING">Media & Marketing</option>
              <option value="OPERATIONS">Operations</option>
              <option value="PARTNERSHIPS">Partnerships</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff] h-24"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Responsibilities</label>
            <textarea
              value={formData.responsibilities}
              onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
              className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff] h-24"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={formData.socials.linkedin || ""}
                onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, linkedin: e.target.value } })}
                className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">GitHub URL</label>
              <input
                type="url"
                value={formData.socials.github || ""}
                onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, github: e.target.value } })}
                className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tenure</label>
              <input
                type="text"
                value={formData.tenure}
                onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
                placeholder="e.g., 2025 - Present"
                required
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="isCoreLead"
                checked={formData.isCoreLead}
                onChange={(e) => setFormData({ ...formData, isCoreLead: e.target.checked })}
                className="w-4 h-4 bg-[#12121a] border-[#1a1a2e] rounded"
              />
              <label htmlFor="isCoreLead" className="text-sm font-medium text-gray-300">Core Leadership</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#1a1a2e] text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#4f9eff] hover:bg-[#3a8aee] text-white transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}