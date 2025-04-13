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
  milestones?: {
    [phaseId: string]: {
      title: string;
      dueDate: string;
      completed?: boolean;
      tasks: {
        title: string;
        completed: boolean;
      }[];
    }[];
  };  
}

interface ProjectState {
  projects: Project[];
  loading: boolean;
  loadProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<Project | null>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
  toggleVisibility: (id: string) => void;
  toggleMilestoneTask: (
    projectId: string,
    phaseId: string,
    milestoneTitle: string,
    taskIndex: number
  ) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,

  loadProjects: async () => {
    const { user } = useAuthStore.getState();

    console.log('Loading projects for user:', user);

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
        visibility: p.visibility || 'private',
        favorite: p.favorite || false,
        collaborators: p.collaborators || [],
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

  updateProject: async (id, projectData) => {
    try {
      const res = await fetch('/api/projects.mjs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...projectData }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Failed to update project:', text);
        return;
      }

      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id
            ? { ...project, ...projectData, lastEdited: new Date().toISOString() }
            : project
        ),
      }));
    } catch (error) {
      console.error('Error updating project:', error);
    }
  },

  deleteProject: async (id) => {
    try {
      const res = await fetch(`/api/projects.mjs?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Failed to delete project:', text);
        return;
      }

      set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
      }));
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  },

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

    toggleMilestoneTask: (
      projectId: string,
      phaseId: string,
      milestoneTitle: string,
      taskIndex: number
    ) => {
      set((state) => {
        const updatedProjects = state.projects.map((project) => {
          if (project.id !== projectId) return project;
  
          // Clone project
          const updatedProject = { ...project };
          const phaseMilestones = updatedProject.milestones?.[phaseId] || [];
  
          const updatedMilestones = phaseMilestones.map((milestone) => {
            if (milestone.title !== milestoneTitle) return milestone;
  
            const updatedTasks = milestone.tasks.map((task, index) =>
              index === taskIndex
                ? { ...task, completed: !task.completed }
                : task
            );
  
            const updatedMilestone = {
              ...milestone,
              tasks: updatedTasks,
              completed: updatedTasks.every((t) => t.completed),
            };
  
            return updatedMilestone;
          });
  
          // Save updated milestones to phase
          updatedProject.milestones = {
            ...updatedProject.milestones,
            [phaseId]: updatedMilestones,
          };
  
          return updatedProject;
        });
  
        return { projects: updatedProjects };
      })},
}));
