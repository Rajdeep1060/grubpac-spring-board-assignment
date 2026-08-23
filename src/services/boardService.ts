import { Task, User, Sprint, Comment } from '../types';

export interface BoardMockData {
  tasks: Task[];
  users: User[];
  sprints: Sprint[];
  comments: Comment[];
}

export async function fetchBoardMockData(): Promise<BoardMockData> {
  const res = await fetch('/mock-data.json');
  if (!res.ok) {
    throw new Error(`Failed to fetch mock data: ${res.statusText}`);
  }
  return await res.json();
}
