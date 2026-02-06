'use client';

import { useState } from 'react';

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

interface TeamMemberPanelProps {
  members: TeamMember[];
  tasks: Task[];
  onEditMember: (member: TeamMember) => void;
  onDeleteMember: (memberId: string) => void;
}

export default function TeamMemberPanel({
  members,
  tasks,
  onEditMember,
  onDeleteMember
}: TeamMemberPanelProps) {
  const [expandedMembers, setExpandedMembers] = useState<string[]>([]);

  // Ekip üyesini genişlet/daralt
  const toggleMemberExpand = (memberId: string) => {
    setExpandedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Ekip üyesine atanmış görevleri bul
  const getMemberTasks = (memberId: string) => {
    return tasks.filter(task => task.assignedTo === memberId);
  };

  // Tamamlanan görev yüzdesini hesapla
  const getCompletionPercentage = (memberId: string) => {
    const memberTasks = getMemberTasks(memberId);
    if (memberTasks.length === 0) return 0;

    const totalProgress = memberTasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.floor(totalProgress / memberTasks.length);
  };

  return (
    <div className="space-y-2">
      {members.length === 0 ? (
        <div className="text-gray-500 text-center py-6">
          No team members yet. Add someone to the team.
        </div>
      ) : (
        members.map(member => {
          const isExpanded = expandedMembers.includes(member.id);
          const memberTasks = getMemberTasks(member.id);
          const completionPercentage = getCompletionPercentage(member.id);

          return (
            <div
              key={member.id}
              className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden"
            >
              <div
                className="p-3 flex justify-between items-center cursor-pointer"
                onClick={() => toggleMemberExpand(member.id)}
              >
                <div className="flex items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium mr-3"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h4 className="text-white font-medium">{member.name}</h4>
                    <div className="text-xs text-gray-400">
                      {member.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-gray-300 text-sm">
                    {memberTasks.length} tasks
                  </div>

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
                  {/* İletişim Bilgileri */}
                  {member.email && (
                    <div className="mb-3">
                      <div className="flex items-center text-sm text-gray-300">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{member.email}</span>
                      </div>
                    </div>
                  )}

                  {/* Görev İlerleme Durumu */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Total Progress</span>
                      <span>{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${completionPercentage}%`,
                          backgroundColor: member.color
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Atanan Görevler */}
                  {memberTasks.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm text-gray-400 mb-2">Assigned Tasks</h5>
                      <ul className="space-y-1.5">
                        {memberTasks.map(task => (
                          <li
                            key={task.id}
                            className="flex justify-between text-sm p-1.5 rounded bg-gray-800"
                          >
                            <span className="text-gray-300">{task.name}</span>
                            <span
                              className="px-1.5 py-0.5 text-xs rounded"
                              style={{
                                backgroundColor: `${member.color}30`,
                                color: member.color
                              }}
                            >
                              %{task.progress}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* İşlem butonları */}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditMember(member);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this team member? All tasks assigned to them will become unassigned.')) {
                          onDeleteMember(member.id);
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