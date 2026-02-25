import { Column } from "./Column";
import { TaskList } from "./TaskList";
import { Task } from "./Task";
import type { TaskData } from "./Task";

export class KanbanBoard {
  columns: Column[];
  taskList: TaskList;

  constructor() {
    this.taskList = new TaskList();
    this.columns = [];
  }

  initialize(columnsConfig: Column[], initialTasks: TaskData[]): void {
    this.columns = columnsConfig;

    for (const taskData of initialTasks) {
      const task = this.taskList.add(taskData);
      const column = this.columns.find((c) => c.status === task.status);
      column?.addTask(task);
    }
  }

  getColumn(columnId: string): Column | undefined {
    return this.columns.find((c) => c.id === columnId);
  }

  moveTask(taskId: string, fromColumnId: string, toColumnId: string): boolean {
    const fromColumn = this.getColumn(fromColumnId);
    const toColumn = this.getColumn(toColumnId);
    if (!fromColumn || !toColumn) return false;

    const task = fromColumn.removeTask(taskId);
    if (!task) return false;

    toColumn.addTask(task);
    return true;
  }

  addColumn(column: Column): void {
    this.columns.push(column);
  }

  removeColumn(columnId: string): boolean {
    const index = this.columns.findIndex((c) => c.id === columnId);
    if (index === -1) return false;
    this.columns.splice(index, 1);
    return true;
  }

  searchTasks(query: string): Task[] {
    return this.taskList.search(query);
  }
}
