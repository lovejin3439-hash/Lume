"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock3 } from "lucide-react";
import { getProjectColor } from "@/lib/projectColors";
import { useLumeStore } from "@/store/useLumeStore";
import { filterTasks, toLocalDateId } from "@/lib/taskFilters";

const hours = Array.from({ length: 15 }, (_, index) => index + 8);

function topOffset(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return 0;
  return ((hour - 8) * 72) + (minute / 60) * 72;
}

function durationHeight(start: string, end?: string) {
  if (!end) return 64;
  return Math.max(64, topOffset(end) - topOffset(start));
}

function formatTaskTime(task: { time: string; endTime?: string }) {
  return task.endTime ? `${task.time} - ${task.endTime}` : task.time;
}

function formatHour(hour: number) {
  if (hour === 12) return "12 PM";
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
}

export function TimeView() {
  const tasks = useLumeStore((state) => state.tasks);
  const selectTask = useLumeStore((state) => state.selectTask);
  const pageTitle = useLumeStore((state) => state.pageTitle);
  const selectedDate = useLumeStore((state) => state.selectedDate);
  const searchQuery = useLumeStore((state) => state.searchQuery);
  const scheduled = filterTasks(tasks, pageTitle, selectedDate, searchQuery)
    .filter((task) => task.time)
    .sort((a, b) => a.time.localeCompare(b.time));
  const now = new Date();
  const isSelectedToday = selectedDate === toLocalDateId(now);
  const currentTop = topOffset(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
  const visibleCurrentTop = currentTop >= 0 && currentTop <= 14 * 72;
  const positionedScheduled = scheduled.reduce<Array<{ task: (typeof scheduled)[number]; top: number }>>((items, task) => {
    const rawTop = Math.max(0, topOffset(task.time));
    const previous = items.at(-1);
    const top = previous ? Math.max(rawTop, previous.top + 76) : rawTop;
    items.push({ task, top });
    return items;
  }, []);
  const timelineHeight = Math.max(1080, (positionedScheduled.at(-1)?.top ?? 0) + 112);

  return (
    <div className="rounded-2xl border border-lume-border bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">Time Flow</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-lume-ink">
            {new Intl.DateTimeFormat("en", {
              weekday: "long",
              month: "short",
              day: "numeric",
            }).format(new Date(`${selectedDate}T00:00:00`))}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F4F2] px-3 py-1.5 text-xs font-semibold text-lume-primary">
            <CalendarDays className="h-3.5 w-3.5" />
            {selectedDate}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F4F2] px-3 py-1.5 text-xs font-semibold text-lume-primary">
            <Clock3 className="h-3.5 w-3.5" />
            {scheduled.length} scheduled
          </div>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-lume-border/70 bg-white" style={{ minHeight: timelineHeight }}>
        {hours.map((hour) => (
          <div key={hour} className="grid h-[72px] grid-cols-[72px_1fr] border-t border-lume-border/80 first:border-t-0">
            <div className="bg-[#FAFAFA] px-3 pt-3 text-xs font-semibold text-lume-muted">
              {formatHour(hour)}
            </div>
            <div className="bg-gradient-to-r from-[#FAFAFA] to-white" />
          </div>
        ))}

        {isSelectedToday && visibleCurrentTop ? (
          <div className="absolute left-[72px] right-2 z-10" style={{ top: currentTop }}>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-lume-primary shadow-[0_0_0_5px_rgba(0,0,0,0.10)]" />
              <span className="h-px flex-1 bg-lume-primary/40" />
              <span className="rounded-full bg-lume-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                Now
              </span>
            </div>
          </div>
        ) : null}

        {positionedScheduled.map(({ task, top }) => {
          const projectColor = getProjectColor(task.project);
          const height = durationHeight(task.time, task.endTime);
          return (
            <motion.button
              key={task.id}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.01 }}
              className="absolute left-[88px] right-4 overflow-hidden rounded-xl border border-lume-border bg-white text-left shadow-sm transition hover:border-lume-primary/30"
              style={{ top, minHeight: 64, height }}
              type="button"
              onClick={() => selectTask(task.id)}
            >
              <span className={`absolute inset-y-0 left-0 w-1.5 ${projectColor.dot}`} />
              <div className="grid gap-2 px-4 py-3 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center">
                <div className="text-sm font-semibold tabular-nums text-lume-muted">{formatTaskTime(task)}</div>
                <div className="min-w-0">
                  <div className={`truncate text-sm font-semibold ${task.completed ? "text-lume-muted line-through" : "text-lume-ink"}`}>
                    {task.title}
                  </div>
                  <div className="mt-1 text-xs font-medium text-lume-muted">
                    {task.labels.length ? task.labels.slice(0, 2).join(" · ") : "Scheduled task"}
                  </div>
                </div>
                <div className={`inline-flex w-fit rounded-full border px-2 py-1 text-xs font-medium ${projectColor.chip}`}>
                  {task.project}
                </div>
              </div>
            </motion.button>
          );
        })}

        {!scheduled.length ? (
          <div className="absolute inset-x-[88px] top-24 rounded-2xl border border-dashed border-lume-border bg-[#FAFAFA] p-8 text-center">
            <h3 className="text-base font-semibold text-lume-ink">No scheduled tasks</h3>
            <p className="mt-1 text-sm text-lume-muted">Add a task with a time to see it in your day flow.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
