import React from 'react';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { BoardFilterBar } from '../components/board/BoardFilterBar';
import { TaskDrawer } from '../components/board/TaskDrawer';
import { NewTaskModal } from '../components/board/NewTaskModal';
import { useBoardStore } from '../store/boardStore';
import { Select } from '../components/ui/Select';
import { Layers } from 'lucide-react';

export const BoardPage: React.FC = () => {
  const { sprints, selectedSprintId, setSelectedSprintId } = useBoardStore();

  const sprintOptions = sprints.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.startDate} - ${s.endDate})`,
  }));

  const activeSprint = sprints.find((s) => s.id === selectedSprintId);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Sprint Kanban Board
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Drag and drop tasks across columns to update workflow statuses in real-time.
          </p>
        </div>

        <div className="w-64 text-xs">
          <Select
            label="Active Sprint"
            value={selectedSprintId || ''}
            options={sprintOptions}
            onChange={(e) => setSelectedSprintId(Number(e.target.value))}
          />
        </div>
      </div>

      {activeSprint?.goal && (
        <div className="p-3.5 rounded-xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/50 dark:border-brand-900/40 text-xs text-brand-900 dark:text-brand-200 flex items-center justify-between">
          <span>
            <span className="font-semibold">Sprint Goal:</span> {activeSprint.goal}
          </span>
          <span className="text-[11px] font-mono opacity-80">{activeSprint.startDate} to {activeSprint.endDate}</span>
        </div>
      )}

      <BoardFilterBar />
      <KanbanBoard />

      <TaskDrawer />
      <NewTaskModal />
    </div>
  );
};

export default BoardPage;
