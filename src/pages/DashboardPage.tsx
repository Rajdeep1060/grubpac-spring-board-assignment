import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoardStore } from '../store/boardStore';
import { useAuthStore } from '../store/authStore';
import { DataTable, Column } from '../components/ui/DataTable';
import { Select } from '../components/ui/Select';
import { Task } from '../types';
import {
  CheckCircle2,
  Clock,
  Kanban,
  BarChart3,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../utils/cn';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tasks, users, sprints, selectedSprintId, setSelectedSprintId } = useBoardStore();

  const activeSprint = sprints.find((s) => s.id === selectedSprintId) || sprints[sprints.length - 1];

  const sprintTasks = tasks.filter((t) => !selectedSprintId || t.sprintId === selectedSprintId);
  const completedTasks = sprintTasks.filter((t) => t.status === 'done');
  const inProgressTasks = sprintTasks.filter((t) => t.status === 'in-progress');
  const reviewTasks = sprintTasks.filter((t) => t.status === 'review');

  const completionRate = sprintTasks.length
    ? Math.round((completedTasks.length / sprintTasks.length) * 100)
    : 0;

  const sprintOptions = sprints.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.startDate} to ${s.endDate})`,
  }));

  const taskColumns: Column<Task>[] = [
    {
      header: 'Task Title',
      accessorKey: 'title',
      sortable: true,
      cell: (task) => (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{task.title}</p>
          <p className="text-xs text-gray-400 line-clamp-1">{task.description}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (task) => {
        const badges: Record<string, string> = {
          backlog: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
          'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
          review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
          done: 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300',
        };
        return (
          <span className={cn('px-2.5 py-1 text-xs font-semibold rounded-full capitalize', badges[task.status])}>
            {task.status.replace('-', ' ')}
          </span>
        );
      },
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      sortable: true,
      cell: (task) => {
        const colors: Record<string, string> = {
          high: 'text-red-600 font-bold',
          medium: 'text-amber-600 font-semibold',
          low: 'text-blue-600 font-medium',
        };
        return <span className={cn('text-xs capitalize', colors[task.priority])}>{task.priority}</span>;
      },
    },
    {
      header: 'Assignee',
      accessorKey: (task) => {
        const assignee = users.find((u) => u.id === task.assigneeId);
        return assignee?.name || 'Unassigned';
      },
      sortable: true,
      cell: (task) => {
        const assignee = users.find((u) => u.id === task.assigneeId);
        return (
          <div className="flex items-center gap-2">
            {assignee?.avatar && (
              <img src={assignee.avatar} alt={assignee.name} className="w-5 h-5 rounded-full" />
            )}
            <span className="text-xs">{assignee?.name || 'Unassigned'}</span>
          </div>
        );
      },
    },
    {
      header: 'Due Date',
      accessorKey: 'dueDate',
      sortable: true,
      cell: (task) => (
        <span className="text-xs text-gray-500">
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-700 p-6 md:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <span className="px-3 py-1 text-xs font-semibold bg-white/20 rounded-full backdrop-blur-md">
            Active Sprint: {activeSprint?.name || 'Sprint 3'}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName || user?.username || 'Engineer'}! 👋
          </h1>
          <p className="text-xs md:text-sm opacity-90 max-w-xl">
            Track your team's progress, inspect active task workloads, and analyze sprint velocity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-56 text-xs">
            <Select
              value={selectedSprintId || ''}
              options={sprintOptions}
              onChange={(e) => setSelectedSprintId(Number(e.target.value))}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold border-white/30 text-xs py-2 focus:ring-white dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Sprint Tasks</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{sprintTasks.length}</h3>
            <p className="text-xs text-gray-400 mt-1">{completionRate}% completion rate</p>
          </div>
          <div className="p-3 rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
            <Kanban className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completed Tasks</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{completedTasks.length}</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Ready for release</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">In Progress & Review</p>
            <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{inProgressTasks.length + reviewTasks.length}</h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">{inProgressTasks.length} active, {reviewTasks.length} reviewing</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sprint Velocity</p>
            <h3 className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{completedTasks.length} pts</h3>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">High productivity</p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/board')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/board');
            }
          }}
          className="group cursor-pointer bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 shadow-xs hover:shadow-md transition-all flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Kanban className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Interactive Kanban Board</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Drag and drop tasks between Backlog, In Progress, Review, and Done columns.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/analytics')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/analytics');
            }
          }}
          className="group cursor-pointer bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 shadow-xs hover:shadow-md transition-all flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Data Visualisations & Charts</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Inspect velocity trends, priority distributions, and completion metrics with Recharts.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Sprint Tasks Summary Table</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Filterable and sortable data table built using custom design system.
            </p>
          </div>
        </div>

        <DataTable
          data={sprintTasks as unknown as Record<string, unknown>[]}
          columns={taskColumns as unknown as Column<Record<string, unknown>>[]}
          pageSize={6}
          emptyMessage="No tasks found for this sprint."
        />
      </div>
    </div>
  );
};

export default DashboardPage;
