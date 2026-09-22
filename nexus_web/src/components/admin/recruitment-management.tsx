"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Download, Eye, Edit, Trash2, Calendar, User, Mail, Phone, Building, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, X } from "lucide-react";
import { ApplicationStatus } from "@/lib/recruitment/schema";

interface RecruitmentApplication {
  id: string;
  submittedAt: string;
  status: ApplicationStatus;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    year: string;
    branch: string;
    studentId: string;
    city?: string;
    state?: string;
  };
  departmentInterest: {
    firstChoice: string;
    secondChoice: string;
    thirdChoice?: string;
    reason: string;
    relevantExperience?: string;
  };
  skills: {
    technicalSkills: string[];
    experience: string;
    projects: string;
    portfolioUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    otherSkills?: string;
    certifications?: string;
  };
  responses: {
    whyJoin: string;
    contribution: string;
    timeCommitment: string;
    otherActivities?: string;
    challenges?: string;
    goals?: string;
  };
  adminNotes?: string;
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  review: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  interview: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  accepted: "bg-green-500/10 text-green-400 border-green-500/30",
  rejected: "bg-red-500/10 text-red-400 border-red-500/30",
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending",
  review: "Under Review",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
};

export function RecruitmentManagement() {
  const [applications, setApplications] = useState<RecruitmentApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<RecruitmentApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<RecruitmentApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedApplication, setExpandedApplication] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, departmentFilter]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/recruitment/applications');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      setApplications(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setIsLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.personalInfo.fullName.toLowerCase().includes(lowerSearch) ||
        app.personalInfo.email.toLowerCase().includes(lowerSearch) ||
        app.personalInfo.studentId.toLowerCase().includes(lowerSearch)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(app =>
        app.departmentInterest.firstChoice === departmentFilter ||
        app.departmentInterest.secondChoice === departmentFilter ||
        app.departmentInterest.thirdChoice === departmentFilter
      );
    }

    setFilteredApplications(filtered);
  };

  const updateStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      const response = await fetch(`/api/recruitment/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchApplications(); // Refresh the list
      } else {
        console.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      const response = await fetch(`/api/recruitment/applications/${applicationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchApplications(); // Refresh the list
      } else {
        const errorData = await response.json();
        console.error('Failed to delete application:', errorData.error);
      }
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const exportApplications = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Year', 'Branch', 'Department 1', 'Department 2', 'Status', 'Submitted'].join(','),
      ...filteredApplications.map(app => [
        app.personalInfo.fullName,
        app.personalInfo.email,
        app.personalInfo.phone,
        app.personalInfo.year,
        app.personalInfo.branch,
        app.departmentInterest.firstChoice,
        app.departmentInterest.secondChoice,
        app.status,
        new Date(app.submittedAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recruitment-applications.csv';
    a.click();
  };

  const DEPARTMENTS = ["ADMINISTRATION", "TECHNOLOGY", "MEDIA_AND_MARKETING", "OPERATIONS", "PARTNERSHIPS"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Recruitment Management</h2>
          <p className="text-gray-400 mt-1">Manage recruitment applications and candidate statuses</p>
        </div>
        <button
          onClick={exportApplications}
          className="flex items-center gap-2 bg-[#4f9eff] hover:bg-[#3a8aee] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Total" value={applications.length} color="text-white" />
        <StatCard title="Pending" value={applications.filter(a => a.status === 'pending').length} color="text-yellow-400" />
        <StatCard title="Review" value={applications.filter(a => a.status === 'review').length} color="text-blue-400" />
        <StatCard title="Interview" value={applications.filter(a => a.status === 'interview').length} color="text-purple-400" />
        <StatCard title="Accepted" value={applications.filter(a => a.status === 'accepted').length} color="text-green-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "all")}
          className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#4f9eff] transition-colors"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="review">Under Review</option>
          <option value="interview">Interview</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#4f9eff] transition-colors"
        >
          <option value="all">All Departments</option>
          {DEPARTMENTS.map(dept => (
            <option key={dept} value={dept}>{dept.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filteredApplications.length === 0 ? (
          <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg p-8 text-center">
            <p className="text-gray-400">No applications found matching your criteria.</p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div key={application.id} className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-[#1a1a2e] rounded-full flex items-center justify-center text-white font-bold shrink-0">
                      {application.personalInfo.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{application.personalInfo.fullName}</h3>
                        <span className={`text-xs px-2 py-1 rounded border ${STATUS_COLORS[application.status]}`}>
                          {STATUS_LABELS[application.status]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          {application.personalInfo.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          {application.personalInfo.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          {application.personalInfo.year} Year
                        </div>
                        <div className="flex items-center gap-1">
                          <Building size={14} />
                          {application.personalInfo.branch}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className="text-gray-400">1st Choice:</span>
                        <span className="text-white">{application.departmentInterest.firstChoice.replace(/_/g, ' ')}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">2nd Choice:</span>
                        <span className="text-white">{application.departmentInterest.secondChoice.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedApplication(expandedApplication === application.id ? null : application.id)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {expandedApplication === application.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="text-gray-400 hover:text-[#4f9eff] transition-colors"
                      title="View Details"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => deleteApplication(application.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Quick Status Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-[#1a1a2e]">
                  <select
                    value={application.status}
                    onChange={(e) => updateStatus(application.id, e.target.value as ApplicationStatus)}
                    className="bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-[#4f9eff] transition-colors"
                  >
                    <option value="pending">Pending</option>
                    <option value="review">Under Review</option>
                    <option value="interview">Interview</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Expanded Details */}
                {expandedApplication === application.id && (
                  <div className="mt-4 pt-4 border-t border-[#1a1a2e] space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Technical Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {application.skills.technicalSkills.map((skill) => (
                          <span key={skill} className="bg-[#4f9eff]/10 text-[#4f9eff] px-2 py-1 rounded text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Why Join NEXUS</p>
                      <p className="text-white text-sm">{application.responses.whyJoin}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Contribution</p>
                      <p className="text-white text-sm">{application.responses.contribution}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar size={14} />
                      Submitted: {new Date(application.submittedAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onUpdateStatus={updateStatus}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg p-4">
      <p className="text-sm text-gray-400">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function ApplicationDetailModal({
  application,
  onClose,
  onUpdateStatus,
}: {
  application: RecruitmentApplication;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
}) {
  const [adminNotes, setAdminNotes] = useState(application.adminNotes || "");

  const handleSaveNotes = async () => {
    try {
      const response = await fetch(`/api/recruitment/applications/${application.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: application.status, adminNotes }),
      });

      if (response.ok) {
        onClose();
        fetchApplications(); // Refresh the list
      } else {
        console.error('Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Application Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-[#12121a] border border-[#1a1a2e] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Full Name</p>
                <p className="text-white">{application.personalInfo.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{application.personalInfo.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <p className="text-white">{application.personalInfo.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Student ID</p>
                <p className="text-white">{application.personalInfo.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Year</p>
                <p className="text-white">{application.personalInfo.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Branch</p>
                <p className="text-white">{application.personalInfo.branch}</p>
              </div>
              {(application.personalInfo.city || application.personalInfo.state) && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="text-white">{application.personalInfo.city}{application.personalInfo.city && application.personalInfo.state && ', '}{application.personalInfo.state}</p>
                </div>
              )}
            </div>
          </div>

          {/* Department Interest */}
          <div className="bg-[#12121a] border border-[#1a1a2e] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Department Interest</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-400">First Choice</p>
                <p className="text-white">{application.departmentInterest.firstChoice.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Second Choice</p>
                <p className="text-white">{application.departmentInterest.secondChoice.replace(/_/g, ' ')}</p>
              </div>
              {application.departmentInterest.thirdChoice && (
                <div>
                  <p className="text-sm text-gray-400">Third Choice</p>
                  <p className="text-white">{application.departmentInterest.thirdChoice.replace(/_/g, ' ')}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-400">Reason</p>
                <p className="text-white">{application.departmentInterest.reason}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-[#12121a] border border-[#1a1a2e] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Skills & Experience</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400 mb-2">Technical Skills</p>
                <div className="flex flex-wrap gap-2">
                  {application.skills.technicalSkills.map((skill) => (
                    <span key={skill} className="bg-[#4f9eff]/10 text-[#4f9eff] px-2 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Experience</p>
                <p className="text-white">{application.skills.experience}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Projects</p>
                <p className="text-white">{application.skills.projects}</p>
              </div>
              {(application.skills.portfolioUrl || application.skills.githubUrl || application.skills.linkedinUrl) && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Links</p>
                  <div className="space-y-1">
                    {application.skills.portfolioUrl && (
                      <a href={application.skills.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-[#4f9eff] hover:underline text-sm block">
                        Portfolio
                      </a>
                    )}
                    {application.skills.githubUrl && (
                      <a href={application.skills.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[#4f9eff] hover:underline text-sm block">
                        GitHub
                      </a>
                    )}
                    {application.skills.linkedinUrl && (
                      <a href={application.skills.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[#4f9eff] hover:underline text-sm block">
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}
              {application.skills.otherSkills && (
                <div>
                  <p className="text-sm text-gray-400">Other Skills</p>
                  <p className="text-white text-sm">{application.skills.otherSkills}</p>
                </div>
              )}
              {application.skills.certifications && (
                <div>
                  <p className="text-sm text-gray-400">Certifications</p>
                  <p className="text-white text-sm">{application.skills.certifications}</p>
                </div>
              )}
            </div>
          </div>

          {/* Responses */}
          <div className="bg-[#12121a] border border-[#1a1a2e] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Motivation & Commitment</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Why do you want to join NEXUS?</p>
                <p className="text-white">{application.responses.whyJoin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">How can you contribute?</p>
                <p className="text-white">{application.responses.contribution}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Time Commitment</p>
                <p className="text-white">{application.responses.timeCommitment}</p>
              </div>
              {application.responses.otherActivities && (
                <div>
                  <p className="text-sm text-gray-400">Other Activities</p>
                  <p className="text-white">{application.responses.otherActivities}</p>
                </div>
              )}
              {application.responses.challenges && (
                <div>
                  <p className="text-sm text-gray-400">Challenges Overcome</p>
                  <p className="text-white">{application.responses.challenges}</p>
                </div>
              )}
              {application.responses.goals && (
                <div>
                  <p className="text-sm text-gray-400">Goals</p>
                  <p className="text-white">{application.responses.goals}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Management */}
          <div className="bg-[#12121a] border border-[#1a1a2e] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Status Management</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Application Status</label>
                <select
                  value={application.status}
                  onChange={(e) => onUpdateStatus(application.id, e.target.value as ApplicationStatus)}
                  className="w-full bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff] transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="review">Under Review</option>
                  <option value="interview">Interview</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff] transition-colors resize-none"
                  placeholder="Add notes about this application..."
                />
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  Submitted: {new Date(application.submittedAt).toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  ID: {application.id.slice(0, 8)}...
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#1a1a2e] text-gray-300 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSaveNotes}
              className="px-4 py-2 rounded-lg bg-[#4f9eff] hover:bg-[#3a8aee] text-white transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}