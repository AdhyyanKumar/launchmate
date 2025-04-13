import { create } from 'zustand';
import { useAuthStore } from './authStore';

export interface Project {
  id: string;
  title: string;
  description: string;
  visibility: 'public' | 'private';
  lastEdited: string;
  dateCreated: string;
  collaborators: string[];
  stage: 'idea' | 'mvp' | 'fundraising' | 'launched';
  favorite: boolean;
  tags: string[];
  problem: string;
  targetAudience: string;
  ownerEmail: string;
  aiUpdates?: { content: string; createdAt: string }[];
}

interface ProjectState {
  projects: Project[];
  loading: boolean;
  loadProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<Project | null>;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleVisibility: (id: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,

  loadProjects: async () => {
    const { user } = useAuthStore.getState();
  
    console.log('Loading projects for user:', user); // ✅ log inside the store
  
    if (!user?.email || typeof user.email !== 'string') {
      console.warn('Missing or invalid user email in loadProjects');
      return;
    }
  
    set({ loading: true });
  
    try {
      const res = await fetch(`/api/projects?email=${user.email}`);
      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to load projects:", text);
        return;
      }
  
      const data = await res.json();
      const mapped = data.map((p: any) => ({
        ...p,
        id: p._id,
        visibility: p.visibility || 'private',   // ✅ fallback
        favorite: p.favorite || false,           // ✅ fallback
        collaborators: p.collaborators || [],    // ✅ fallback
      }));      
      set({ projects: mapped });
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      set({ loading: false });
    }
  },

  addProject: async (projectWithoutId) => {
    try {
      const res = await fetch('/api/projects.mjs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectWithoutId),
      });

      const text = await res.text();
      let savedProject;

      try {
        savedProject = JSON.parse(text);
      } catch (err) {
        console.error("Failed to parse response:", text);
        return null;
      }

      if (!res.ok) {
        console.error("Project create error:", savedProject.error || text);
        return null;
      }

      const fullProject: Project = {
        ...savedProject,
        id: savedProject.insertedId || savedProject.id || savedProject._id,
      };

      set((state) => ({
        projects: [fullProject, ...state.projects],
      }));

      return fullProject;
    } catch (error) {
      console.error("Error adding project:", error);
      return null;
    }
  },

  updateProject: (id, projectData) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id
          ? { ...project, ...projectData, lastEdited: new Date().toISOString() }
          : project
      ),
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
    })),

  toggleFavorite: (id) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id
          ? { ...project, favorite: !project.favorite }
          : project
      ),
    })),

  toggleVisibility: (id) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id
          ? {
              ...project,
              visibility: project.visibility === 'public' ? 'private' : 'public',
              lastEdited: new Date().toISOString(),
            }
          : project
      ),
    })),
}));
