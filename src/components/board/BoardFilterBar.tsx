import React from 'react';
import { useBoardStore } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';
import { Search, Undo2, Plus, Filter, UserCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { TaskPriority } from '../../types';

export const BoardFilterBar: React.FC = () => {
  const {
    filterPriority,
    filterAssignee,
    searchQuery,
    users,
    history,
    setFilterPriority,
    setFilterAssignee,
    setSearchQuery,
    setIsNewTaskModalOpen,
    undoLastAction,
  } = useBoardStore();

  const { user: currentUser } = useAuthStore();

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ];

  const assigneeOptions = [
    { value: 'all', label: 'All Assignees' },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const myAssigneeId = currentUser ? currentUser.id : null;
  const isAssignedToMeActive = myAssigneeId !== null && filterAssignee === myAssigneeId;

  const handleToggleAssignedToMe = () => {
    if (!myAssigneeId) return;
    if (isAssignedToMeActive) {
      setFilterAssignee('all');
    } else {
      setFilterAssignee(myAssigneeId);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs">
      <div className="flex flex-wrap items-center gap-3 flex-1">
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="w-36">
          <Select
            value={filterPriority}
            options={priorityOptions}
            onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
            className="text-xs py-2 rounded-xl"
          />
        </div>

        <div className="w-40">
          <Select
            value={filterAssignee}
            options={assigneeOptions}
            onChange={(e) =>
              setFilterAssignee(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="text-xs py-2 rounded-xl"
          />
        </div>

        <Button
          variant={isAssignedToMeActive ? 'primary' : 'outline'}
          size="sm"
          onClick={handleToggleAssignedToMe}
          leftIcon={<UserCheck className="w-4 h-4" />}
          title="Filter tasks assigned to me"
        >
          Assigned to Me
        </Button>

        {(filterPriority !== 'all' || filterAssignee !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setFilterPriority('all');
              setFilterAssignee('all');
              setSearchQuery('');
            }}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium"
          >
            <Filter className="w-3.5 h-3.5" />
            Clear filters
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={history.length === 0}
          onClick={undoLastAction}
          leftIcon={<Undo2 className="w-4 h-4" />}
          title="Undo last drag-and-drop or edit action"
        >
          Undo ({history.length})
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsNewTaskModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Task
        </Button>
      </div>
    </div>
  );
};
