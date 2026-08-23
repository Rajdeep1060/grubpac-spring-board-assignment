import React, { useState, useEffect } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { TaskPriority, TaskStatus } from '../../types';
import { useToast } from '../../hooks/useToast';
import { Trash2, MessageSquare, User as UserIcon, Calendar, Clock, Send } from 'lucide-react';

export const TaskDrawer: React.FC = () => {
  const {
    tasks,
    users,
    comments,
    selectedTaskId,
    setSelectedTaskId,
    updateTask,
    deleteTask,
    addComment,
  } = useBoardStore();

  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  const task = tasks.find((t) => t.id === selectedTaskId);
  const [isDeleting, setIsDeleting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('backlog');
  const [assigneeId, setAssigneeId] = useState<number>(1);
  const [dueDate, setDueDate] = useState('');
  const [commentMessage, setCommentMessage] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setAssigneeId(task.assigneeId);
      setDueDate(task.dueDate || '');
    }
  }, [task]);

  if (!task) return null;

  const taskComments = comments.filter((c) => c.taskId === task.id);

  const handleSave = () => {
    updateTask(task.id, {
      title,
      description,
      priority,
      status,
      assigneeId: Number(assigneeId),
      dueDate,
    });
    toast.success('Task details updated', 'Saved');
    setSelectedTaskId(null);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    toast.success('Task deleted permanently', 'Task Removed');
    setIsDeleting(false);
    setSelectedTaskId(null);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentMessage.trim()) return;

    const authorId = currentUser?.id || 1;
    addComment(task.id, authorId, commentMessage.trim());
    setCommentMessage('');
    toast.success('Comment posted');
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
    <>
      <Drawer
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        size="lg"
        title={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">TASK-{task.id}</span>
            <span className="font-semibold text-base text-gray-900 dark:text-white">Task Details</span>
          </div>
        }
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleting(true)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete Task
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedTaskId(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base font-semibold"
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60">
            <Select
              label="Status"
              value={status}
              options={statusOptions}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            />
            <Select
              label="Priority"
              value={priority}
              options={priorityOptions}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            />
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

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
            {task.completedAt && (
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Completed {new Date(task.completedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                Activity & Comments ({taskComments.length})
              </h4>
            </div>

            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <input
                type="text"
                value={commentMessage}
                onChange={(e) => setCommentMessage(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Button type="submit" variant="primary" size="sm" leftIcon={<Send className="w-3.5 h-3.5" />}>
                Post
              </Button>
            </form>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {taskComments.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No comments yet. Start the discussion!</p>
              ) : (
                taskComments.map((c) => {
                  const author = users.find((u) => u.id === c.authorId);
                  return (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {author?.avatar ? (
                            <img src={author.avatar} alt={author.name} className="w-4 h-4 rounded-full" />
                          ) : (
                            <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                          )}
                          <span className="font-semibold text-gray-900 dark:text-white">{author?.name || 'Team Member'}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 pl-6 leading-relaxed">{c.message}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to permanently delete task "${task.title}"? This action cannot be undone.`}
      />
    </>
  );
};
