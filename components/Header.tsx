"use client";

import { CalendarClock, Clock3, Columns3, KanbanSquare, ListChecks, Plus, Sparkles, type LucideIcon } from "lucide-react";
import { useLumeStore, type ActiveView } from "@/store/useLumeStore";
import { filterTasks } from "@/lib/taskFilters";

const tabs: Array<{ label: string; value: ActiveView; icon: LucideIcon }> = [
  { label: "List View", value: "list", icon: ListChecks },
  { label: "Time View", value: "time", icon: Clock3 },
  { label: "Week View", value: "week", icon: Columns3 },
  { label: "Calendar View", value: "calendar", icon: CalendarClock },
  { label: "Board View", value: "board", icon: KanbanSquare },
];

export function Header({ onAddTask }: { onAddTask: () => void }) {
  const activeView = useLumeStore((state) => state.activeView);
  const setActiveView = useLumeStore((state) => state.setActiveView);
  const pageTitle = useLumeStore((state) => state.pageTitle);
  const selectedDate = useLumeStore((state) => state.selectedDate);
  const searchQuery = useLumeStore((state) => state.searchQuery);
  const setSearchQuery = useLumeStore((state) => state.setSearchQuery);
  const user = useLumeStore((state) => state.user);
  const tasks = useLumeStore((state) => state.tasks);
  const visibleTasks = filterTasks(tasks, pageTitle, selectedDate, searchQuery);
  const completedCount = visibleTasks.filter((task) => task.completed).length;
  const openCount = visibleTasks.length - completedCount;

  return (
    <header className="relative px-4 py-5 sm:px-6 lg:px-7">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-lume-border bg-white/70 px-3 py-1.5 text-xs font-medium text-lume-muted">
            <Sparkles className="h-3.5 w-3.5 text-lume-primary" />
            {new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-lume-ink sm:text-3xl">
            Good morning, {user?.name ?? "Jin"}
          </h1>
          <p className="mt-2 text-base text-lume-muted">
            {pageTitle === "Calendar"
              ? "Here are the tasks for your selected day."
              : "Here's your day in focus."}
          </p>
          {searchQuery ? (
            <button
              className="mt-3 rounded-full border border-lume-border bg-white px-3 py-1 text-xs font-semibold text-lume-muted transition hover:text-lume-ink"
              type="button"
              onClick={() => setSearchQuery("")}
            >
              Clear search: {searchQuery}
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-lume-border bg-white px-3 py-2 shadow-sm md:flex">
            <HeaderMetric label="Open" value={openCount.toString()} />
            <span className="h-8 w-px bg-lume-border" />
            <HeaderMetric label="Done" value={completedCount.toString()} />
            <span className="h-8 w-px bg-lume-border" />
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lume-muted">{pageTitle}</div>
              <div className="text-xs font-semibold text-lume-ink">
                {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${selectedDate}T00:00:00`))}
              </div>
            </div>
          </div>
          <button
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-lume-primary px-5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:bg-black/80"
            type="button"
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      <div className="inline-flex flex-wrap rounded-xl border border-lume-border bg-white p-1 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition ${
                activeView === tab.value
                  ? "bg-lume-primary text-white shadow-sm"
                  : "text-lume-muted hover:bg-[#F4F4F2] hover:text-lume-ink"
              }`}
              type="button"
              onClick={() => setActiveView(tab.value)}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-lume-muted">
        <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">Ctrl/Cmd K command</span>
        <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">N new task</span>
        <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">1-5 views</span>
        <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">/ search</span>
      </div>
    </header>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-10 text-center">
      <div className="text-sm font-semibold text-lume-ink">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-lume-muted">{label}</div>
    </div>
  );
}
