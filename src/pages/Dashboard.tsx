import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useNotificationStore } from '../store/notificationStore';
import { useProjectStore } from '../store/projectStore';
import NotificationsPanel from '../components/NotificationsPanel';
import NewProjectModal from '../components/NewProjectModal';
import AIChatbot from '../components/AIChatbot';
import {
  Rocket, Layout, Settings, Users, Lock, Info, HelpCircle, LogOut, Bell, BellOff,
  Search, Plus, MoreVertical, Sun, Moon, Contrast, Share2, Folder, FolderLock,
  ChevronDown, Star, StarOff, Globe, Archive, Trash2, Copy, Pencil
} from 'lucide-react';

type ProjectVisibility = 'all' | 'shared' | 'private';
type ProjectView = 'all' | 'favorites';
type ProjectStage = 'idea' | 'mvp' | 'fundraising' | 'launched';
type ProjectSort = 'lastEdited' | 'alphabetical' | 'dateCreated';

interface Project {
  id: string;
  title: string;
  description: string;
  visibility: 'public' | 'private';
  lastEdited: string;
  dateCreated: string;
  collaborators: string[];
  stage: ProjectStage;
  favorite: boolean;
  tags: string[];
}

function Dashboard() {
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();
  const { unreadCount, notificationsEnabled, toggleNotifications } = useNotificationStore();
  const { projects, loading, addProject, toggleFavorite, deleteProject, toggleVisibility, loadProjects } = useProjectStore();
  const [currentView, setCurrentView] = useState<ProjectVisibility>('all');
  const [projectView, setProjectView] = useState<ProjectView>('all');
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState<string | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [sortBy, setSortBy] = useState<ProjectSort>('lastEdited');
  const [searchTerm, setSearchTerm] = useState('');
  const [emailInput, setEmailInput] = useState<Record<string, string>>({});

  useEffect(() => {
    document.body.className = theme;
    const themeColors = {
      light: {
        bg: 'bg-gray-50',
        text: 'text-gray-900',
        sidebar: 'bg-white',
      },
      dark: {
        bg: 'bg-gray-900',
        text: 'text-white',
        sidebar: 'bg-gray-800',
      },
      contrast: {
        bg: 'bg-black',
        text: 'text-white',
        sidebar: 'bg-gray-900',
      },
    };
    
    document.documentElement.className = `${themeColors[theme].bg} ${themeColors[theme].text}`;
  }, [theme]);

  const { user } = useAuthStore();
  const fetchProjects = useProjectStore(state => state.loadProjects);

  useEffect(() => {
    if (user?.email) {
      fetchProjects();
    }
  }, [user?.email]);

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return {
          background: 'bg-gray-900',
          sidebar: 'bg-gray-800',
          text: 'text-gray-100',
          subtext: 'text-gray-400',
          card: 'bg-gray-800',
          border: 'border-gray-700',
          hover: 'hover:bg-gray-700',
          button: 'bg-gray-700 hover:bg-gray-600',
          accent: 'text-indigo-400',
          dropdown: 'bg-gray-800 border-gray-700',
        };
      case 'contrast':
        return {
          background: 'bg-black',
          sidebar: 'bg-gray-900',
          text: 'text-white',
          subtext: 'text-gray-300',
          card: 'bg-gray-900',
          border: 'border-gray-800',
          hover: 'hover:bg-gray-800',
          button: 'bg-gray-800 hover:bg-gray-700',
          accent: 'text-indigo-300',
          dropdown: 'bg-gray-900 border-gray-800',
        };
      default:
        return {
          background: 'bg-gray-50',
          sidebar: 'bg-white',
          text: 'text-gray-900',
          subtext: 'text-gray-600',
          card: 'bg-white',
          border: 'border-gray-200',
          hover: 'hover:bg-gray-50',
          button: 'bg-gray-100 hover:bg-gray-200',
          accent: 'text-indigo-600',
          dropdown: 'bg-white border-gray-200',
        };
    }
  };

  // Add loading state UI
  if (loading) {
    return (
      <div className={`min-h-screen ${getThemeClasses().background} p-8`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'contrast') => {
    setTheme(newTheme);
    setShowThemeDropdown(false);
  };

  const handleLogout = async () => {
    navigate('/');
  };

  const handleProjectAction = async (projectId: string, action: string) => {
    setShowProjectMenu(null);
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    switch (action) {
      case 'rename':
        // Implement rename logic
        break;
      case 'duplicate': {
        const newProject = {
          ...project,
          id: Math.random().toString(36).substr(2, 9),
          title: `${project.title} (Copy)`,
          dateCreated: new Date().toISOString(),
          lastEdited: new Date().toISOString(),
        };
        addProject(newProject);
        break;
      }
      case 'delete': {
        if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
          deleteProject(projectId);
        }
        break;
      }
      case 'togglePrivacy': {
        if (project.visibility === 'private') {
          const email = prompt('Enter an email to share this project with:');
          if (!email) return;

          await fetch('/api/projects.mjs', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: projectId,
              visibility: 'public',
              collaborators: [...(project.collaborators || []), email]
            })
          });
        } else {
          await fetch('/api/projects.mjs', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: projectId,
              visibility: 'private'
            })
          });
        }

        await loadProjects();
        break;
      }
    }
  };

  const handleNewProject = (projectData: any) => {
    addProject(projectData);
    setShowNewProjectModal(false);
  };

  const filteredAndSortedProjects = (projects || [])
    .filter(project => {
      const matchesView = currentView === 'all' 
        ? true 
        : currentView === 'shared' 
          ? project.collaborators.length > 0 
          : project.visibility === 'private';
      
      const matchesFavorites = projectView === 'all' || (projectView === 'favorites' && project.favorite);
      
      const matchesSearch = searchTerm === '' || 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesView && matchesFavorites && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'dateCreated':
          return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
        default:
          return new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime();
      }
    });

  // Separate projects by visibility
  const publicProjects = filteredAndSortedProjects.filter(project => project.visibility === 'public');
  const privateProjects = filteredAndSortedProjects.filter(project => project.visibility === 'private');

  const ProjectGrid = ({ projects, title }: { projects: Project[], title: string }) => (
    <div className="mb-8">
      <h2 className={`text-xl font-semibold ${getThemeClasses().text} mb-4`}>{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(projects || []).map((project) => (
          <div
            key={project.id}
            className={`${getThemeClasses().card} rounded-lg shadow-sm p-4 border ${getThemeClasses().border} group cursor-pointer`}
            onClick={() => navigate(`/project/${project.id}`)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <h3 className={`text-lg font-semibold ${getThemeClasses().text}`}>
                    {project.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(project.id);
                    }}
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    {project.favorite ? (
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Last edited: {new Date(project.lastEdited).toLocaleDateString()}
                </p>
              </div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProjectMenu(project.id);
                  }}
                  className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                
                {showProjectMenu === project.id && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${getThemeClasses().card} ring-1 ring-black ring-opacity-5 z-10`}>
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectAction(project.id, 'rename');
                        }}
                        className={`flex items-center gap-2 px-4 py-2 text-sm ${getThemeClasses().text} ${getThemeClasses().hover} w-full`}
                      >
                        <Pencil className="h-4 w-4" />
                        Rename
                      </button>
                      {project.visibility === 'private' ? (
                        <div className="px-4 py-2 space-y-2">
                          <label className="text-sm text-gray-500">Share with:</label>
                          <input
                            type="email"
                            placeholder="example@email.com"
                            value={emailInput[project.id] || ''}
                            onChange={(e) =>
                              setEmailInput((prev) => ({ ...prev, [project.id]: e.target.value }))
                            }
                            className="w-full px-3 py-1 rounded-md text-sm border border-gray-300"
                          />
                          <button
                            className="w-full px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const email = emailInput[project.id]?.trim();
                              if (!email) return alert('Enter a valid email');

                              await fetch('/api/projects.mjs', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  id: project.id,
                                  visibility: 'public',
                                  collaborators: [...(project.collaborators || []), email],
                                }),
                              });

                              setEmailInput((prev) => ({ ...prev, [project.id]: '' }));
                              loadProjects();
                              setShowProjectMenu(null);
                            }}
                          >
                            Share & Make Public
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await fetch('/api/projects.mjs', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                id: project.id,
                                visibility: 'private',
                              }),
                            });
                            await loadProjects();
                            setShowProjectMenu(null);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full`}
                        >
                          <Lock className="h-4 w-4" />
                          Make Private
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectAction(project.id, 'duplicate');
                        }}
                        className={`flex items-center gap-2 px-4 py-2 text-sm ${getThemeClasses().text} ${getThemeClasses().hover} w-full`}
                      >
                        <Copy className="h-4 w-4" />
                        Duplicate
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectAction(project.id, 'delete');
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className={`${getThemeClasses().text} mb-4`}>{project.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs ${getThemeClasses().button}`}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              {project.collaborators.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {project.collaborators.length} collaborators
                  </span>
                </div>
              )}
              <div className={`px-2 py-1 rounded-full text-xs ${
                project.visibility === 'public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {project.visibility === 'public' ? (
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Public
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Private
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex">
      {/* Sidebar - Fixed */}
      <div className={`w-64 ${getThemeClasses().sidebar} border-r ${getThemeClasses().border} flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-indigo-600" />
            <span className={`text-xl font-semibold ${getThemeClasses().text}`}>LaunchMate</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setCurrentView('all')}
            className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-colors ${
              currentView === 'all'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Layout className="h-5 w-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('shared')}
            className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-colors ${
              currentView === 'shared'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Share2 className="h-5 w-5" />
            <span>Shared Projects</span>
          </button>

          <button
            onClick={() => setCurrentView('private')}
            className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-colors ${
              currentView === 'private'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FolderLock className="h-5 w-5" />
            <span>Private Projects</span>
          </button>

          {/* Settings with Theme Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className="flex items-center gap-3 w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
              <ChevronDown className="h-4 w-4 ml-auto" />
            </button>
            
            {showThemeDropdown && (
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Sun className="h-4 w-4" />
                    Light Theme
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Moon className="h-4 w-4" />
                    Dark Theme
                  </button>
                  <button
                    onClick={() => handleThemeChange('contrast')}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Contrast className="h-4 w-4" />
                    High Contrast
                  </button>
                  <button
                    onClick={toggleNotifications}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    {notificationsEnabled ? (
                      <>
                        <Bell className="h-4 w-4" />
                        Disable Notifications
                      </>
                    ) : (
                      <>
                        <BellOff className="h-4 w-4" />
                        Enable Notifications
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/about')}
            className="flex items-center gap-3 w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <Info className="h-5 w-5" />
            <span>About</span>
          </button>

          <button
            onClick={() => navigate('/help')}
            className="flex items-center gap-3 w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <HelpCircle className="h-5 w-5" />
            <span>Help</span>
          </button>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header - Fixed */}
        <header className={`${getThemeClasses().card} border-b p-4 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className={`text-2xl font-semibold ${getThemeClasses().text}`}>
                {currentView === 'all' && 'Dashboard'}
                {currentView === 'shared' && 'Shared Projects'}
                {currentView === 'private' && 'Private Projects'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {notificationsEnabled && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative"
                  >
                    <Bell className={`h-6 w-6 ${getThemeClasses().text}`} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <NotificationsPanel onClose={() => setShowNotifications(false)} />
                  )}
                </div>
              )}
              <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                U
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg ${getThemeClasses().button} ${getThemeClasses().text} border ${getThemeClasses().border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>

              {/* View Toggle */}
              <div className="flex rounded-lg border ${getThemeClasses().border} overflow-hidden">
                <button
                  onClick={() => setProjectView('all')}
                  className={`px-4 py-2 ${
                    projectView === 'all'
                      ? 'bg-indigo-500 text-white'
                      : `${getThemeClasses().button} ${getThemeClasses().text}`
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setProjectView('favorites')}
                  className={`px-4 py-2 ${
                    projectView === 'favorites'
                      ? 'bg-indigo-500 text-white'
                      : `${getThemeClasses().button} ${getThemeClasses().text}`
                  }`}
                >
                  Favorites
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ProjectSort)}
                className={`px-4 py-2 rounded-lg ${getThemeClasses().button} ${getThemeClasses().text} border ${getThemeClasses().border}`}
              >
                <option value="lastEdited">Last Edited</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="dateCreated">Date Created</option>
              </select>
            </div>

            {/* New Project Button */}
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              New Project
            </button>
          </div>
        </header>

        {/* Project Grid - Scrollable */}
        <div className={`flex-1 overflow-y-auto ${getThemeClasses().background}`}>
          <div className="p-6">
            {filteredAndSortedProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Folder className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className={`text-xl font-medium ${getThemeClasses().text} mb-2`}>
                  No projects yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Create your first project to get started
                </p>
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 inline-flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Create New Project
                </button>
              </div>
            ) : (
              <>
                {publicProjects.length > 0 && (
                  <ProjectGrid projects={publicProjects} title="Public Projects" />
                )}
                {privateProjects.length > 0 && (
                  <ProjectGrid projects={privateProjects} title="Private Projects" />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onSubmit={handleNewProject}
        />
      )}

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
}

export default Dashboard;