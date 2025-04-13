import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useThemeStore, getThemeClasses } from '../store/themeStore';
import pptxgen from 'pptxgenjs';
import { useAuthStore } from '../store/authStore';
import { generateElevatorPitch, generateProjectUpdates } from '../hooks/useGemini';
import {
  ArrowLeft, Users, Milestone, Bell, MessageSquare, Link, Calendar, Target, ChevronRight,
  Star,
  UserPlus,
  Share2,
  Download,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  Clock,
  X,
  Lightbulb,
  ClipboardCheck,
  Rocket,
  Users2,
  TrendingUp
} from 'lucide-react';

interface MilestoneType {
  title: string;
  description: string;
  tasks: {
    title: string;
    completed: boolean;
  }[];
  dueDate: string;
  completed: boolean;
}

interface PitchParameters {
  audience: string;
  venue: string;
  goal: string;
  duration: string;
}

const milestones: { [key: string]: MilestoneType[] } = {
  'idea': [
    {
      title: 'Idea Development',
      description: 'Flesh out your idea and conduct initial research',
      tasks: [
        { title: 'Define core problem and solution', completed: false },
        { title: 'Research market size and potential', completed: false },
        { title: 'Identify target audience', completed: false },
        { title: 'Document initial business model', completed: false }
      ],
      dueDate: '2024-04-15',
      completed: false
    }
  ],
  'validation': [
    {
      title: 'Market Validation',
      description: 'Test your idea with potential users',
      tasks: [
        { title: 'Create user interview script', completed: false },
        { title: 'Conduct 25 user interviews', completed: false },
        { title: 'Analyze feedback and insights', completed: false },
        { title: 'Refine idea based on feedback', completed: false }
      ],
      dueDate: '2024-05-01',
      completed: false
    }
  ],
  'mvp': [
    {
      title: 'Value Proposition',
      description: 'Define unique value proposition and MVP scope',
      tasks: [
        { title: 'Define core features for MVP', completed: false },
        { title: 'Create feature prioritization matrix', completed: false },
        { title: 'Set development milestones', completed: false },
        { title: 'Create MVP timeline', completed: false }
      ],
      dueDate: '2024-06-01',
      completed: false
    }
  ],
  'early_users': [
    {
      title: 'Early User Testing',
      description: 'Launch and test with initial user group',
      tasks: [
        { title: 'Launch MVP to test group', completed: false },
        { title: 'Collect feedback from 25-100 users', completed: false },
        { title: 'Track user engagement metrics', completed: false },
        { title: 'Implement critical fixes', completed: false }
      ],
      dueDate: '2024-07-01',
      completed: false
    }
  ],
  'scaling': [
    {
      title: 'Growth and Fundraising',
      description: 'Scale the product and secure funding',
      tasks: [
        { title: 'Track key growth metrics', completed: false },
        { title: 'Create investor pitch deck', completed: false },
        { title: 'Develop scaling roadmap', completed: false },
        { title: 'Begin investor outreach', completed: false }
      ],
      dueDate: '2024-08-01',
      completed: false
    }
  ]
};

const phases = [
  {
    id: 'idea',
    title: 'Idea Stage',
    description: 'Flesh out idea, create space for R&D',
    icon: Lightbulb,
    color: 'text-yellow-500'
  },
  {
    id: 'validation',
    title: 'Validation Stage',
    description: 'Test idea with individuals',
    icon: ClipboardCheck,
    color: 'text-green-500'
  },
  {
    id: 'mvp',
    title: 'MVP Stage',
    description: 'Define value proposition and development plan',
    icon: Rocket,
    color: 'text-blue-500'
  },
  {
    id: 'early_users',
    title: 'Early Users',
    description: 'Launch and gather feedback',
    icon: Users2,
    color: 'text-purple-500'
  },
  {
    id: 'scaling',
    title: 'Scaling & Fundraising',
    description: 'Grow and secure investment',
    icon: TrendingUp,
    color: 'text-indigo-500'
  }
];

const PitchParametersForm = ({
  onSubmit,
  themeClasses
}: {
  onSubmit: (params: PitchParameters) => void;
  themeClasses: any;
}) => {
  const [params, setParams] = useState<PitchParameters>({
    audience: '',
    venue: '',
    goal: '',
    duration: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(params);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={`block text-sm font-medium ${themeClasses.text} mb-1`}>
          Who are you presenting to?
        </label>
        <input
          type="text"
          value={params.audience}
          onChange={(e) => setParams({ ...params, audience: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., Angel investors, Venture capitalists, Potential customers"
          required
        />
      </div>
      <div>
        <label className={`block text-sm font-medium ${themeClasses.text} mb-1`}>
          Where are you presenting?
        </label>
        <input
          type="text"
          value={params.venue}
          onChange={(e) => setParams({ ...params, venue: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., Startup conference, Online meeting, Investor office"
          required
        />
      </div>
      <div>
        <label className={`block text-sm font-medium ${themeClasses.text} mb-1`}>
          What is the goal of your pitch?
        </label>
        <input
          type="text"
          value={params.goal}
          onChange={(e) => setParams({ ...params, goal: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., Secure seed funding, Partnership opportunity, Customer acquisition"
          required
        />
      </div>
      <div>
        <label className={`block text-sm font-medium ${themeClasses.text} mb-1`}>
          How much time do you have?
        </label>
        <select
          value={params.duration}
          onChange={(e) => setParams({ ...params, duration: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          required
        >
          <option value="">Select duration</option>
          <option value="1">1 minute (Elevator pitch)</option>
          <option value="3">3 minutes (Quick pitch)</option>
          <option value="5">5 minutes (Standard pitch)</option>
          <option value="10">10 minutes (Detailed pitch)</option>
          <option value="20">20 minutes (Full presentation)</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
      >
        Generate Pitch Deck
      </button>
    </form>
  );
};

function MilestoneSummaryModal({ 
  isOpen, 
  onClose,
  currentPhase,
  themeClasses 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  currentPhase: string;
  themeClasses: any; 
}) {
  if (!isOpen) return null;

  const currentPhaseIndex = phases.findIndex(phase => phase.id === currentPhase);
  const completedPhases = phases.slice(0, currentPhaseIndex);
  const upcomingPhases = phases.slice(currentPhaseIndex + 1);
  const CurrentPhaseIcon = phases[currentPhaseIndex].icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${themeClasses.card} rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4`}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className={`text-2xl font-semibold ${themeClasses.text}`}>Startup Journey Progress</h2>
          <button onClick={onClose} className={`${themeClasses.text} hover:opacity-70`}>
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Current Phase */}
          <div className={`${themeClasses.card} p-6 rounded-lg border-2 border-indigo-500`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-100 rounded-full">
                <CurrentPhaseIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${themeClasses.text}`}>
                  Current: {phases[currentPhaseIndex].title}
                </h3>
                <p className="text-gray-500">{phases[currentPhaseIndex].description}</p>
              </div>
            </div>
            <div className="pl-16">
              <h4 className={`font-medium ${themeClasses.text} mb-2`}>Key Objectives:</h4>
              <ul className="list-disc text-gray-500 space-y-1">
                {milestones[currentPhase]?.map(milestone => (
                  <li key={milestone.title}>{milestone.title}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Completed Phases */}
          {completedPhases.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>
                <span className="text-green-500">✓</span> Completed Phases
              </h3>
              <div className="space-y-3">
                {completedPhases.map(phase => {
                  const PhaseIcon = phase.icon;
                  return (
                    <div key={phase.id} className={`${themeClasses.card} p-4 rounded-lg border ${themeClasses.border}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <PhaseIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className={`font-medium ${themeClasses.text}`}>{phase.title}</h4>
                          <p className="text-sm text-gray-500">{phase.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming Phases */}
          {upcomingPhases.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>
                <span className="text-gray-500">○</span> Upcoming Phases
              </h3>
              <div className="space-y-3">
                {upcomingPhases.map(phase => {
                  const PhaseIcon = phase.icon;
                  return (
                    <div key={phase.id} className={`${themeClasses.card} p-4 rounded-lg border ${themeClasses.border}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <PhaseIcon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className={`font-medium ${themeClasses.text}`}>{phase.title}</h4>
                          <p className="text-sm text-gray-500">{phase.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const themeClasses = getThemeClasses(theme);
  const { projects } = useProjectStore();
  const [activeTab, setActiveTab] = useState('milestones');
  const [expandedMilestones, setExpandedMilestones] = useState<{ [projectId: string]: string | null }>({});
  const [showMilestoneSummary, setShowMilestoneSummary] = useState(false);
  const fetchProjects = useProjectStore(state => state.loadProjects);
  const { user } = useAuthStore();
  const [aiPitch, setAiPitch] = useState('');
  const [aiUpdates, setAiUpdates] = useState('');

  const project = projects.find(p => p.id === id);
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading project...</p>
      </div>
    );
  }  
  const isOwner = project.ownerEmail === user?.email;

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading project...</p>
      </div>
    );
  }

  useEffect(() => {
    const runGemini = async () => {
      if (!project) return;

      const pitch = await generateElevatorPitch(
        {
          title: project.title,
          description: project.description,
          problem: project.problem,
          targetAudience: project.targetAudience,
          tags: project.tags
        },
        {
          audience: 'investors',
          venue: 'demo day',
          goal: 'funding',
          duration: '1'
        }
      );

      const updates = await generateProjectUpdates({
        title: project.title,
        tags: project.tags
      });

      setAiPitch(pitch);
      setAiUpdates(updates);
    };

    runGemini();
  }, [project]);

  // 👇 Milestone expansion toggle per-project
  const toggleMilestone = (projectId: string, milestoneTitle: string) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [projectId]: prev[projectId] === milestoneTitle ? null : milestoneTitle
    }));
  };

  // 👇 Helper to check if current milestone is expanded
  const isMilestoneExpanded = (milestoneTitle: string) =>
    expandedMilestones[project.id] === milestoneTitle;

  const currentPhase = project.stage || 'idea';
  const currentPhaseIndex = phases.findIndex(phase => phase.id === currentPhase);
  const projectMilestones = milestones[currentPhase] || [];
  const completedMilestones = projectMilestones.filter(m => m.completed).length;
  const totalMilestones = projectMilestones.length;

  const tabs = [
    {
      id: 'milestones',
      label: 'Milestone Tracker',
      icon: Milestone,
      content: (
        <div className="space-y-6">
          {/* Phase Progress */}
          <div className={`${themeClasses.card} p-6 rounded-lg border ${themeClasses.border}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${themeClasses.text}`}>Startup Journey</h3>
              <button
                onClick={() => setShowMilestoneSummary(true)}
                className={`flex items-center gap-2 ${themeClasses.text} hover:text-indigo-600 transition-colors`}
              >
                <Target className="h-5 w-5 text-indigo-500" />
                <span>View Journey Progress</span>
              </button>
            </div>

            {/* Phase Timeline */}
            <div className="relative mb-8">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2" />
              <div className="relative flex justify-between">
                {phases.map((phase, index) => {
                  const PhaseIcon = phase.icon;
                  const isCompleted = index < currentPhaseIndex;
                  const isCurrent = index === currentPhaseIndex;
                  
                  return (
                    <div key={phase.id} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                          isCompleted
                            ? 'bg-green-100'
                            : isCurrent
                            ? 'bg-indigo-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        <PhaseIcon
                          className={`h-5 w-5 ${
                            isCompleted
                              ? 'text-green-600'
                              : isCurrent
                              ? 'text-indigo-600'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <div className={`text-sm font-medium ${
                          isCurrent ? 'text-indigo-600' : themeClasses.text
                        }`}>
                          {phase.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 max-w-[120px]">
                          {phase.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Phase Milestones */}
            <div className="space-y-4">
              <h4 className={`font-medium ${themeClasses.text}`}>Current Phase Milestones</h4>
              {projectMilestones.map((milestone, index) => (
                <div
                  key={milestone.title}
                  className={`${themeClasses.card} border ${themeClasses.border} rounded-lg overflow-hidden`}
                >
                  <button
                    onClick={() => toggleMilestone(project.id, milestone.title)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {milestone.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-400" />
                      )}
                      <div className="text-left">
                        <h4 className={`font-medium ${themeClasses.text}`}>{milestone.title}</h4>
                        <p className="text-sm text-gray-500">{milestone.description}</p>
                      </div>
                    </div>
                    {expandedMilestones[project.id] === milestone.title ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  {isMilestoneExpanded(milestone.title) && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </div>
                        
                        <div className="space-y-2">
                          {milestone.tasks.map((task, taskIndex) => (
                            <div
                              key={taskIndex}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              {task.completed ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400" />
                              )}
                              <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : themeClasses.text}`}>
                                {task.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'connections',
      label: 'Connections',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-lg text-white">
            <h3 className="text-xl font-semibold mb-2">Find Your Dream Team</h3>
            <p className="mb-4">Connect with potential collaborators, startup groups, and investors aligned with your domain.</p>
            <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-opacity-90 flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Find Collaborators
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${themeClasses.card} p-6 rounded-lg border ${themeClasses.border}`}>
              <h4 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>Recommended Connections</h4>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className={`font-medium ${themeClasses.text}`}>John Doe</p>
                        <p className="text-sm text-gray-500">Full Stack Developer</p>
                      </div>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-800">
                      <UserPlus className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${themeClasses.card} p-6 rounded-lg border ${themeClasses.border}`}>
              <h4 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>Potential Investors</h4>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Star className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className={`font-medium ${themeClasses.text}`}>Startup Capital</p>
                        <p className="text-sm text-gray-500">Early Stage VC</p>
                      </div>
                    </div>
                    <button className="text-green-600 hover:text-green-800">
                      <Link className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'updates',
      label: 'Updates',
      icon: Bell,
      content: (
        <div className="space-y-6">
          <div className={`${themeClasses.card} p-6 rounded-lg border ${themeClasses.border}`}>
            <h3 className={`text-xl font-semibold ${themeClasses.text} mb-4`}>Gemini AI: Latest Industry Updates</h3>
      
            {aiUpdates ? (
              <div className={`${themeClasses.card} p-4 rounded-lg border ${themeClasses.border}`}>
                <p className="text-gray-500 whitespace-pre-line">{aiUpdates}</p>
              </div>
            ) : (
              <div className="text-sm text-gray-400">Generating updates...</div>
            )}
          </div>
        </div>
      )      
    },
    {
      id: 'pitch',
      label: 'Elevator Pitch',
      icon: MessageSquare,
      content: (
        <div className="space-y-6 ${themeClasses.background}">
          <div className={`${themeClasses.card} p-6 rounded-lg border ${themeClasses.border}`}>
            <h3 className={`text-xl font-semibold ${themeClasses.text} mb-4`}>Pitch Generator</h3>
            
            <div className="space-y-6">
              {/* Pitch Parameters Form */}
              <div className={`${themeClasses.card} p-6 rounded-lg border ${themeClasses.border}`}>
                <h4 className="text-lg font-medium ${themeClasses.text} mb-4">
                  Customize Your Pitch
                </h4>
                <PitchParametersForm
                  onSubmit={async (params) => {
                    const { theme } = useThemeStore();
                    const themeClasses = getThemeClasses(theme);
                    const pitch = await generateElevatorPitch(project, params);
                    setAiPitch(pitch);

                    const pres = new pptxgen();
                    const slide1 = pres.addSlide();
                    slide1.addText(project.title, {
                      x: 1,
                      y: 1,
                      w: '80%',
                      fontSize: 44,
                      bold: true,
                      color: '363636'
                    });
                    slide1.addText(`Presented to ${params.audience} at ${params.venue}`, {
                      x: 1,
                      y: 2.5,
                      w: '80%',
                      fontSize: 20,
                      color: '666666'
                    });

                    // Problem Slide
                    const slide2 = pres.addSlide();
                    slide2.addText('The Problem', {
                      x: 1,
                      y: 0.5,
                      fontSize: 32,
                      bold: true,
                      color: '363636'
                    });
                    slide2.addText(project.problem, {
                      x: 1,
                      y: 1.5,
                      w: '80%',
                      fontSize: 20,
                      color: '666666'
                    });

                    // Solution Slide
                    const slide3 = pres.addSlide();
                    slide3.addText('Our Solution', {
                      x: 1,
                      y: 0.5,
                      fontSize: 32,
                      bold: true,
                      color: '363636'
                    });
                    slide3.addText(project.description, {
                      x: 1,
                      y: 1.5,
                      w: '80%',
                      fontSize: 20,
                      color: '666666'
                    });

                    // Gemini Pitch Slide
                    const slide4 = pres.addSlide();
                    slide4.addText('Elevator Pitch', {
                      x: 1,
                      y: 0.5,
                      fontSize: 32,
                      bold: true,
                      color: '363636'
                    });
                    slide4.addText(pitch, {
                      x: 1,
                      y: 1.5,
                      w: '80%',
                      h: 4,
                      fontSize: 18,
                      color: '444444',
                      wrap: true
                    });

                    // Target Audience Slide
                    const slide5 = pres.addSlide();
                    slide5.addText('Target Market', {
                      x: 1,
                      y: 0.5,
                      fontSize: 32,
                      bold: true,
                      color: '363636'
                    });
                    slide5.addText(project.targetAudience, {
                      x: 1,
                      y: 1.5,
                      w: '80%',
                      fontSize: 20,
                      color: '666666'
                    });

                    // Optional Traction Slide
                    if (project.stage !== 'idea') {
                      const slide6 = pres.addSlide();
                      slide6.addText('Traction & Milestones', {
                        x: 1,
                        y: 0.5,
                        fontSize: 32,
                        bold: true,
                        color: '363636'
                      });
                      slide6.addText('We are actively progressing through startup phases with milestones achieved.', {
                        x: 1,
                        y: 1.5,
                        w: '80%',
                        fontSize: 20,
                        color: '666666'
                      });
                    }

                    // Save presentation
                    await pres.writeFile({ fileName: `${project.title}-pitch.pptx` });
                  }}
                  themeClasses={themeClasses}
                />
                {aiPitch && (
                  <div className={`${themeClasses.card} p-4 rounded-lg border ${themeClasses.border}`}>
                    <h4 className={`font-medium ${themeClasses.text} mb-2`}>Gemini Elevator Pitch</h4>
                    <p className="text-sm ${themeClasses.subtext} whitespace-pre-line">{aiPitch}</p>
                  </div>
                )}
              </div>

              <div className={`${themeClasses.card} p-6 rounded-lg border ${themeClasses.border} bg-gradient-to-r from-indigo-50 to-purple-50`}>
                <h4 className="text-lg font-medium text-indigo-900 mb-4">Generated Pitch</h4>
                <p className="text-gray-700 leading-relaxed">
                  {project.title} is a {project.stage === 'idea' ? 'revolutionary concept' : 'innovative solution'} that {project.description}. 
                  We're addressing {project.problem} for {project.targetAudience}, 
                  creating significant value in {project.tags.join(', ')}. 
                  Our unique approach combines cutting-edge technology with deep market understanding.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`${themeClasses.card} p-4 rounded-lg border ${themeClasses.border}`}>
                  <h4 className={`font-medium ${themeClasses.text} mb-3`}>Key Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={themeClasses.subtext}>Market Size</span>
                      <span className={themeClasses.text}>$1.2B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.subtext}>Growth Rate</span>
                      <span className={themeClasses.text}>15% YoY</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.subtext}>Target Users</span>
                      <span className={themeClasses.text}>1M+</span>
                    </div>
                  </div>
                </div>

                <div className={`${themeClasses.card} p-4 rounded-lg border ${themeClasses.border}`}>
                  <h4 className={`font-medium ${themeClasses.text} mb-3`}>Share Pitch</h4>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'collaborators',
      label: 'Collaborators',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className={`${themeClasses.card} p-6 rounded-lg border ${themeClasses.border}`}>
            <h3 className={`text-xl font-semibold ${themeClasses.text} mb-4`}>Manage Collaborators</h3>
    
            {isOwner && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const formData = new FormData(form);
                  const email = formData.get('email')?.toString().trim();
                  if (!email) return;
    
                  await fetch('/api/projects.mjs', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: project.id,
                      visibility: 'public',
                      collaborators: [...(project.collaborators || []), email]
                    })
                  });
    
                  await fetchProjects();
                  form.reset();
                }}
                className="flex gap-4 items-center"
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Add collaborator email"
                  required
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Collaborator
                </button>
              </form>
            )}
    
            {project.collaborators?.length > 0 && (
              <div className="mt-6">
                <h4 className={`font-medium ${themeClasses.text} mb-2`}>Current Collaborators</h4>
                <ul className="list-disc list-inside text-sm text-gray-500">
                  {project.collaborators.map((email, idx) => (
                    <li key={idx} className="flex justify-between items-center">
                      <span>{email}</span>
                      {isOwner && (
                        <button
                          onClick={async () => {
                            const updated = project.collaborators.filter(e => e !== email);
                            await fetch('/api/projects.mjs', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                id: project.id,
                                collaborators: updated,
                                visibility: updated.length === 0 ? 'private' : project.visibility
                              })
                            });
                            await fetchProjects();
                          }}
                          className="text-red-500 text-xs hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
    
            {/* New section for non-owners to leave project */}
            {!isOwner && user?.email && project.collaborators?.includes(user?.email) && (
              <div className="mt-6">
                <button
                  onClick={async () => {
                    const updated = project.collaborators.filter(e => e !== user?.email);
                    await fetch('/api/projects.mjs', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: project.id,
                        collaborators: updated
                      })
                    });
                    await fetchProjects();
                    navigate('/dashboard');
                  }}
                  className="text-red-500 hover:underline text-sm"
                >
                  Leave Project
                </button>
              </div>
            )}
          </div>
        </div>
      )
    }    
  ];

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      {/* Header */}
      <header className={`${themeClasses.card} border-b ${themeClasses.border} p-4`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className={`${themeClasses.text} hover:opacity-80`}
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className={`text-2xl font-semibold ${themeClasses.text}`}>
                {project.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm ${themeClasses.subtext}`}>
                  Last updated {new Date(project.lastEdited).toLocaleDateString()}
                </span>
                <ChevronRight className={`h-4 w-4 ${themeClasses.subtext}`} />
                <span className={`text-sm ${themeClasses.subtext}`}>
                  {phases[currentPhaseIndex].title}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className={`${themeClasses.card} border-b ${themeClasses.border}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : `border-transparent ${themeClasses.text} hover:text-indigo-600`
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-8 px-4">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </main>

      {/* Milestone Summary Modal */}
      <MilestoneSummaryModal
        isOpen={showMilestoneSummary}
        onClose={() => setShowMilestoneSummary(false)}
        currentPhase={currentPhase}
        themeClasses={themeClasses}
      />
    </div>
  );
}