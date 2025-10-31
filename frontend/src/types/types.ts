export interface User {
  id: number;
  username: string;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  tasks?: Task[];
}

export interface Task {
  id: number;
  title: string;
  dueDate?: string;
  isCompleted: boolean;
  projectId: number;
}
