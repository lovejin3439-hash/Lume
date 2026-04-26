"use client";

import { ChevronLeft, ChevronRight, Clock3, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { getProjectColor } from "@/lib/projectColors";
import { toLocalDateId } from "@/lib/taskFilters";
import { useLumeStore } from "@/store/useLumeStore";

function startOfWeek(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

export function WeekView({ onAddTask }: { onAddTask: () => void }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const tasks = useLumeStore((state) => state.tasks);
  const selectedDate = useLumeStore((state) => state.selectedDate);
  const setSelectedDate = useLumeStore((state) => state.setSelectedDate);
  const selectTask = useLumeStore((state) => state.selectTask);
  const todayId = toLocalDateId(new Date());

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const weekTasks = tasks
    .filter((task) => {
      const taskDate = new Date(`${task.date}T00:00:00`);
      return taskDate >= weekStart && taskDate <= addDays(weekStart, 6);
    })
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const completed = weekTasks.filter((task) => task.completed).length;

  function moveWeek(delta: number) {
    setWeekStart((current) => addDays(current, delta * 7));
  }

  function addForDay(dateId: string) {
    setSelectedDate(dateId);
    onAddTask();
  }

  return (
    <div className="rounded-2xl border border-lume-border bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">Week</p>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-lume-ink">
            {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(weekStart)} -{" "}
            {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(addDays(weekStart, 6))}
          </h2>
          <p className="mt-1 text-sm text-lume-muted">
            {weekTasks.length} tasks this week, {completed} completed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-lume-border text-lume-muted transition hover:border-lume-primary/30 hover:text-lume-primary"
            type="button"
            aria-label="Previous week"
            onClick={() => moveWeek(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="h-9 rounded-full border border-lume-border px-3 text-xs font-semibold text-lume-muted transition hover:border-lume-primary/30 hover:text-lume-primary"
            type="button"
            onClick={() => setWeekStart(startOfWeek(new Date()))}
          >
            This week
          </button>
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-lume-border text-lume-muted transition hover:border-lume-primary/30 hover:text-lume-primary"
            type="button"
            aria-label="Next week"
            onClick={() => moveWeek(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[980px] grid-cols-7 gap-3">
          {days.map((date) => {
            const dateId = toLocalDateId(date);
            const dayTasks = weekTasks.filter((task) => task.date === dateId);
            const isToday = dateId === todayId;
            const isSelected = dateId === selectedDate;

            return (
              <section
                key={dateId}
                className={`min-h-[520px] rounded-2xl border p-3 ${
                  isSelected
                    ? "border-lume-primary/40 bg-[#F4F4F2]"
                    : isToday
                      ? "border-lume-primary/25 bg-[#FAFAFA]"
                      : "border-lume-border bg-[#FAFAFA]"
                }`}
              >
                <button
                  className="mb-3 flex w-full items-center justify-between rounded-xl bg-white px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5"
                  type="button"
                  onClick={() => setSelectedDate(dateId)}
                >
                  <span>
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-lume-muted">
                      {new Intl.DateTimeFormat("en", { weekday: "short" }).format(date)}
                    </span>
                    <span className="text-base font-semibold text-lume-ink">
                      {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date)}
                    </span>
                  </span>
                  <span className="rounded-full bg-[#F4F4F2] px-2 py-1 text-xs font-semibold text-lume-muted">
                    {dayTasks.length}
                  </span>
                </button>

                <div className="grid gap-2">
                  {dayTasks.map((task) => {
                    const color = getProjectColor(task.project);
                    return (
                      <button
                        key={task.id}
                        className="rounded-xl border border-lume-border bg-white p-3 text-left shadow-sm transition hover:border-lume-primary/30"
                        type="button"
                        onClick={() => selectTask(task.id)}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2 text-[11px] font-semibold text-lume-muted">
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <Clock3 className="h-3 w-3" />
                            {task.time}
                          </span>
                          <span className={`h-2 w-2 rounded-full ${color.dot}`} />
                        </div>
                        <div className={`line-clamp-2 text-sm font-semibold leading-5 ${task.completed ? "text-lume-muted line-through" : "text-lume-ink"}`}>
                          {task.title}
                        </div>
                        <div className={`mt-2 inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${color.chip}`}>
                          {task.project}
                        </div>
                      </button>
                    );
                  })}
                  <button
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-dashed border-lume-border bg-white/70 text-xs font-semibold text-lume-muted transition hover:border-lume-primary/30 hover:text-lume-primary"
                    type="button"
                    onClick={() => addForDay(dateId)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
