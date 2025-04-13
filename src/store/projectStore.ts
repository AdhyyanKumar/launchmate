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
  stage: 'idea' | 'validation' | 'mvp' | 'early_users' | 'scaling';
  favorite: boolean;
  tags: string[];
  problem: string;
  targetAudience: string;
  ownerEmail: string;
  aiUpdates?: { content: string; createdAt: string }[];
  milestones?: {
    [phaseId: string]: {
      title: string;
      description: string;
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

const milestoneTemplates: Project['milestones'] = {
  idea: [
    {
      title: 'Idea Development',
      description: 'Flesh out your idea and conduct initial research',
      dueDate: new Date().toISOString(),
      completed: false,
      tasks: [
        { title: 'Define core problem and solution', completed: false },
        { title: 'Research market size and potential', completed: false },
        { title: 'Identify target audience', completed: false },
        { title: 'Document initial business model', completed: false }
      ]
    }
  ],
  validation: [
    {
      title: 'Market Validation',
      description: 'Test your idea with potential users',
      dueDate: new Date().toISOString(),
      completed: false,
      tasks: [
        { title: 'Create user interview script', completed: false },
        { title: 'Conduct 25 user interviews', completed: false },
        { title: 'Analyze feedback and insights', completed: false },
        { title: 'Refine idea based on feedback', completed: false }
      ]
    }
  ],
  mvp: [
    {
      title: 'Value Proposition',
      description: 'Define value proposition and MVP scope',
      dueDate: new Date().toISOString(),
      completed: false,
      tasks: [
        { title: 'Define core features for MVP', completed: false },
        { title: 'Create feature prioritization matrix', completed: false },
        { title: 'Set development milestones', completed: false },
        { title: 'Create MVP timeline', completed: false }
      ]
    }
  ],
  early_users: [
    {
      title: 'Early User Testing',
      description: 'Launch and test with initial user group',
      dueDate: new Date().toISOString(),
      completed: false,
      tasks: [
        { title: 'Launch MVP to test group', completed: false },
        { title: 'Collect feedback from users', completed: false },
        { title: 'Track engagement metrics', completed: false },
        { title: 'Implement critical fixes', completed: false }
      ]
    }
  ],
  scaling: [
    {
      title: 'Growth & Fundraising',
      description: 'Scale the product and secure funding',
      dueDate: new Date().toISOString(),
      completed: false,
      tasks: [
        { title: 'Track key growth metrics', completed: false },
        { title: 'Create investor pitch deck', completed: false },
        { title: 'Develop scaling roadmap', completed: false },
        { title: 'Begin investor outreach', completed: false }
      ]
    }
  ]
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,

  loadProjects: async () => {
    const { user } = useAuthStore.getState();
    if (!user?.email || typeof user.email !== 'string') return;
    set({ loading: true });
    try {
      const res = await fetch(`/api/projects?email=${user.email}`);
      const data = await res.json();
      const mapped = data.map((p: any) => ({
        ...p,
        id: p._id,
        visibility: p.visibility || 'private',
        favorite: p.favorite || false,
        collaborators: p.collaborators || [],
        milestones: p.milestones || milestoneTemplates,
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
        body: JSON.stringify({ ...projectWithoutId, milestones: milestoneTemplates })
      });

      const text = await res.text();
      const savedProject = JSON.parse(text);

      const fullProject: Project = {
        ...savedProject,
        id: savedProject.insertedId || savedProject.id || savedProject._id,
      };

      set((state) => ({ projects: [fullProject, ...state.projects] }));
      return fullProject;
    } catch (error) {
      console.error('Error adding project:', error);
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
        project.id === id ? { ...project, favorite: !project.favorite } : project
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

  toggleMilestoneTask: (projectId, phaseId, milestoneTitle, taskIndex) => {
    set((state) => {
      const updatedProjects = state.projects.map((project) => {
        if (project.id !== projectId) return project;

        const updatedProject = { ...project };
        const currentMilestones = updatedProject.milestones?.[phaseId] || [];

        const updatedMilestones = currentMilestones.map((milestone) => {
          if (milestone.title !== milestoneTitle) return milestone;

          const updatedTasks = milestone.tasks.map((task, index) =>
            index === taskIndex ? { ...task, completed: !task.completed } : task
          );

          return {
            ...milestone,
            tasks: updatedTasks,
            completed: updatedTasks.every((t) => t.completed),
          };
        });

        updatedProject.milestones = {
          ...updatedProject.milestones,
          [phaseId]: updatedMilestones,
        };

        const allTasksDone = updatedMilestones.every(m => m.completed);
        const phaseOrder = ['idea', 'validation', 'mvp', 'early_users', 'scaling'];
        const currentIndex = phaseOrder.indexOf(phaseId);
        const nextPhase = phaseOrder[currentIndex + 1];

        if (allTasksDone && nextPhase && !updatedProject.milestones?.[nextPhase]) {
          updatedProject.stage = nextPhase as Project['stage'];
          updatedProject.milestones = {
            ...updatedProject.milestones,
            [nextPhase]: milestoneTemplates[nextPhase]
          };

          get().updateProject(projectId, {
            stage: updatedProject.stage,
            milestones: updatedProject.milestones
          });
        } else {
          get().updateProject(projectId, { milestones: updatedProject.milestones });
        }

        return updatedProject;
      });

      return { projects: updatedProjects };
    });
  }
}));