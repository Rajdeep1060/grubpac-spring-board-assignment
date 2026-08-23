import React, { useState } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TaskPriority, TaskStatus } from '../../types';
import { useToast } from '../../hooks/useToast';
import { Plus } from 'lucide-react';

export const NewTaskModal: React.FC = () => {
  const { isNewTaskModalOpen, setIsNewTaskModalOpen, users, selectedSprintId, addTask } =
    useBoardStore();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('backlog');
  const [assigneeId, setAssigneeId] = useState<number>(users[0]?.id || 1);
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Task title is required.');
      return;
    }

    addTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      assigneeId: Number(assigneeId),
      sprintId: selectedSprintId || 3,
      dueDate: dueDate || undefined,
    });

    toast.success(`Task "${title}" created successfully!`, 'Task Added');
    setIsNewTaskModalOpen(false);

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('backlog');
    setDueDate('');
  };

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const statusOptions = [
    { value: 'backlog', label: 'Backlog' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' },
  ];

  const assigneeOptions = users.map((u) => ({
    value: u.id,
    label: u.name,
  }));

  return (
    <Modal
      isOpen={isNewTaskModalOpen}
      onClose={() => setIsNewTaskModalOpen(false)}
      title="Create New Sprint Task"
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={() => setIsNewTaskModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} leftIcon={<Plus className="w-4 h-4" />}>
            Create Task
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Implement OAuth 2.0 refresh endpoint"
          autoFocus
          required
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add detailed task scope, requirements, or acceptance criteria..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Initial Status"
            value={status}
            options={statusOptions}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          />
          <Select
            label="Priority Level"
            value={priority}
            options={priorityOptions}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Assignee"
            value={assigneeId}
            options={assigneeOptions}
            onChange={(e) => setAssigneeId(Number(e.target.value))}
          />
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
