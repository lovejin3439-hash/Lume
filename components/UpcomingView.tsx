"use client";

import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { TaskItem } from "@/components/TaskItem";
import { toLocalDateId } from "@/lib/taskFilters";
import { useLumeStore } from "@/store/useLumeStore";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

export function UpcomingView({ onAddTask }: { onAddTask: () => void }) {
  const [weekStart, setWeekStart] = useState(() => new Date());
  const tasks = useLumeStore((state) => state.tasks);
  const setSelectedDate = useLumeStore((state) => state.setSelectedDate);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  function jumpWeek(delta: number) {
    setWeekStart((current) => addDays(current, delta * 7));
  }

  function selectDay(date: Date) {
    setSelectedDate(toLocalDateId(date));
    onAddTask();
  }

  return (
    <div className="rounded-2xl border border-lume-border bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">Upcoming</p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-lume-ink">7-day planning</h2>
          <p className="mt-1 text-sm text-lume-muted">
            Click a day header to create a task for that date.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-lume-border text-lume-muted transition hover:text-lume-primary"
            type="button"
            onClick={() => jumpWeek(-1)}
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="h-9 rounded-full border border-lume-border px-3 text-xs font-semibold text-lume-muted transition hover:text-lume-primary"
            type="button"
            onClick={() => setWeekStart(new Date())}
          >
            This week
          </button>
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-lume-border text-lume-muted transition hover:text-lume-primary"
            type="button"
            onClick={() => jumpWeek(1)}
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[1120px] grid-cols-7 gap-3">
          {days.map((date) => {
            const dateId = toLocalDateId(date);
            const dayTasks = tasks
              .filter((task) => task.date === dateId)
              .sort((a, b) => a.time.localeCompare(b.time));
            const isToday = dateId === toLocalDateId(new Date());
            return (
              <section
                key={dateId}
                className={`min-h-[420px] rounded-2xl border p-2.5 ${
                  isToday ? "border-lume-primary/30 bg-[#F4F4F2]" : "border-lume-border bg-[#FAFAFA]"
                }`}
              >
                <button
                  className="mb-3 flex w-full items-center justify-between rounded-xl bg-white px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5"
                  type="button"
                  onClick={() => selectDay(date)}
                >
                  <span>
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-lume-muted">
                      {new Intl.DateTimeFormat("en", { weekday: "short" }).format(date)}
                    </span>
                    <span className="text-base font-semibold text-lume-ink">
                      {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date)}
                    </span>
                  </span>
                  <CalendarPlus className="h-4 w-4 text-lume-primary" />
                </button>

                <div className="grid gap-2">
                  {dayTasks.length ? (
                    dayTasks.map((task) => <TaskItem key={task.id} task={task} density="compact" />)
                  ) : (
                    <div className="rounded-xl border border-dashed border-lume-border bg-white/70 p-4 text-center text-xs font-medium text-lume-muted">
                      Open space
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
