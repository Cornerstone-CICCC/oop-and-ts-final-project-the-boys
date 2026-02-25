import { Task } from "./Task";
import type { Status } from "./Task";

export interface ColumnConfig {
  id: string;
  title: string;
  status: Status;
  accentColor?: string;
  badgeClass?: string;
  showAddButton?: boolean;
  isActiveColumn?: boolean;
}

export class Column {
  id: string;
  title: string;
  status: Status;
  tasks: Task[];
  accentColor: string;
  badgeClass: string;
  showAddButton: boolean;
  isActiveColumn: boolean;

  constructor(config: ColumnConfig, tasks: Task[] = []) {
    this.id = config.id;
    this.title = config.title;
    this.status = config.status;
    this.tasks = tasks;
    this.accentColor = config.accentColor ?? "";
    this.badgeClass = config.badgeClass ?? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400";
    this.showAddButton = config.showAddButton ?? false;
    this.isActiveColumn = config.isActiveColumn ?? false;
  }

  addTask(task: Task): void {
    task.updateStatus(this.status);
    this.tasks.push(task);
  }

  removeTask(taskId: string): Task | undefined {
    const index = this.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return undefined;
    return this.tasks.splice(index, 1)[0];
  }

  getTaskCount(): number {
    return this.tasks.length;
  }

  getTaskById(taskId: string): Task | undefined {
    return this.tasks.find((t) => t.id === taskId);
  }

  sortByDate(): void {
    this.tasks.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }
}
