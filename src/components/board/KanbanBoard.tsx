import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useBoardStore } from '../../store/boardStore';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '../../types';
import { createPortal } from 'react-dom';

export const KanbanBoard: React.FC = () => {
  const {
    tasks,
    users,
    comments,
    selectedSprintId,
    filterPriority,
    filterAssignee,
    searchQuery,
    setSelectedTaskId,
    moveTask,
    setIsNewTaskModalOpen,
  } = useBoardStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns: { id: TaskStatus; title: string }[] = [
    { id: 'backlog', title: 'Backlog' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' },
  ];

  const filteredTasks = tasks.filter((task) => {
    if (selectedSprintId && task.sprintId !== selectedSprintId) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterAssignee !== 'all' && task.assigneeId !== filterAssignee) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(q);
      const descMatch = task.description?.toLowerCase().includes(q);
      if (!titleMatch && !descMatch) return false;
    }
    return true;
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTaskItem = tasks.find((t) => t.id === activeId);
    if (!activeTaskItem) return;

    let targetStatus: TaskStatus | undefined;

    if (columns.some((c) => c.id === overId)) {
      targetStatus = overId as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (targetStatus && activeTaskItem.status !== targetStatus) {
      moveTask(activeId, targetStatus);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    const activeTaskItem = tasks.find((t) => t.id === activeId);
    if (!activeTaskItem) return;

    let targetStatus: TaskStatus | undefined;
    let targetIndex: number | undefined;

    if (columns.some((c) => c.id === overId)) {
      targetStatus = overId as TaskStatus;
      targetIndex = tasks.filter((t) => t.status === targetStatus).length;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
        const columnTasks = tasks.filter(
          (t) => t.sprintId === activeTaskItem.sprintId && t.status === targetStatus
        );
        targetIndex = columnTasks.findIndex((t) => t.id === overId);
      }
    }

    if (targetStatus) {
      moveTask(activeId, targetStatus, targetIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          return (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={colTasks}
              users={users}
              comments={comments}
              onTaskClick={(task) => setSelectedTaskId(task.id)}
              onAddTaskClick={() => setIsNewTaskModalOpen(true)}
            />
          );
        })}
      </div>

      {createPortal(
        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              assignee={users.find((u) => u.id === activeTask.assigneeId)}
              commentCount={comments.filter((c) => c.taskId === activeTask.id).length}
              onClick={() => {}}
              isOverlay
            />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};
