export type Priority = "high" | "medium" | "low";
export type Status = string;

export interface Assignee {
  name: string;
  avatar: string;
}

export interface TaskData {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignees: Assignee[];
  date?: string;
  comments?: number;
  attachments?: number;
  progress?: number;
  verified?: boolean;
}

export class Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignees: Assignee[];
  date: string;
  comments: number;
  attachments: number;
  progress: number;
  verified: boolean;

  constructor(data: TaskData) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.priority = data.priority;
    this.status = data.status;
    this.assignees = data.assignees;
    this.date = data.date ?? "";
    this.comments = data.comments ?? 0;
    this.attachments = data.attachments ?? 0;
    this.progress = data.progress ?? 0;
    this.verified = data.verified ?? false;
  }

  markComplete(): void {
    this.status = "done";
    this.verified = true;
    this.progress = 100;
  }

  updateStatus(status: Status): void {
    this.status = status;
  }
}
