import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, User, Sprint, Comment, TaskStatus, TaskPriority } from '../types';
import { fallbackMockData } from '../services/boardService';

interface HistoryState {
  tasks: Task[];
  description: string;
}

interface BoardState {
  tasks: Task[];
  users: User[];
  sprints: Sprint[];
  comments: Comment[];
  selectedSprintId: number | null;
  selectedTaskId: number | null;
  filterPriority: TaskPriority | 'all';
  filterAssignee: number | 'all';
  searchQuery: string;

  // History stack for Undo action
  history: HistoryState[];

  // Actions
  initializeData: (data: { tasks: Task[]; users: User[]; sprints: Sprint[]; comments: Comment[] }) => void;
  setSelectedSprintId: (id: number | null) => void;
  setSelectedTaskId: (id: number | null) => void;
  setFilterPriority: (priority: TaskPriority | 'all') => void;
  setFilterAssignee: (assigneeId: number | 'all') => void;
  setSearchQuery: (query: string) => void;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  moveTask: (taskId: number, newStatus: TaskStatus, newIndex?: number) => void;
  deleteTask: (id: number) => void;
  addComment: (taskId: number, authorId: number, message: string) => void;
  undoLastAction: () => boolean;
  resetBoard: () => void;

  // Modals & Panels
  isNewTaskModalOpen: boolean;
  setIsNewTaskModalOpen: (open: boolean) => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      tasks: fallbackMockData.tasks,
      users: fallbackMockData.users,
      sprints: fallbackMockData.sprints,
      comments: fallbackMockData.comments,
      selectedSprintId: 3,
      selectedTaskId: null,
      filterPriority: 'all',
      filterAssignee: 'all',
      searchQuery: '',
      history: [],
      isNewTaskModalOpen: false,

      setIsNewTaskModalOpen: (open: boolean) => set({ isNewTaskModalOpen: open }),

      initializeData: ({ tasks, users, sprints, comments }) => {
        set({
          tasks: tasks && tasks.length > 0 ? tasks : fallbackMockData.tasks,
          users: users && users.length > 0 ? users : fallbackMockData.users,
          sprints: sprints && sprints.length > 0 ? sprints : fallbackMockData.sprints,
          comments: comments && comments.length > 0 ? comments : fallbackMockData.comments,
          selectedSprintId: (sprints && sprints[sprints.length - 1]?.id) || 3,
        });
      },

      setSelectedSprintId: (id) => set({ selectedSprintId: id }),
      setSelectedTaskId: (id) => set({ selectedTaskId: id }),
      setFilterPriority: (priority) => set({ filterPriority: priority }),
      setFilterAssignee: (assigneeId) => set({ filterAssignee: assigneeId }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      addTask: (newTaskData) => {
        const state = get();
        const nextId = state.tasks.length > 0 ? Math.max(...state.tasks.map((t) => t.id)) + 1 : 1;
        const now = new Date().toISOString();

        const newTask: Task = {
          ...newTaskData,
          id: nextId,
          order: state.tasks.filter((t) => t.status === newTaskData.status).length + 1,
          createdAt: now,
          updatedAt: now,
        };

        set({
          history: [...state.history, { tasks: [...state.tasks], description: `Added task "${newTask.title}"` }],
          tasks: [...state.tasks, newTask],
        });
      },

      updateTask: (id, updates) => {
        const state = get();
        const updatedTasks = state.tasks.map((task) => {
          if (task.id === id) {
            const isNowDone = updates.status === 'done' && task.status !== 'done';
            return {
              ...task,
              ...updates,
              completedAt: isNowDone ? new Date().toISOString() : updates.status && updates.status !== 'done' ? null : task.completedAt,
              updatedAt: new Date().toISOString(),
            };
          }
          return task;
        });

        set({
          history: [...state.history, { tasks: [...state.tasks], description: `Updated task #${id}` }],
          tasks: updatedTasks,
        });
      },

      moveTask: (taskId, newStatus, newIndex) => {
        const state = get();
        const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex === -1) return;

        const targetTask = state.tasks[taskIndex];
        const isNowDone = newStatus === 'done';

        const updatedTask: Task = {
          ...targetTask,
          status: newStatus,
          completedAt: isNowDone ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        };

        // Remove target task from array
        let remainingTasks = state.tasks.filter((t) => t.id !== taskId);

        if (newIndex !== undefined && newIndex >= 0) {
          const sameStatusTasks = remainingTasks.filter((t) => t.status === newStatus);
          const otherStatusTasks = remainingTasks.filter((t) => t.status !== newStatus);

          const safeIndex = Math.min(newIndex, sameStatusTasks.length);
          sameStatusTasks.splice(safeIndex, 0, updatedTask);

          remainingTasks = [...otherStatusTasks, ...sameStatusTasks];
        } else {
          remainingTasks.push(updatedTask);
        }

        set({
          history: [...state.history, { tasks: [...state.tasks], description: `Moved task "${targetTask.title}" to ${newStatus}` }],
          tasks: remainingTasks,
        });
      },

      deleteTask: (id) => {
        const state = get();
        const taskToDelete = state.tasks.find((t) => t.id === id);
        if (!taskToDelete) return;

        set({
          history: [...state.history, { tasks: [...state.tasks], description: `Deleted task "${taskToDelete.title}"` }],
          tasks: state.tasks.filter((t) => t.id !== id),
          selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
        });
      },

      addComment: (taskId, authorId, message) => {
        const state = get();
        const nextId = state.comments.length > 0 ? Math.max(...state.comments.map((c) => c.id)) + 1 : 1;
        const newComment: Comment = {
          id: nextId,
          taskId,
          authorId,
          message,
          createdAt: new Date().toISOString(),
        };

        set({
          comments: [...state.comments, newComment],
        });
      },

      undoLastAction: () => {
        const state = get();
        if (state.history.length === 0) return false;

        const previousState = state.history[state.history.length - 1];
        const newHistory = state.history.slice(0, -1);

        set({
          tasks: previousState.tasks,
          history: newHistory,
        });
        return true;
      },

      resetBoard: () =>
        set({
          tasks: [],
          sprints: [],
          users: [],
          comments: [],
          history: [],
          selectedTaskId: null,
          selectedSprintId: 3,
        }),
    }),
    {
      name: 'sprintdesk-board-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        selectedSprintId: state.selectedSprintId,
        comments: state.comments,
        sprints: state.sprints,
        users: state.users,
      }),
    }
  )
);
