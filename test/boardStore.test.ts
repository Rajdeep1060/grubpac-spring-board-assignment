import { describe, it, expect, beforeEach } from 'vitest';
import { useBoardStore } from '../src/store/boardStore';
import { Task } from '../src/types';

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Test Task 1',
    description: 'Description 1',
    status: 'backlog',
    priority: 'high',
    assigneeId: 1,
    dueDate: '2026-08-30',
    sprintId: 3,
    order: 1,
    createdAt: '2026-08-15T09:30:00Z',
    completedAt: null,
    updatedAt: '2026-08-15T09:30:00Z',
  },
  {
    id: 2,
    title: 'Test Task 2',
    description: 'Description 2',
    status: 'in-progress',
    priority: 'medium',
    assigneeId: 2,
    dueDate: '2026-08-30',
    sprintId: 3,
    order: 1,
    createdAt: '2026-08-15T10:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-15T10:00:00Z',
  },
];

describe('Zustand Board Store', () => {
  beforeEach(() => {
    useBoardStore.getState().resetBoard();
    useBoardStore.getState().initializeData({
      tasks: mockTasks,
      users: [],
      sprints: [],
      comments: [],
    });
  });

  it('should initialize board with mock tasks', () => {
    const state = useBoardStore.getState();
    expect(state.tasks.length).toBe(2);
    expect(state.tasks[0].title).toBe('Test Task 1');
  });

  it('should add a new task correctly', () => {
    const { addTask } = useBoardStore.getState();

    addTask({
      title: 'New Feature Task',
      description: 'Feature details',
      status: 'backlog',
      priority: 'high',
      assigneeId: 3,
      sprintId: 3,
      dueDate: '2026-09-01',
    });

    const state = useBoardStore.getState();
    expect(state.tasks.length).toBe(3);
    const createdTask = state.tasks.find((t) => t.title === 'New Feature Task');
    expect(createdTask).toBeDefined();
    expect(createdTask?.status).toBe('backlog');
    expect(createdTask?.priority).toBe('high');
  });

  it('should move a task to another column and update status & timestamps', () => {
    const { moveTask } = useBoardStore.getState();

    // Move task 1 from backlog to done
    moveTask(1, 'done');

    const state = useBoardStore.getState();
    const movedTask = state.tasks.find((t) => t.id === 1);
    expect(movedTask?.status).toBe('done');
    expect(movedTask?.completedAt).not.toBeNull();
  });

  it('should delete a task by id', () => {
    const { deleteTask } = useBoardStore.getState();

    deleteTask(1);

    const state = useBoardStore.getState();
    expect(state.tasks.length).toBe(1);
    expect(state.tasks.find((t) => t.id === 1)).toBeUndefined();
  });

  it('should undo last drag/delete action', () => {
    const { moveTask, undoLastAction } = useBoardStore.getState();

    // Move task 1 to review
    moveTask(1, 'review');
    expect(useBoardStore.getState().tasks.find((t) => t.id === 1)?.status).toBe('review');

    // Undo action
    const undone = undoLastAction();
    expect(undone).toBe(true);
    expect(useBoardStore.getState().tasks.find((t) => t.id === 1)?.status).toBe('backlog');
  });
});
