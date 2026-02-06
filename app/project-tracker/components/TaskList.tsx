'use client';

import { useState } from 'react';
import moment from 'moment';

interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  assignedTo?: string;
  progress: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  color: string;
}

interface TaskListProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateProgress: (taskId: string, progress: number) => void;
}

export default function TaskList({
  tasks,
  teamMembers,
  onEditTask,
  onDeleteTask,
  onUpdateProgress
}: TaskListProps) {
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);

  // Görevi genişlet/daralt
  const toggleTaskExpand = (taskId: string) => {
    setExpandedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // İlerleme durumuna göre renk belirle
  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'bg-red-500';
    if (progress < 50) return 'bg-orange-500';
    if (progress < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Ekip üyesi bilgilerini bul
  const getMember = (memberId?: string) => {
    if (!memberId) return null;
    return teamMembers.find(m => m.id === memberId);
  };

  // Bugünün tarihi
  const today = new Date();

  return (
    <div className="space-y-2">
      {tasks.length === 0 ? (
        <div className="text-gray-500 text-center py-6">
          No tasks yet. Add a new task.
        </div>
      ) : (
        tasks.map(task => {
          const isExpanded = expandedTasks.includes(task.id);
          const member = getMember(task.assignedTo);

          // Görevin durumunu belirle (gecikmiş, devam ediyor, tamamlandı)
          const startDate = new Date(task.startDate);
          const endDate = new Date(task.endDate);
          const isDelayed = endDate < today && task.progress < 100;
          const isComplete = task.progress === 100;
          const isActive = startDate <= today && endDate >= today;

          return (
            <div
              key={task.id}
              className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden"
            >
              <div
                className="p-3 flex justify-between items-start cursor-pointer"
                onClick={() => toggleTaskExpand(task.id)}
              >
                <div>
                  <div className="flex items-center">
                    <h4 className="text-white font-medium">{task.name}</h4>
                    {isDelayed && (
                      <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                        Delayed
                      </span>
                    )}
                    {isComplete && (
                      <span className="ml-2 px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                        Completed
                      </span>
                    )}
                    {isActive && !isComplete && (
                      <span className="ml-2 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                        In Progress
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-400 mt-1">
                    {moment(task.startDate).format('DD MMM')} - {moment(task.endDate).format('DD MMM YYYY')}
                  </div>

                  {/* İlerleme çubuğu */}
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${getProgressColor(task.progress)}`}
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center">
                  {member && (
                    <div
                      className="flex items-center rounded-full px-2 py-1 mr-2 text-xs"
                      style={{ backgroundColor: `${member.color}30` }}
                    >
                      <div
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: member.color }}
                      ></div>
                      <span style={{ color: member.color }}>{member.name}</span>
                    </div>
                  )}

                  <button className="text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      {isExpanded ? (
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Genişletilmiş içerik */}
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-gray-700 pt-3">
                  {task.description && (
                    <div className="mb-3">
                      <h5 className="text-sm text-gray-400 mb-1">Description</h5>
                      <p className="text-sm text-gray-300">{task.description}</p>
                    </div>
                  )}

                  {/* İlerleme ayarı */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={task.progress}
                      onChange={(e) => onUpdateProgress(task.id, parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* İşlem butonları */}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTask(task);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this task?')) {
                          onDeleteTask(task.id);
                        }
                      }}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
} 