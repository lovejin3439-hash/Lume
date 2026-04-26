"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CheckCircle2, Inbox, Moon, Plus, Sun, Sunrise } from "lucide-react";
import { TaskItem } from "@/components/TaskItem";
import { useLumeStore, type Task } from "@/store/useLumeStore";
import { filterTasks, groupTasksByDay } from "@/lib/taskFilters";

const sections = [
  { label: "Morning", start: 5, end: 11, icon: Sunrise },
  { label: "Afternoon", start: 12, end: 17, icon: Sun },
  { label: "Evening", start: 18, end: 23, icon: Moon },
];

function hourOf(task: Task) {
  return Number(task.time.split(":")[0] ?? 0);
}

export function TaskList() {
  const [showCompleted, setShowCompleted] = useState(true);
  const tasks = useLumeStore((state) => state.tasks);
  const pageTitle = useLumeStore((state) => state.pageTitle);
  const selectedDate = useLumeStore((state) => state.selectedDate);
  const searchQuery = useLumeStore((state) => state.searchQuery);
  const visibleTasks = filterTasks(tasks, pageTitle, selectedDate, searchQuery);
  const displayTasks = showCompleted ? visibleTasks : visibleTasks.filter((task) => !task.completed);
  const groupedByDay = groupTasksByDay(displayTasks);
  const isMultiDay = pageTitle === "Upcoming" || ["Personal", "Work", "School", "Sales", "Important", "Meeting", "Assignment", "Follow-up", "Inbox", "Focus"].includes(pageTitle);

  if (!displayTasks.length) {
    return (
      <div className="grid min-h-[440px] place-items-center rounded-2xl border border-dashed border-lume-border bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#F4F4F2] text-lume-primary">
            <Inbox className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-lume-ink">No tasks found</h2>
          <p className="mt-1 text-sm text-lume-muted">Try another view, clear search, or add a new task.</p>
        </div>
      </div>
    );
  }

  if (isMultiDay) {
    return (
      <div className="space-y-5">
        <ListToolbar
          showCompleted={showCompleted}
          setShowCompleted={setShowCompleted}
          completedCount={visibleTasks.filter((task) => task.completed).length}
        />
        <ListColumnHeader />
        {Object.entries(groupedByDay).map(([date, dateTasks]) => (
          <section key={date}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-lume-muted">
                {new Intl.DateTimeFormat("en", { weekday: "long", month: "short", day: "numeric" }).format(new Date(`${date}T00:00:00`))}
              </h2>
              <span className="rounded-full border border-lume-border bg-white px-3 py-1 text-xs font-semibold text-lume-muted">
                {dateTasks.length} tasks
              </span>
            </div>
            <div className="grid gap-3">
              <AnimatePresence initial={false}>
                {dateTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </AnimatePresence>
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ListToolbar
        showCompleted={showCompleted}
        setShowCompleted={setShowCompleted}
        completedCount={visibleTasks.filter((task) => task.completed).length}
      />
      <ListColumnHeader />
      {sections.map((section) => {
        const Icon = section.icon;
        const sectionTasks = displayTasks.filter((task) => {
          const hour = hourOf(task);
          return hour >= section.start && hour <= section.end;
        });
        return (
          <section key={section.label}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-lume-ink">
                <Icon className="h-4 w-4 text-lume-muted" />
                {section.label}
              </h2>
              <span className="rounded-full border border-lume-border bg-white px-3 py-1 text-xs font-semibold text-lume-muted">
                {sectionTasks.length} tasks
              </span>
            </div>
            <div className="grid gap-3">
              <AnimatePresence initial={false}>
                {sectionTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </AnimatePresence>
              {!sectionTasks.length ? <EmptySection /> : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ListColumnHeader() {
  return (
    <div className="hidden grid-cols-[32px_64px_minmax(0,1fr)_132px_96px_132px_34px] items-center gap-4 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-lume-muted lg:grid">
      <span />
      <span>Time</span>
      <span>Task</span>
      <span>Project</span>
      <span>Priority</span>
      <span>Labels</span>
      <span />
    </div>
  );
}

function EmptySection() {
  return (
    <div className="flex min-h-[56px] items-center justify-center gap-2 rounded-xl border border-dashed border-lume-border bg-white/60 text-sm font-medium text-lume-muted">
      <Plus className="h-4 w-4" />
      Open space
    </div>
  );
}

function ListToolbar({
  showCompleted,
  setShowCompleted,
  completedCount,
}: {
  showCompleted: boolean;
  setShowCompleted: (value: boolean) => void;
  completedCount: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-lume-border bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-lume-muted">
        <CheckCircle2 className="h-4 w-4 text-lume-primary" />
        {completedCount} completed
      </div>
      <button
        className="rounded-full border border-lume-border px-3 py-1.5 text-xs font-semibold text-lume-muted transition hover:border-lume-primary/30 hover:text-lume-primary"
        type="button"
        onClick={() => setShowCompleted(!showCompleted)}
      >
        {showCompleted ? "Hide completed" : "Show completed"}
      </button>
    </div>
  );
}
