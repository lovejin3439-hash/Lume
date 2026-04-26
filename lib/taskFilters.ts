import type { Task } from "@/store/useLumeStore";

const systemViews = new Set(["Inbox", "Today", "Upcoming", "Calendar", "Focus"]);

export function toLocalDateId(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function filterTasks(tasks: Task[], pageTitle: string, selectedDate: string, searchQuery: string) {
  const today = toLocalDateId(new Date());
  const query = searchQuery.trim().toLowerCase();

  return tasks
    .filter((task) => {
      if (pageTitle === "Today") return task.date <= today;
      if (pageTitle === "Upcoming") return task.date >= today;
      if (pageTitle === "Calendar") return task.date === selectedDate;
      if (pageTitle === "Focus") return task.priority === "p1" || task.priority === "p2" || task.labels.includes("Important");
      if (!systemViews.has(pageTitle)) return task.project === pageTitle || task.labels.includes(pageTitle);
      return true;
    })
    .filter((task) => {
      if (!query) return true;
      return [
        task.title,
        task.project,
        task.priority,
        task.deadline ?? "",
        task.notes ?? "",
        ...task.labels,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}

export function groupTasksByDay(tasks: Task[]) {
  return tasks.reduce<Record<string, Task[]>>((groups, task) => {
    groups[task.date] = groups[task.date] ? [...groups[task.date], task] : [task];
    return groups;
  }, {});
}
