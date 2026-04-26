import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toLocalDateId } from "@/lib/taskFilters";

export type Priority = "p1" | "p2" | "p3" | "p4";
export type ActiveView = "list" | "time" | "week" | "calendar" | "board";
export type TaskSection = "To Do" | "In Progress" | "Done";
export type Recurrence = "none" | "daily" | "weekly" | "monthly";

export type Task = {
  id: string;
  title: string;
  date: string;
  time: string;
  project: string;
  priority: Priority;
  labels: string[];
  notes?: string;
  deadline?: string;
  section: TaskSection;
  recurrence?: Recurrence;
  completed: boolean;
};

export type LumeUser = {
  name: string;
  email: string;
  avatarInitial: string;
  provider: "google";
};

export type LumeToast = {
  id: string;
  title: string;
  description?: string;
  tone?: "success" | "info" | "danger";
};

type TaskInput = Omit<Task, "id" | "completed">;

type LumeState = {
  user?: LumeUser;
  toasts: LumeToast[];
  tasks: Task[];
  projects: string[];
  labels: string[];
  selectedTaskId?: string;
  selectedDate: string;
  searchQuery: string;
  activeView: ActiveView;
  pageTitle: string;
  signInWithGoogle: () => void;
  signOut: () => void;
  pushToast: (toast: Omit<LumeToast, "id">) => void;
  dismissToast: (id: string) => void;
  addProject: (project: string) => void;
  addLabel: (label: string) => void;
  resetWorkspace: () => void;
  addTask: (task: TaskInput) => void;
  duplicateTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  selectTask: (id?: string) => void;
  setSelectedDate: (date: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveView: (view: ActiveView) => void;
  setPageTitle: (title: string) => void;
};

const today = new Date();
const isoToday = toLocalDateId(today);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const initialTasks: Task[] = [
  {
    id: "task-team-meeting",
    title: "Team meeting",
    date: isoToday,
    time: "09:00",
    project: "Work",
    priority: "p1",
    labels: ["Meeting"],
    notes: "Review weekly pipeline and clarify owners for launch tasks.",
    section: "To Do",
    recurrence: "none",
    completed: false,
  },
  {
    id: "task-client-quotation",
    title: "Review client quotation",
    date: isoToday,
    time: "10:30",
    project: "Sales",
    priority: "p2",
    labels: ["Follow-up"],
    notes: "Check pricing assumptions and send one clear revision.",
    section: "In Progress",
    recurrence: "none",
    completed: false,
  },
  {
    id: "task-business-assignment",
    title: "Business class assignment",
    date: isoToday,
    time: "13:00",
    project: "School",
    priority: "p1",
    labels: ["Assignment", "Important"],
    notes: "Draft outline first, then finish the case comparison.",
    section: "To Do",
    recurrence: "none",
    completed: false,
  },
  {
    id: "task-warehouse-followup",
    title: "Follow up with warehouse team",
    date: isoToday,
    time: "15:30",
    project: "Work",
    priority: "p2",
    labels: ["Follow-up"],
    notes: "Confirm availability and delivery timing.",
    section: "In Progress",
    recurrence: "none",
    completed: false,
  },
  {
    id: "task-plan-tomorrow",
    title: "Plan tomorrow",
    date: isoToday,
    time: "19:00",
    project: "Personal",
    priority: "p4",
    labels: ["Important"],
    notes: "Keep only three meaningful priorities.",
    section: "To Do",
    recurrence: "daily",
    completed: false,
  },
  {
    id: "task-personal-reading",
    title: "Personal reading",
    date: isoToday,
    time: "21:00",
    project: "Personal",
    priority: "p4",
    labels: [],
    notes: "Read without optimizing it into work.",
    section: "To Do",
    recurrence: "none",
    completed: false,
  },
  {
    id: "task-tomorrow-focus",
    title: "Prepare focus block",
    date: toLocalDateId(tomorrow),
    time: "11:00",
    project: "Work",
    priority: "p2",
    labels: ["Important"],
    notes: "Protect a 90-minute window for deep work.",
    section: "To Do",
    recurrence: "weekly",
    completed: false,
  },
];

const initialProjects = ["Personal", "Work", "School", "Sales"];
const initialLabels = ["Important", "Meeting", "Assignment", "Follow-up"];

function normalizePriority(priority: unknown): Priority {
  if (priority === "p1" || priority === "p2" || priority === "p3" || priority === "p4") return priority;
  if (priority === "high") return "p1";
  if (priority === "medium") return "p2";
  return "p4";
}

function createTaskId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createToast(toast: Omit<LumeToast, "id">): LumeToast {
  return {
    ...toast,
    id: createTaskId(),
  };
}

function createNextRecurringTask(task: Task): Task | undefined {
  if (!task.recurrence || task.recurrence === "none") return undefined;
  const nextDate = new Date(`${task.date}T00:00:00`);
  if (Number.isNaN(nextDate.getTime())) return undefined;

  if (task.recurrence === "daily") nextDate.setDate(nextDate.getDate() + 1);
  if (task.recurrence === "weekly") nextDate.setDate(nextDate.getDate() + 7);
  if (task.recurrence === "monthly") nextDate.setMonth(nextDate.getMonth() + 1);

  return {
    ...task,
    id: createTaskId(),
    date: toLocalDateId(nextDate),
    completed: false,
    section: "To Do",
  };
}

export const useLumeStore = create<LumeState>()(
  persist(
    (set) => ({
      user: undefined,
      toasts: [],
      tasks: initialTasks,
      projects: initialProjects,
      labels: initialLabels,
      selectedTaskId: undefined,
      selectedDate: isoToday,
      searchQuery: "",
      activeView: "list",
      pageTitle: "Today",
      signInWithGoogle: () =>
        set({
          user: {
            name: "Jin",
            email: "jin@lume.app",
            avatarInitial: "J",
            provider: "google",
          },
        }),
      signOut: () => set({ user: undefined, selectedTaskId: undefined }),
      pushToast: (toast) =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            {
              ...toast,
              id: createTaskId(),
            },
          ].slice(-4),
        })),
      dismissToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        })),
      addProject: (project) =>
        set((state) => {
          const nextProject = project.trim();
          if (!nextProject || state.projects.includes(nextProject)) return state;
          return {
            projects: [...state.projects, nextProject],
          toasts: [
            ...state.toasts,
            createToast({
              title: "Project added",
              description: nextProject,
              tone: "success",
            }),
          ].slice(-4),
          };
        }),
      addLabel: (label) =>
        set((state) => {
          const nextLabel = label.trim();
          if (!nextLabel || state.labels.includes(nextLabel)) return state;
          return {
            labels: [...state.labels, nextLabel],
          toasts: [
            ...state.toasts,
            createToast({
              title: "Label added",
              description: nextLabel,
              tone: "success",
            }),
          ].slice(-4),
          };
        }),
      resetWorkspace: () =>
        set({
          tasks: initialTasks,
          projects: initialProjects,
          labels: initialLabels,
          selectedTaskId: undefined,
          selectedDate: toLocalDateId(new Date()),
          searchQuery: "",
          activeView: "list",
          pageTitle: "Today",
          toasts: [
            createToast({
              title: "Workspace reset",
              description: "Demo data has been restored.",
              tone: "info",
            }),
          ],
        }),
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: createTaskId(),
              section: task.section ?? "To Do",
              recurrence: task.recurrence ?? "none",
              completed: false,
            },
          ],
          toasts: [
            ...state.toasts,
            createToast({
              title: "Task added",
              description: task.title,
              tone: "success",
            }),
          ].slice(-4),
        })),
      duplicateTask: (id) =>
        set((state) => {
          const task = state.tasks.find((item) => item.id === id);
          if (!task) return state;
          const copy = {
            ...task,
            id: createTaskId(),
            title: `${task.title} copy`,
            completed: false,
          };
          return {
            tasks: [...state.tasks, copy],
            selectedTaskId: copy.id,
            toasts: [
              ...state.toasts,
              createToast({
                title: "Task duplicated",
                description: copy.title,
                tone: "info",
              }),
            ].slice(-4),
          };
        }),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
        })),
      deleteTask: (id) =>
        set((state) => {
          const deleted = state.tasks.find((task) => task.id === id);
          return {
            tasks: state.tasks.filter((task) => task.id !== id),
            selectedTaskId: state.selectedTaskId === id ? undefined : state.selectedTaskId,
            toasts: [
              ...state.toasts,
              createToast({
                title: "Task deleted",
                description: deleted?.title,
                tone: "danger",
              }),
            ].slice(-4),
          };
        }),
      toggleComplete: (id) =>
        set((state) => {
          const target = state.tasks.find((task) => task.id === id);
          const completed = !target?.completed;
          const nextTask = completed && target ? createNextRecurringTask(target) : undefined;
          return {
            tasks: [
              ...state.tasks.map((task) =>
                task.id === id ? { ...task, completed, section: completed ? "Done" : task.section } : task,
              ),
              ...(nextTask ? [nextTask] : []),
            ],
            toasts: target
              ? [
                  ...state.toasts,
                  createToast({
                    title: completed ? "Task completed" : "Task reopened",
                    description: target.title,
                    tone: completed ? "success" : "info",
                  }),
                ].slice(-4)
              : state.toasts,
          };
        }),
      selectTask: (id) => set({ selectedTaskId: id }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setActiveView: (view) => set({ activeView: view }),
      setPageTitle: (title) =>
        set((state) => ({
          pageTitle: title,
          activeView: title === "Calendar" ? "calendar" : state.activeView,
          selectedDate: title === "Today" ? toLocalDateId(new Date()) : state.selectedDate,
        })),
    }),
    {
      name: "lume-productivity-store",
      version: 3,
      migrate: (persisted) => {
        const state = persisted as Partial<LumeState> | undefined;
        return {
          ...state,
          tasks: (state?.tasks ?? initialTasks).map((task) => ({
            ...task,
            priority: normalizePriority(task.priority),
            section: task.section ?? (task.completed ? "Done" : "To Do"),
            recurrence: task.recurrence ?? "none",
          })),
          projects: state?.projects ?? initialProjects,
          labels: state?.labels ?? initialLabels,
          selectedDate: state?.selectedDate ?? toLocalDateId(new Date()),
          searchQuery: state?.searchQuery ?? "",
          activeView: state?.activeView ?? "list",
          pageTitle: state?.pageTitle ?? "Today",
          toasts: [],
        } satisfies Partial<LumeState>;
      },
    },
  ),
);
