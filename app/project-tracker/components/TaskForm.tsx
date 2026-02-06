'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
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

interface TaskFormProps {
  projectId: string;
  task?: Task;
  members: TeamMember[];
  onSave: (task: Task) => void;
  onCancel: () => void;
  projectStartDate?: Date;
  projectEndDate?: Date;
}

export default function TaskForm({
  projectId,
  task,
  members,
  onSave,
  onCancel,
  projectStartDate,
  projectEndDate
}: TaskFormProps) {
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    projectId,
    name: '',
    description: '',
    startDate: projectStartDate || new Date(),
    endDate: projectEndDate || moment().add(7, 'days').toDate(),
    assignedTo: '',
    progress: 0
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (task) {
      setFormData({
        projectId: task.projectId,
        name: task.name,
        description: task.description,
        startDate: task.startDate,
        endDate: task.endDate,
        assignedTo: task.assignedTo || '',
        progress: task.progress
      });
    } else {
      // Yeni görev oluşturulurken proje başlangıç ve bitiş tarihlerini kullan
      if (projectStartDate) {
        setFormData(prev => ({ ...prev, startDate: projectStartDate }));
      }
      if (projectEndDate) {
        setFormData(prev => ({ ...prev, endDate: projectEndDate }));
      }
    }
  }, [task, projectId, projectStartDate, projectEndDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Hata durumunda temizle
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, progress: value }));
  };

  const handleDateChange = (date: Date | null, fieldName: string) => {
    if (date) {
      setFormData(prev => ({ ...prev, [fieldName]: date }));

      // Hata durumunda temizle
      if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }

    if (moment(formData.endDate).isBefore(formData.startDate)) {
      newErrors.endDate = 'End date cannot be before start date';
    }

    // Proje tarih aralığı dışında görev oluşturulmaması için kontrol
    if (projectStartDate && moment(formData.startDate).isBefore(projectStartDate)) {
      newErrors.startDate = 'Task start date cannot be before project start date';
    }

    if (projectEndDate && moment(formData.endDate).isAfter(projectEndDate)) {
      newErrors.endDate = 'Task end date cannot be after project end date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave({
        id: task?.id || Date.now().toString(),
        ...formData
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b border-gray-800 p-4">
          <h2 className="text-lg font-medium text-white">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Görev Adı */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Açıklama */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task description"
              />
            </div>

            {/* Tarihler */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">
                  Start Date
                </label>
                <DatePicker
                  id="startDate"
                  selected={formData.startDate}
                  onChange={(date) => handleDateChange(date, 'startDate')}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Start date"
                  minDate={projectStartDate}
                  maxDate={projectEndDate}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">
                  End Date
                </label>
                <DatePicker
                  id="endDate"
                  selected={formData.endDate}
                  onChange={(date) => handleDateChange(date, 'endDate')}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="End date"
                  minDate={formData.startDate}
                  maxDate={projectEndDate}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Atanan kişi */}
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-300 mb-1">
                Assigned To
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            {/* İlerleme */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Progress: {formData.progress}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.progress}
                onChange={handleProgressChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none"
            >
              {task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 