'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import dynamic from 'next/dynamic';

// Type definitions for the dynamically imported components
type ProjectGanttChartProps = {
  tasks: Task[];
  teamMembers: TeamMember[];
};

type TaskListProps = {
  tasks: Task[];
  teamMembers: TeamMember[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateProgress: (taskId: string, progress: number) => void;
};

type TeamMemberPanelProps = {
  members: TeamMember[];
  tasks: Task[];
  onEditMember: (member: TeamMember) => void;
  onDeleteMember: (memberId: string) => void;
};

type ProjectFormProps = {
  project?: Project;
  onSave: (project: Project) => void;
  onCancel: () => void;
};

type TaskFormProps = {
  projectId: string;
  task?: Task;
  members: TeamMember[];
  projectStartDate?: Date;
  projectEndDate?: Date;
  onSave: (task: Task) => void;
  onCancel: () => void;
};

type TeamMemberFormProps = {
  member?: TeamMember;
  onSave: (member: TeamMember) => void;
  onCancel: () => void;
};

// Dinamik olarak komponentleri import edelim
const ProjectGanttChart = dynamic<ProjectGanttChartProps>(
  () => import('./components/ProjectGanttChart').then(mod => mod.default as any),
  { ssr: false }
);

const TeamMemberPanel = dynamic<TeamMemberPanelProps>(
  () => import('./components/TeamMemberPanel').then(mod => mod.default as any),
  { ssr: false }
);

const TaskList = dynamic<TaskListProps>(
  () => import('./components/TaskList').then(mod => mod.default as any),
  { ssr: false }
);

const ProjectForm = dynamic<ProjectFormProps>(
  () => import('./components/ProjectForm').then(mod => mod.default as any),
  { ssr: false }
);

const TaskForm = dynamic<TaskFormProps>(
  () => import('./components/TaskForm').then(mod => mod.default as any),
  { ssr: false }
);

const TeamMemberForm = dynamic<TeamMemberFormProps>(
  () => import('./components/TeamMemberForm').then(mod => mod.default as any),
  { ssr: false }
);

// Tip tanımlamaları
interface Project {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status?: 'planning' | 'active' | 'completed' | 'onHold';
  createdAt?: Date;
}

interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  assignedTo?: string;
  progress: number; // 0-100 arası
  createdAt?: Date;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  color: string;
  createdAt?: Date;
}

export default function ProjectTracker() {
  // State tanımlamaları
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'project' | 'task' | 'member'>('project');
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  // Yerel depolama işlemleri
  useEffect(() => {
    // LocalStorage'dan verileri yükleme
    const savedProjects = localStorage.getItem('projects');
    const savedTasks = localStorage.getItem('tasks');
    const savedMembers = localStorage.getItem('teamMembers');

    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        // Tarihleri string'den Date objesine dönüştür
        const projectsWithDates = parsed.map((project: any) => ({
          ...project,
          startDate: new Date(project.startDate),
          endDate: new Date(project.endDate),
          createdAt: project.createdAt ? new Date(project.createdAt) : undefined
        }));
        setProjects(projectsWithDates);

        // İlk proje varsa onu seç
        if (projectsWithDates.length > 0) {
          setCurrentProject(projectsWithDates[0]);
        }
      } catch (error) {
        console.error('Projects parsing error:', error);
      }
    }

    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        const tasksWithDates = parsed.map((task: any) => ({
          ...task,
          startDate: new Date(task.startDate),
          endDate: new Date(task.endDate),
          createdAt: task.createdAt ? new Date(task.createdAt) : undefined
        }));
        setTasks(tasksWithDates);
      } catch (error) {
        console.error('Tasks parsing error:', error);
      }
    }

    if (savedMembers) {
      try {
        const parsed = JSON.parse(savedMembers);
        setTeamMembers(parsed);
      } catch (error) {
        console.error('Team members parsing error:', error);
      }
    }
  }, []);

  // Verileri güncellediğimizde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
  }, [teamMembers]);

  // Modal açma fonksiyonları
  const openProjectModal = (project: Project | null = null) => {
    setModalType('project');
    setIsEditing(!!project);
    setEditItem(project);
    setIsModalOpen(true);
  };

  const openTaskModal = (task: Task | null = null) => {
    setModalType('task');
    setIsEditing(!!task);
    setEditItem(task);
    setIsModalOpen(true);
  };

  const openMemberModal = (member: TeamMember | null = null) => {
    setModalType('member');
    setIsEditing(!!member);
    setEditItem(member);
    setIsModalOpen(true);
  };

  // Veri ekleme/güncelleme fonksiyonları
  const addProject = (project: Project) => {
    const newProject = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setProjects([...projects, newProject]);
    if (!currentProject) setCurrentProject(newProject);
    setIsModalOpen(false);
  };

  const updateProject = (project: Project) => {
    const updatedProjects = projects.map(p =>
      p.id === project.id ? project : p
    );
    setProjects(updatedProjects);
    if (currentProject && currentProject.id === project.id) {
      setCurrentProject(project);
    }
    setIsModalOpen(false);
  };

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);

    // Projeye ait görevleri de sil
    const updatedTasks = tasks.filter(t => t.projectId !== projectId);
    setTasks(updatedTasks);

    // Eğer mevcut proje siliniyorsa başka bir projeye geç
    if (currentProject && currentProject.id === projectId) {
      setCurrentProject(updatedProjects.length > 0 ? updatedProjects[0] : null);
    }
  };

  const addTask = (task: Task) => {
    const newTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setTasks([...tasks, newTask]);
    setIsModalOpen(false);
  };

  const updateTask = (task: Task) => {
    const updatedTasks = tasks.map(t =>
      t.id === task.id ? task : t
    );
    setTasks(updatedTasks);
    setIsModalOpen(false);
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
  };

  const updateTaskProgress = (taskId: string, progress: number) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, progress } : task
    );
    setTasks(updatedTasks);
  };

  const addTeamMember = (member: TeamMember) => {
    const newMember = {
      ...member,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setTeamMembers([...teamMembers, newMember]);
    setIsModalOpen(false);
  };

  const updateTeamMember = (member: TeamMember) => {
    const updatedMembers = teamMembers.map(m =>
      m.id === member.id ? member : m
    );
    setTeamMembers(updatedMembers);
    setIsModalOpen(false);
  };

  const deleteTeamMember = (memberId: string) => {
    // Önce bu ekip üyesine atanmış görevleri unassign yap
    const updatedTasks = tasks.map(task =>
      task.assignedTo === memberId
        ? { ...task, assignedTo: undefined }
        : task
    );
    setTasks(updatedTasks);

    // Sonra ekip üyesini sil
    const updatedMembers = teamMembers.filter(m => m.id !== memberId);
    setTeamMembers(updatedMembers);
  };

  // Proje değiştirme
  const changeProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
    }
  };

  // Mevcut projeye ait görevleri filtrele
  const currentTasks = tasks.filter(
    task => currentProject && task.projectId === currentProject.id
  );

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 z-10" />
      </div>

      <div className="relative z-20 pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Project Tracking & Gantt
            </motion.h1>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-300"
            >
              Organize your projects and tasks, assign to team members, and track progress
            </motion.p>
          </div>

          {/* Ana İçerik */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700 overflow-hidden mb-8"
          >
            {/* Proje Seçimi ve Butonlar */}
            <div className="p-6 border-b border-gray-700 flex flex-wrap justify-between items-center">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <label className="text-gray-300 font-medium">Project:</label>
                <select
                  className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
                  value={currentProject?.id || ''}
                  onChange={(e) => changeProject(e.target.value)}
                  disabled={projects.length === 0}
                >
                  {projects.length === 0 ? (
                    <option>No Projects Found</option>
                  ) : (
                    projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => openProjectModal()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  + New Project
                </button>
                <button
                  onClick={() => openTaskModal()}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  disabled={!currentProject}
                >
                  + New Task
                </button>
                <button
                  onClick={() => openMemberModal()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  + Team Member
                </button>
              </div>
            </div>

            {currentProject ? (
              <div className="flex flex-col lg:flex-row">
                {/* Sol Panel: Görevler ve Ekip */}
                <div className="lg:w-1/3 border-r border-gray-700">
                  {/* Görev Listesi */}
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-4">Tasks</h3>
                    <TaskList
                      tasks={currentTasks}
                      teamMembers={teamMembers}
                      onEditTask={openTaskModal}
                      onDeleteTask={deleteTask}
                      onUpdateProgress={updateTaskProgress}
                    />
                  </div>

                  {/* Ekip Üyeleri */}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-white mb-4">Team Members</h3>
                    <TeamMemberPanel
                      members={teamMembers}
                      tasks={tasks}
                      onEditMember={openMemberModal}
                      onDeleteMember={deleteTeamMember}
                    />
                  </div>
                </div>

                {/* Sağ Panel: Gantt Diyagramı */}
                <div className="lg:w-2/3 p-4">
                  <h3 className="text-xl font-semibold text-white mb-4">Gantt Chart</h3>
                  <ProjectGanttChart
                    tasks={currentTasks}
                    teamMembers={teamMembers}
                  />
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <p>No project created yet. Click "New Project" button to get started.</p>
              </div>
            )}
          </motion.div>

          {/* Proje Detayları (current project seçiliyse) */}
          {currentProject && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700 p-6 mb-8"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentProject.name}</h2>
                  <p className="text-gray-400 mt-1">{currentProject.description}</p>
                  <div className="mt-3 text-sm text-gray-400">
                    <p>Start: {moment(currentProject.startDate).format('DD.MM.YYYY')}</p>
                    <p>End: {moment(currentProject.endDate).format('DD.MM.YYYY')}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => openProjectModal(currentProject)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this project?')) {
                        deleteProject(currentProject.id);
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Proje İlerleme Durumu */}
              <div className="mt-6">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-300">Progress</span>
                  <span className="text-sm text-gray-300">
                    {tasks.length > 0
                      ? Math.floor(tasks
                        .filter(t => t.projectId === currentProject.id)
                        .reduce((acc, t) => acc + t.progress, 0) /
                        Math.max(1, tasks.filter(t => t.projectId === currentProject.id).length)
                      )
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{
                      width: `${tasks.length > 0
                        ? Math.floor(tasks
                          .filter(t => t.projectId === currentProject.id)
                          .reduce((acc, t) => acc + t.progress, 0) /
                          Math.max(1, tasks.filter(t => t.projectId === currentProject.id).length)
                        )
                        : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Geri Git Butonu */}
          <div className="mt-8 text-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center text-blue-400 hover:text-blue-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Portfolio
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <>
          {modalType === 'project' && (
            <ProjectForm
              project={isEditing ? editItem : undefined}
              onSave={isEditing ? updateProject : addProject}
              onCancel={() => setIsModalOpen(false)}
            />
          )}

          {modalType === 'task' && currentProject && (
            <TaskForm
              projectId={currentProject.id}
              task={isEditing ? editItem : undefined}
              members={teamMembers}
              projectStartDate={currentProject.startDate}
              projectEndDate={currentProject.endDate}
              onSave={isEditing ? updateTask : addTask}
              onCancel={() => setIsModalOpen(false)}
            />
          )}

          {modalType === 'member' && (
            <TeamMemberForm
              member={isEditing ? editItem : undefined}
              onSave={isEditing ? updateTeamMember : addTeamMember}
              onCancel={() => setIsModalOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
} 