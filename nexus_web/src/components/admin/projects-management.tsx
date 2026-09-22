"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, ExternalLink, Link, ChevronDown, ChevronUp, Star } from "lucide-react";
import { projectsData } from "@/data/projects";

interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
  contributors: Array<{ name: string; role?: string; github?: string }>;
  featured: boolean;
  completedYear: string;
  highlights: string[];
}

export function ProjectsManagement() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  useEffect(() => {
    // Load actual project data
    setProjects(projectsData);
  }, []);

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleEdit = (project: ProjectItem) => {
    setEditingProject(project);
    setIsAddModalOpen(true);
  };

  const handleSave = (project: ProjectItem) => {
    if (editingProject) {
      setProjects(projects.map(p => p.id === project.id ? project : p));
    } else {
      setProjects([...projects, { ...project, id: project.slug }]);
    }
    setIsAddModalOpen(false);
    setEditingProject(null);
  };

  const toggleFeatured = (id: string) => {
    setProjects(projects.map(p => 
      p.id === id ? { ...p, featured: !p.featured } : p
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <p className="text-gray-400 mt-1">Manage project listings and technical details</p>
        </div>
        <button
          onClick={() => {
            setEditingProject(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#4f9eff] hover:bg-[#3a8aee] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Project
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f9eff] transition-colors"
        />
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">{project.title}</h3>
                    {project.featured && <Star className="text-yellow-500 fill-yellow-500" size={16} />}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{project.tagline}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-[#1a1a2e] text-gray-300 px-2 py-1 rounded">{project.category}</span>
                    <span className="text-xs text-gray-500">{project.completedYear}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFeatured(project.id)}
                  className={`p-2 rounded-lg transition-colors ${project.featured ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-500 hover:text-yellow-500'}`}
                  title={project.featured ? "Remove from featured" : "Add to featured"}
                >
                  <Star size={18} />
                </button>
                <button
                  onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {expandedProject === project.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <button
                  onClick={() => handleEdit(project)}
                  className="text-gray-400 hover:text-[#4f9eff] transition-colors"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {expandedProject === project.id && (
              <div className="px-4 pb-4 border-t border-[#1a1a2e] pt-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-500 text-sm">Description</p>
                    <p className="text-white mt-1">{project.description}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 text-sm">Tech Stack</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.techStack.map((tech, index) => (
                        <span key={index} className="text-xs bg-[#1a1a2e] text-gray-300 px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm">Highlights</p>
                    <ul className="mt-2 space-y-1">
                      {project.highlights.map((highlight, index) => (
                        <li key={index} className="text-sm text-white flex items-start gap-2">
                          <span className="text-[#4f9eff]">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm">Contributors</p>
                    <div className="mt-2 space-y-1">
                      {project.contributors.map((contributor, index) => (
                        <div key={index} className="text-sm text-white">
                          {contributor.name} {contributor.role && <span className="text-gray-400">({contributor.role})</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#4f9eff] hover:underline">
                        <Link size={16} />
                        GitHub
                      </a>
                    )}
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#4f9eff] hover:underline">
                        <ExternalLink size={16} />
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <ProjectModal
          project={editingProject}
          onSave={handleSave}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
}

function ProjectModal({
  project,
  onSave,
  onClose,
}: {
  project: ProjectItem | null;
  onSave: (project: ProjectItem) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<ProjectItem>(
    project || {
      id: "",
      slug: "",
      title: "",
      tagline: "",
      description: "",
      category: "WEB",
      techStack: [],
      githubUrl: "",
      liveUrl: "",
      contributors: [],
      featured: false,
      completedYear: new Date().getFullYear().toString(),
      highlights: [],
    }
  );

  const [techStackInput, setTechStackInput] = useState("");
  const [highlightsInput, setHighlightsInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addTechStack = () => {
    if (techStackInput.trim()) {
      setFormData({ ...formData, techStack: [...formData.techStack, techStackInput.trim()] });
      setTechStackInput("");
    }
  };

  const removeTechStack = (index: number) => {
    setFormData({ ...formData, techStack: formData.techStack.filter((_, i) => i !== index) });
  };

  const addHighlight = () => {
    if (highlightsInput.trim()) {
      setFormData({ ...formData, highlights: [...formData.highlights, highlightsInput.trim()] });
      setHighlightsInput("");
    }
  };

  const removeHighlight = (index: number) => {
    setFormData({ ...formData, highlights: formData.highlights.filter((_, i) => i !== index) });
  };

  const addContributor = () => {
    setFormData({ ...formData, contributors: [...formData.contributors, { name: "" }] });
  };

  const updateContributor = (index: number, field: string, value: string) => {
    const newContributors = [...formData.contributors];
    newContributors[index] = { ...newContributors[index], [field]: value };
    setFormData({ ...formData, contributors: newContributors });
  };

  const removeContributor = (index: number) => {
    setFormData({ ...formData, contributors: formData.contributors.filter((_, i) => i !== index) });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-6">
          {project ? "Edit Project" : "Add Project"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
                placeholder="project-slug"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff] h-24"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
              >
                <option value="WEB">Web</option>
                <option value="AI_ML">AI/ML</option>
                <option value="IOT_EMBEDDED">IoT/Embedded</option>
                <option value="MOBILE">Mobile</option>
                <option value="BLOCKCHAIN">Blockchain</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Completed Year</label>
              <input
                type="text"
                value={formData.completedYear}
                onChange={(e) => setFormData({ ...formData, completedYear: e.target.value })}
                className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tech Stack</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack())}
                className="flex-1 bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
                placeholder="Add technology"
              />
              <button
                type="button"
                onClick={addTechStack}
                className="px-4 py-2 bg-[#1a1a2e] text-white rounded-lg hover:bg-[#2a2a3e] transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.techStack.map((tech, index) => (
                <span key={index} className="bg-[#1a1a2e] text-gray-300 px-2 py-1 rounded flex items-center gap-2">
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechStack(index)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Highlights</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={highlightsInput}
                onChange={(e) => setHighlightsInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                className="flex-1 bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
                placeholder="Add highlight"
              />
              <button
                type="button"
                onClick={addHighlight}
                className="px-4 py-2 bg-[#1a1a2e] text-white rounded-lg hover:bg-[#2a2a3e] transition-colors"
              >
                Add
              </button>
            </div>
            <div className="space-y-1">
              {formData.highlights.map((highlight, index) => (
                <div key={index} className="bg-[#1a1a2e] text-gray-300 px-3 py-2 rounded flex items-center justify-between">
                  {highlight}
                  <button
                    type="button"
                    onClick={() => removeHighlight(index)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">GitHub URL</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Live URL</label>
              <input
                type="url"
                value={formData.liveUrl || ""}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">Contributors</label>
              <button
                type="button"
                onClick={addContributor}
                className="text-sm text-[#4f9eff] hover:underline"
              >
                + Add Contributor
              </button>
            </div>
            <div className="space-y-2">
              {formData.contributors.map((contributor, index) => (
                <div key={index} className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={contributor.name}
                    onChange={(e) => updateContributor(index, 'name', e.target.value)}
                    className="bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
                    placeholder="Name"
                    required
                  />
                  <input
                    type="text"
                    value={contributor.role || ""}
                    onChange={(e) => updateContributor(index, 'role', e.target.value)}
                    className="bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
                    placeholder="Role (optional)"
                  />
                  <button
                    type="button"
                    onClick={() => removeContributor(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 bg-[#12121a] border-[#1a1a2e] rounded"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-300">Featured Project</label>
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