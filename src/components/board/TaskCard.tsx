import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, User, TaskPriority } from '../../types';
import { MessageSquare, Calendar, GripVertical } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TaskCardProps {
  task: Task;
  assignee?: User;
  commentCount: number;
  onClick: () => void;
  isOverlay?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  assignee,
  commentCount,
  onClick,
  isOverlay = false,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityBadges: Record<TaskPriority, { bg: string; text: string; label: string }> = {
    high: { bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-300', label: 'High' },
    medium: { bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', label: 'Medium' },
    low: { bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', label: 'Low' },
  };

  const badge = priorityBadges[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }
    onClick();
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}, Priority: ${task.priority}, Status: ${task.status}`}
      className={cn(
        'group relative bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-brand-500',
        isDragging && 'opacity-30 border-dashed border-brand-500',
        isOverlay && 'shadow-2xl border-brand-500 rotate-1 scale-105 z-50'
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-3 right-3 text-gray-300 group-hover:text-gray-500 dark:text-gray-600 dark:group-hover:text-gray-400 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
        onClick={(e) => e.stopPropagation()}
        aria-label={`Drag handle for task ${task.title}`}
        title="Drag or press Space then Arrow keys to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 mb-2 pr-6">
        <span
          className={cn(
            'px-2 py-0.5 text-[11px] font-semibold rounded-full border',
            badge.bg,
            badge.text
          )}
        >
          {badge.label}
        </span>
        {isOverdue && (
          <span className="px-2 py-0.5 text-[11px] font-semibold bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 rounded-full">
            Overdue
          </span>
        )}
      </div>

      <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-1.5 line-clamp-2">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className={cn('flex items-center gap-1', isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : '')}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          )}

          {commentCount > 0 && (
            <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{commentCount}</span>
            </div>
          )}
        </div>

        {assignee && (
          <div className="flex items-center gap-1.5" title={assignee.name}>
            <img
              src={assignee.avatar}
              alt={assignee.name}
              className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-800 object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};
