import { Task } from "./Task";
import { Column } from "./Column";
import type { TaskData, Status } from "./Task";

export class TaskList {
  tasks: Task[];

  constructor(tasks: Task[] = []) {
    this.tasks = tasks;
  }

  add(newTask: TaskData): Task {
    const task = new Task(newTask);
    this.tasks.push(task);
    return task;
  }

  update(id: string, updates: Partial<TaskData>): Task | undefined {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return undefined;

    if (updates.title !== undefined) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.priority !== undefined) task.priority = updates.priority;
    if (updates.status !== undefined) task.status = updates.status;
    if (updates.assignees !== undefined) task.assignees = updates.assignees;
    if (updates.date !== undefined) task.date = updates.date;
    if (updates.comments !== undefined) task.comments = updates.comments;
    if (updates.attachments !== undefined) task.attachments = updates.attachments;
    if (updates.progress !== undefined) task.progress = updates.progress;
    if (updates.verified !== undefined) task.verified = updates.verified;

    return task;
  }

  delete(id: string): boolean {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.tasks.splice(index, 1);
    return true;
  }

  onDrag(element: HTMLElement): string | null {
    const taskId = element.dataset.taskId ?? null;
    if (taskId) {
      element.classList.add("opacity-50", "scale-95");
    }
    return taskId;
  }

  onDrop(
    element: HTMLElement,
    targetColumn: Column
  ): Task | undefined {
    const taskId = element.dataset.taskId;
    if (!taskId) return undefined;

    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return undefined;

    task.updateStatus(targetColumn.status);
    element.classList.remove("opacity-50", "scale-95");
    return task;
  }

  search(query: string): Task[] {
    const lowerQuery = query.toLowerCase();
    return this.tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerQuery) ||
        task.description.toLowerCase().includes(lowerQuery)
    );
  }

  getByStatus(status: Status): Task[] {
    return this.tasks.filter((t) => t.status === status);
  }
}