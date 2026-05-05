"use client";

import { CalendarPlus, Check, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { useState } from "react";
import { getProjectColor } from "@/lib/projectColors";
import { toLocalDateId } from "@/lib/taskFilters";
import { useLumeStore, type Task, type TaskKind } from "@/store/useLumeStore";

const kindOrder: Record<TaskKind, number> = { event: 0, block: 1, habit: 2, task: 3 };

const priorityStyle: Record<string, string> = {
  p1: "bg-[#FFF0EE] text-[#E06153]",
  p2: "bg-[#F4F4F2] text-lume-primary",
  p3: "bg-[#F0F4F7] text-[#344B60]",
  p4: "bg-white text-lume-muted",
};

function formatTaskTime(task: Task) {
  return task.endTime ? `${task.time} - ${task.endTime}` : task.time;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

export function UpcomingView({ onAddTask }: { onAddTask: () => void }) {
  const [weekStart, setWeekStart] = useState(() => new Date());
  const [draggedTaskId, setDraggedTaskId] = useState<string | undefined>();
  const [dropTargetDate, setDropTargetDate] = useState<string | undefined>();
  const tasks = useLumeStore((state) => state.tasks);
  const setSelectedDate = useLumeStore((state) => state.setSelectedDate);
  const selectTask = useLumeStore((state) => state.selectTask);
  const selectedTaskId = useLumeStore((state) => state.selectedTaskId);
  const toggleComplete = useLumeStore((state) => state.toggleComplete);
  const updateTask = useLumeStore((state) => state.updateTask);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  function jumpWeek(delta: number) {
    setWeekStart((current) => addDays(current, delta * 7));
  }

  function selectDay(date: Date) {
    setSelectedDate(toLocalDateId(date));
    onAddTask();
  }

  function finishTaskDrag() {
    setDraggedTaskId(undefined);
    setDropTargetDate(undefined);
  }

  function moveDraggedTask(dateId: string) {
    if (!draggedTaskId) return;
    const task = tasks.find((item) => item.id === draggedTaskId);
    if (task && task.date !== dateId) {
      updateTask(draggedTaskId, { date: dateId });
      setSelectedDate(dateId);
    }
    finishTaskDrag();
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
        <div className="grid min-w-[1660px] grid-cols-[repeat(7,minmax(220px,1fr))] gap-3">
          {days.map((date) => {
            const dateId = toLocalDateId(date);
            const dayTasks = tasks
              .filter((task) => task.date === dateId)
              .sort((a, b) => {
                const kindDiff = kindOrder[a.kind ?? "task"] - kindOrder[b.kind ?? "task"];
                if (kindDiff !== 0) return kindDiff;
                return a.time.localeCompare(b.time);
              });
            const isToday = dateId === toLocalDateId(new Date());
            const isDropTarget = draggedTaskId && dropTargetDate === dateId;
            return (
              <section
                key={dateId}
                className={`min-h-[520px] min-w-0 overflow-hidden rounded-2xl border p-3 ${
                  isToday ? "border-lume-primary/30 bg-[#F4F4F2]" : "border-lume-border bg-[#FAFAFA]"
                } ${isDropTarget ? "border-lume-primary/60 bg-[#F8F7FF] ring-4 ring-lume-primary/10" : ""}`}
                onDragEnter={(event) => {
                  if (!draggedTaskId) return;
                  event.preventDefault();
                  setDropTargetDate(dateId);
                }}
                onDragOver={(event) => {
                  if (!draggedTaskId) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDropTargetDate(dateId);
                }}
                onDragLeave={(event) => {
                  if (!draggedTaskId) return;
                  if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                  setDropTargetDate((current) => (current === dateId ? undefined : current));
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  moveDraggedTask(dateId);
                }}
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

                <div className="grid min-w-0 gap-2">
                  {dayTasks.length ? (
                    dayTasks.map((task) => (
                      <UpcomingTaskCard
                        key={task.id}
                        task={task}
                        dragging={draggedTaskId === task.id}
                        selected={selectedTaskId === task.id}
                        onDragEnd={finishTaskDrag}
                        onDragStart={() => setDraggedTaskId(task.id)}
                        onSelect={() => selectTask(task.id)}
                        onToggle={() => toggleComplete(task.id)}
                      />
                    ))
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

function UpcomingTaskCard({
  dragging,
  task,
  selected,
  onDragEnd,
  onDragStart,
  onSelect,
  onToggle,
}: {
  dragging: boolean;
  task: Task;
  selected: boolean;
  onDragEnd: () => void;
  onDragStart: () => void;
  onSelect: () => void;
  onToggle: () => void;
}) {
  const projectColor = getProjectColor(task.project);
  const isCheckable = task.kind === "task" || task.kind === "habit";

  return (
    <button
      className={`block w-full min-w-0 max-w-full cursor-grab overflow-hidden rounded-xl border bg-white p-3 text-left shadow-sm transition hover:border-lume-primary/30 active:cursor-grabbing ${
        selected ? "border-lume-primary/60 ring-2 ring-black/5" : "border-lume-border"
      } ${dragging ? "opacity-45 ring-2 ring-lume-primary/20" : ""}`}
      type="button"
      draggable
      onDragEnd={onDragEnd}
      onDragStart={(event) => {
        event.stopPropagation();
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", task.id);
        onDragStart();
      }}
      onClick={onSelect}
    >
      <div className="flex min-w-0 items-start gap-2">
        {isCheckable ? (
          <span
            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
              task.completed
                ? "border-lume-primary bg-lume-primary text-white"
                : "border-lume-border text-transparent hover:border-lume-primary hover:text-lume-primary"
            }`}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
          >
            <Check className="h-3 w-3" />
          </span>
        ) : (
          <span className="mt-1 h-4 w-4 shrink-0 rounded-md" style={{ backgroundColor: task.color ?? "#35A8F2" }} />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start gap-2">
            <div
              className={`min-w-0 flex-1 break-words text-sm font-semibold leading-5 text-lume-ink ${
                task.completed ? "text-lume-muted line-through" : ""
              }`}
            >
              {task.title}
            </div>
            <span className={`shrink-0 rounded-full border border-lume-border px-2 py-0.5 text-[10px] font-semibold ${priorityStyle[task.priority]}`}>
              {task.priority.toUpperCase()}
            </span>
          </div>

          <div className="mt-3 grid min-w-0 gap-1.5 text-[11px] font-medium text-lume-muted">
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Clock3 className="h-3 w-3" />
              {formatTaskTime(task)}
            </span>
            <span className={`inline-flex w-fit max-w-full items-center gap-1 rounded-full border px-2 py-1 ${projectColor.chip}`}>
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${projectColor.dot}`} />
              <span className="truncate">{task.project}</span>
            </span>
            {task.labels.slice(0, 1).map((label) => (
              <span key={label} className="w-fit max-w-full truncate rounded-full border border-lume-border bg-white px-2 py-1">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
