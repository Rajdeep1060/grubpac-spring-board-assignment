export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface User {
  id: number;
  name: string;
  avatar: string;
  role: string;
  email?: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

export interface Sprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  goal?: string;
  status?: 'active' | 'completed' | 'planned';
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: number;
  dueDate?: string;
  sprintId: number;
  order: number;
  createdAt: string;
  completedAt?: string | null;
  updatedAt: string;
}

export interface Comment {
  id: number;
  taskId: number;
  authorId: number;
  message: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  postId?: number;
}
