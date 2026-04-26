"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLumeStore } from "@/store/useLumeStore";
import { getProjectColor } from "@/lib/projectColors";
import { filterTasks, toLocalDateId } from "@/lib/taskFilters";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView() {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const tasks = useLumeStore((state) => state.tasks);
  const selectTask = useLumeStore((state) => state.selectTask);
  const selectedDate = useLumeStore((state) => state.selectedDate);
  const setSelectedDate = useLumeStore((state) => state.setSelectedDate);
  const setPageTitle = useLumeStore((state) => state.setPageTitle);
  const setActiveView = useLumeStore((state) => state.setActiveView);
  const pageTitle = useLumeStore((state) => state.pageTitle);
  const searchQuery = useLumeStore((state) => state.searchQuery);
  const today = new Date();
  const todayId = toLocalDateId(today);
  const visibleTasks = filterTasks(
    tasks,
    pageTitle === "Calendar" ? "Inbox" : pageTitle,
    selectedDate,
    searchQuery,
  );
  const cells = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  function moveMonth(delta: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  function goToday() {
    const next = new Date();
    const dateId = toLocalDateId(next);
    setVisibleMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    setSelectedDate(dateId);
    setPageTitle("Calendar");
  }

  return (
    <div className="rounded-2xl border border-lume-border bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">Month</p>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-lume-ink">
            {new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(visibleMonth)}
          </h2>
          <p className="mt-1 text-sm text-lume-muted">
            Selected:{" "}
            {new Intl.DateTimeFormat("en", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }).format(new Date(`${selectedDate}T00:00:00`))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-[#F4F4F2] px-3 py-1 text-xs font-semibold text-lume-primary">
            {visibleTasks.length} visible tasks
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-lume-border text-lume-muted transition hover:border-lume-primary/30 hover:text-lume-primary"
            type="button"
            aria-label="Previous month"
            onClick={() => moveMonth(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="h-9 rounded-full border border-lume-border px-3 text-xs font-semibold text-lume-muted transition hover:border-lume-primary/30 hover:text-lume-primary"
            type="button"
            onClick={goToday}
          >
            Today
          </button>
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-lume-border text-lume-muted transition hover:border-lume-primary/30 hover:text-lume-primary"
            type="button"
            aria-label="Next month"
            onClick={() => moveMonth(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {weekdays.map((day) => (
          <div key={day} className="px-2 pb-2 text-right text-xs font-semibold text-lume-muted">
            {day}
          </div>
        ))}
        {cells.map((date) => {
          const dateId = toLocalDateId(date);
          const dateTasks = visibleTasks.filter((task) => task.date === dateId);
          const muted = date.getMonth() !== visibleMonth.getMonth();
          const selected = selectedDate === dateId;
          const isToday = dateId === todayId;
          return (
            <button
              key={date.toISOString()}
              className={`min-h-28 rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:border-lume-primary/30 ${
                muted ? "border-lume-border/60 bg-[#FAFAFA] text-lume-muted" : "border-lume-border bg-white text-lume-ink"
              } ${selected ? "border-lume-primary/40 ring-4 ring-black/5" : ""}`}
              type="button"
              onClick={() => {
                setSelectedDate(dateId);
                setPageTitle("Calendar");
                setActiveView("list");
                selectTask(dateTasks[0]?.id);
              }}
            >
              <div className="flex justify-end">
                <span
                  className={`grid h-7 min-w-7 place-items-center rounded-full px-2 text-sm font-semibold ${
                    isToday ? "bg-lume-primary text-white" : ""
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {dateTasks.slice(0, 4).map((task) => (
                  <span
                    key={task.id}
                    className={`h-2 w-2 rounded-full ${getProjectColor(task.project).dot}`}
                  />
                ))}
              </div>
              {dateTasks.length ? (
                <div className="mt-2 truncate text-xs font-medium text-lume-muted">{dateTasks[0].title}</div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
