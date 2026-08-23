import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, User, Comment, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { cn } from '../../utils/cn';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  users: User[];
  comments: Comment[];
  onTaskClick: (task: Task) => void;
  onAddTaskClick: () => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  users,
  comments,
  onTaskClick,
  onAddTaskClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'Column',
      columnId: id,
    },
  });

  const taskIds = tasks.map((t) => t.id);

  const headerColors: Record<TaskStatus, string> = {
    backlog: 'bg-gray-500',
    'in-progress': 'bg-blue-500',
    review: 'bg-purple-500',
    done: 'bg-emerald-500',
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col bg-gray-100/70 dark:bg-gray-900/60 rounded-2xl p-3 md:p-4 border border-gray-200/80 dark:border-gray-800 transition-colors duration-200 min-h-[500px] w-full',
        isOver && 'bg-brand-50/50 dark:bg-brand-950/30 border-brand-300 dark:border-brand-800 ring-2 ring-brand-500/20'
      )}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn('w-2.5 h-2.5 rounded-full', headerColors[id])} />
          <h3 className="font-bold text-sm text-gray-900 dark:text-white capitalize">{title}</h3>
          <span className="px-2 py-0.5 text-xs font-bold bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-700 shadow-2xs">
            {tasks.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onAddTaskClick}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-1 focus:ring-brand-500"
          aria-label={`Add new task to ${title}`}
          title="Add task"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
          {tasks.map((task) => {
            const assignee = users.find((u) => u.id === task.assigneeId);
            const taskCommentsCount = comments.filter((c) => c.taskId === task.id).length;
            return (
              <TaskCard
                key={task.id}
                task={task}
                assignee={assignee}
                commentCount={taskCommentsCount}
                onClick={() => onTaskClick(task)}
              />
            );
          })}
        </div>
      </SortableContext>
    </div>
  );
};
