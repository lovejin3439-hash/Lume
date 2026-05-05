"use client";

import { useMemo, useState } from "react";
import {
  CalendarCheck,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Image,
  Plus,
  Repeat2,
  Square,
  StretchHorizontal,
  Tag,
  X,
} from "lucide-react";
import { filterTasks, toLocalDateId } from "@/lib/taskFilters";
import { getProjectColor } from "@/lib/projectColors";
import { getDefaultKindColor, useLumeStore, type Task, type TaskKind } from "@/store/useLumeStore";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const kindOrder: Record<TaskKind, number> = { event: 0, block: 1, habit: 2, task: 3 };

const kindMeta: Record<TaskKind, { label: string; defaultColor: string; icon: typeof Square }> = {
  event: { label: "일정", defaultColor: "#FF4B12", icon: Square },
  task: { label: "할일", defaultColor: "#1687E8", icon: CheckSquare },
  block: { label: "구간", defaultColor: "#35A8F2", icon: StretchHorizontal },
  habit: { label: "습관", defaultColor: "#FFB84D", icon: Repeat2 },
};

const addMenuItems: Array<{
  label: string;
  description: string;
  kind?: TaskKind;
  icon: typeof Square;
  color: string;
  disabled?: boolean;
}> = [
  { label: "일정", description: "시간이 정해진 약속", kind: "event", icon: Square, color: "#FF4B12" },
  { label: "할일", description: "체크 가능한 작업", kind: "task", icon: CheckSquare, color: "#9C6ADE" },
  { label: "구간", description: "시간 블록/기간", kind: "block", icon: StretchHorizontal, color: "#2F8CFF" },
  { label: "습관", description: "반복 루틴", kind: "habit", icon: Circle, color: "#FFB84D" },
  { label: "스티커", description: "준비 중", icon: Tag, color: "#9BE1D8", disabled: true },
  { label: "날짜배경", description: "준비 중", icon: Image, color: "#A7D8F5", disabled: true },
];

export function CalendarView({
  onAddTask,
  onEditTask,
}: {
  onAddTask: (kind?: TaskKind) => void;
  onEditTask: (taskId: string) => void;
}) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [menuDate, setMenuDate] = useState<string | undefined>();
  const [expandedDate, setExpandedDate] = useState<string | undefined>();
  const [sidePanelDate, setSidePanelDate] = useState<string | undefined>();
  const [draggedTaskId, setDraggedTaskId] = useState<string | undefined>();
  const [dropTargetDate, setDropTargetDate] = useState<string | undefined>();
  const tasks = useLumeStore((state) => state.tasks);
  const selectedDate = useLumeStore((state) => state.selectedDate);
  const setSelectedDate = useLumeStore((state) => state.setSelectedDate);
  const setPageTitle = useLumeStore((state) => state.setPageTitle);
  const updateTask = useLumeStore((state) => state.updateTask);
  const toggleComplete = useLumeStore((state) => state.toggleComplete);
  const searchQuery = useLumeStore((state) => state.searchQuery);
  const today = new Date();
  const todayId = toLocalDateId(today);
  const visibleTasks = filterTasks(tasks, "Inbox", selectedDate, searchQuery);

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
    setMenuDate(undefined);
  }

  function selectDate(dateId: string) {
    setSelectedDate(dateId);
    setPageTitle("Calendar");
    setMenuDate((current) => (current === dateId ? undefined : dateId));
  }

  function openDayPanel(dateId: string) {
    setSelectedDate(dateId);
    setPageTitle("Calendar");
    setMenuDate(undefined);
    setSidePanelDate(dateId);
  }

  function createFromMenu(dateId: string, kind: TaskKind) {
    setSelectedDate(dateId);
    setPageTitle("Calendar");
    setMenuDate(undefined);
    onAddTask(kind);
  }

  function createFromDayPanel(dateId: string) {
    setSelectedDate(dateId);
    setSidePanelDate(undefined);
    onAddTask("task");
  }

  function startTaskDrag(taskId: string) {
    setDraggedTaskId(taskId);
    setMenuDate(undefined);
    setExpandedDate(undefined);
    setSidePanelDate(undefined);
  }

  function finishTaskDrag() {
    setDraggedTaskId(undefined);
    setDropTargetDate(undefined);
  }

  function moveDraggedTask(dateId: string) {
    if (!draggedTaskId) return;
    const task = tasks.find((item) => item.id === draggedTaskId);
    if (!task || task.date === dateId) {
      finishTaskDrag();
      return;
    }
    updateTask(draggedTaskId, { date: dateId });
    setSelectedDate(dateId);
    setPageTitle("Calendar");
    finishTaskDrag();
  }

  const selectedTasks = sortCalendarItems(visibleTasks.filter((task) => task.date === selectedDate));
  const expandedTasks = sortCalendarItems(visibleTasks.filter((task) => task.date === expandedDate));
  const sidePanelTasks = sortCalendarItems(visibleTasks.filter((task) => task.date === sidePanelDate));

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
            {new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(
              new Date(`${selectedDate}T00:00:00`),
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-[#F4F4F2] px-3 py-1 text-xs font-semibold text-lume-primary">
            {visibleTasks.length} visible items
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-lume-border text-lume-muted transition hover:text-lume-primary"
            type="button"
            aria-label="Previous month"
            onClick={() => moveMonth(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="h-9 rounded-full border border-lume-border px-3 text-xs font-semibold text-lume-muted transition hover:text-lume-primary"
            type="button"
            onClick={goToday}
          >
            Today
          </button>
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-lume-border text-lume-muted transition hover:text-lume-primary"
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
          const dateTasks = sortCalendarItems(visibleTasks.filter((task) => task.date === dateId));
          const muted = date.getMonth() !== visibleMonth.getMonth();
          const selected = selectedDate === dateId;
          const isToday = dateId === todayId;
          const isDropTarget = draggedTaskId && dropTargetDate === dateId;

          return (
            <section
              key={date.toISOString()}
              className={`relative min-h-40 rounded-xl border p-2 text-left transition hover:-translate-y-0.5 hover:border-lume-primary/30 ${
                muted ? "border-lume-border/60 bg-[#FAFAFA] text-lume-muted" : "border-lume-border bg-white text-lume-ink"
              } ${selected ? "border-lume-primary/40 ring-4 ring-black/5" : ""} ${
                isDropTarget ? "border-lume-primary/60 bg-[#F8F7FF] ring-4 ring-lume-primary/10" : ""
              } ${draggedTaskId ? "cursor-copy" : ""}`}
              onClick={() => selectDate(dateId)}
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
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-lume-muted">
                  {dateTasks.length ? `${dateTasks.length} item${dateTasks.length > 1 ? "s" : ""}` : ""}
                </span>
                <button
                  className={`grid h-7 min-w-7 place-items-center rounded-full px-2 text-sm font-semibold transition hover:bg-lume-ink hover:text-white ${
                    selected ? "bg-lume-ink text-white" : isToday ? "bg-lume-primary text-white" : "text-lume-ink"
                  }`}
                  type="button"
                  aria-label={`Open ${dateId} details`}
                  onClick={(event) => {
                    event.stopPropagation();
                    openDayPanel(dateId);
                  }}
                >
                  {date.getDate()}
                </button>
              </div>
              <div className="grid gap-1.5">
                {dateTasks.slice(0, 4).map((task) => (
                  <CalendarMiniItem
                    key={task.id}
                    task={task}
                    dragging={draggedTaskId === task.id}
                    onDragEnd={finishTaskDrag}
                    onDragStart={() => startTaskDrag(task.id)}
                    onSelect={() => onEditTask(task.id)}
                    onToggle={() => toggleComplete(task.id)}
                  />
                ))}
                {dateTasks.length > 4 ? (
                  <button
                    className="rounded-lg bg-[#F4F4F2] px-2 py-1 text-left text-[11px] font-semibold text-lume-muted transition hover:bg-lume-primary hover:text-white"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setExpandedDate(dateId);
                      setSelectedDate(dateId);
                    }}
                  >
                    +{dateTasks.length - 4} more
                  </button>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-lume-border bg-[#FAFAFA] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">Selected Day</p>
            <h3 className="text-lg font-semibold text-lume-ink">
              {new Intl.DateTimeFormat("en", { weekday: "long", month: "short", day: "numeric" }).format(new Date(`${selectedDate}T00:00:00`))}
            </h3>
          </div>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-lume-primary px-3 text-xs font-semibold text-white transition hover:bg-black/80"
            type="button"
            onClick={() => onAddTask("task")}
          >
            <Plus className="h-3.5 w-3.5" />
            Add task
          </button>
        </div>
        <div className="grid gap-2">
          {selectedTasks.map((task) => (
            <SelectedDayItem key={task.id} task={task} onEdit={() => onEditTask(task.id)} onToggle={() => toggleComplete(task.id)} />
          ))}
          {!selectedTasks.length ? (
            <div className="rounded-xl border border-dashed border-lume-border bg-white p-4 text-center text-sm font-medium text-lume-muted">
              No items yet. Click a date to add one.
            </div>
          ) : null}
        </div>
      </div>

      {menuDate ? (
        <div className="fixed inset-0 z-40 bg-black/10 p-4 backdrop-blur-[1px]" onClick={() => setMenuDate(undefined)}>
          <DateActionMenu
            dateLabel={new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${menuDate}T00:00:00`))}
            onCreate={(kind) => createFromMenu(menuDate, kind)}
          />
        </div>
      ) : null}

      {expandedDate ? (
        <DayItemsPopup
          date={expandedDate}
          tasks={expandedTasks}
          onClose={() => setExpandedDate(undefined)}
          onEdit={(taskId) => {
            setExpandedDate(undefined);
            onEditTask(taskId);
          }}
          onToggle={toggleComplete}
        />
      ) : null}

      {sidePanelDate ? (
        <DaySidePanel
          date={sidePanelDate}
          tasks={sidePanelTasks}
          isToday={sidePanelDate === todayId}
          onClose={() => setSidePanelDate(undefined)}
          onCreate={() => createFromDayPanel(sidePanelDate)}
          onEdit={(taskId) => {
            setSidePanelDate(undefined);
            onEditTask(taskId);
          }}
          onToggle={toggleComplete}
        />
      ) : null}
    </div>
  );
}

function sortCalendarItems(items: Task[]) {
  return [...items].sort((a, b) => {
    const kindDiff = kindOrder[a.kind ?? "task"] - kindOrder[b.kind ?? "task"];
    if (kindDiff !== 0) return kindDiff;
    return a.time.localeCompare(b.time);
  });
}

function getTaskColor(task: Task) {
  return task.color ?? kindMeta[task.kind ?? "task"].defaultColor ?? getDefaultKindColor(task.kind ?? "task");
}

function formatTaskTime(task: Task) {
  return task.endTime ? `${task.time} - ${task.endTime}` : task.time;
}

function CalendarMiniItem({
  dragging,
  task,
  onDragEnd,
  onDragStart,
  onSelect,
  onToggle,
}: {
  dragging: boolean;
  task: Task;
  onDragEnd: () => void;
  onDragStart: () => void;
  onSelect: () => void;
  onToggle: () => void;
}) {
  const kind = task.kind ?? "task";
  const color = getTaskColor(task);
  const isCheckable = kind === "task" || kind === "habit";

  if (!isCheckable) {
    return (
      <button
        className={`flex min-w-0 cursor-grab items-center rounded-md px-2 py-1 text-left text-[11px] font-semibold text-white shadow-sm transition hover:brightness-95 active:cursor-grabbing ${
          dragging ? "opacity-45 ring-2 ring-lume-primary/20" : ""
        }`}
        style={{ backgroundColor: color }}
        type="button"
        draggable
        onDragEnd={onDragEnd}
        onDragStart={(event) => {
          event.stopPropagation();
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", task.id);
          onDragStart();
        }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
      >
        <span className="min-w-0 truncate">{task.title}</span>
      </button>
    );
  }

  return (
    <button
      className={`group flex min-w-0 cursor-grab items-center gap-1.5 rounded-md bg-transparent px-1 py-0.5 text-left text-[11px] transition hover:bg-[#F4F8FF] active:cursor-grabbing ${
        dragging ? "opacity-45 ring-2 ring-lume-primary/20" : ""
      }`}
      type="button"
      draggable
      onDragEnd={onDragEnd}
      onDragStart={(event) => {
        event.stopPropagation();
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", task.id);
        onDragStart();
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <span
        className="grid h-4 w-4 shrink-0 place-items-center rounded border bg-white transition"
        style={{
          borderColor: task.completed ? color : `${color}88`,
          backgroundColor: task.completed ? `${color}18` : "white",
          color: task.completed ? color : "transparent",
        }}
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
      >
        <Check className="h-2.5 w-2.5" />
      </span>
      <span className={`min-w-0 truncate font-medium ${task.completed ? "line-through opacity-60" : ""}`} style={{ color }}>
        {task.title}
      </span>
    </button>
  );
}

function SelectedDayItem({ task, onEdit, onToggle }: { task: Task; onEdit: () => void; onToggle: () => void }) {
  const color = getTaskColor(task);
  const meta = kindMeta[task.kind ?? "task"];
  const projectColor = getProjectColor(task.project);
  const isCheckable = task.kind === "task" || task.kind === "habit";

  return (
    <button
      className="grid grid-cols-[24px_64px_minmax(0,1fr)] items-center gap-3 rounded-xl border border-lume-border bg-white px-3 py-2 text-left shadow-sm transition hover:border-lume-primary/30 xl:grid-cols-[24px_72px_minmax(0,1fr)_72px_110px]"
      type="button"
      onClick={onEdit}
    >
      {isCheckable ? (
        <span
          className="grid h-5 w-5 place-items-center rounded border bg-white"
          style={{
            borderColor: task.completed ? color : `${color}88`,
            backgroundColor: task.completed ? `${color}18` : "white",
            color: task.completed ? color : "transparent",
          }}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
        >
          <Check className="h-3 w-3" />
        </span>
      ) : (
        <span className="h-5 w-5 rounded-md" style={{ backgroundColor: color }} />
      )}
      <span className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums text-lume-muted">
        <Clock3 className="h-3 w-3" />
        {formatTaskTime(task)}
      </span>
      <span className={`truncate text-sm font-semibold ${task.completed ? "text-lume-muted line-through" : "text-lume-ink"}`}>
        {task.title}
      </span>
      <span
        className="hidden min-w-0 items-center justify-center rounded-full border px-2 py-1 text-xs font-semibold xl:inline-flex"
        style={{ borderColor: `${color}44`, backgroundColor: `${color}12`, color }}
      >
        {meta.label}
      </span>
      <span className={`hidden min-w-0 items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium xl:inline-flex ${projectColor.chip}`}>
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${projectColor.dot}`} />
        <span className="truncate">{task.project}</span>
      </span>
    </button>
  );
}

function DateActionMenu({ dateLabel, onCreate }: { dateLabel: string; onCreate: (kind: TaskKind) => void }) {
  return (
    <div
      className="absolute left-1/2 top-1/2 w-[min(336px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-lume-border bg-white p-4 shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">{dateLabel}</div>
      <div className="grid gap-1">
        {addMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`flex items-center gap-4 rounded-2xl px-4 py-3 text-left transition ${
                item.disabled ? "cursor-not-allowed text-lume-muted/45" : "text-lume-ink hover:bg-[#F4F4F2]"
              }`}
              type="button"
              disabled={item.disabled}
              onClick={() => item.kind && onCreate(item.kind)}
            >
              <Icon className="h-5 w-5" style={{ color: item.color }} />
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold">{item.label}</span>
                <span className="block text-sm font-medium text-lume-muted">{item.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DayItemsPopup({
  date,
  tasks,
  onClose,
  onEdit,
  onToggle,
}: {
  date: string;
  tasks: Task[];
  onClose: () => void;
  onEdit: (taskId: string) => void;
  onToggle: (taskId: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-lume-ink/25 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl border border-lume-border bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">Full Day</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-lume-ink">
              {new Intl.DateTimeFormat("en", { month: "long", day: "numeric" }).format(new Date(`${date}T00:00:00`))}
            </h3>
          </div>
          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-lume-border text-lume-muted hover:text-lume-ink"
            type="button"
            aria-label="Close full day popup"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid max-h-[60vh] gap-2 overflow-y-auto pr-1">
          {tasks.map((task) => {
            const color = getTaskColor(task);
            const meta = kindMeta[task.kind ?? "task"];
            const isCheckable = task.kind === "task" || task.kind === "habit";
            return (
              <button
                key={task.id}
                className="flex items-center gap-3 rounded-2xl border border-lume-border bg-white p-3 text-left transition hover:border-lume-primary/30 hover:bg-[#FAFAFA]"
                type="button"
                onClick={() => onEdit(task.id)}
              >
                {isCheckable ? (
                  <span
                    className="grid h-5 w-5 shrink-0 place-items-center rounded border bg-white"
                    style={{
                      borderColor: task.completed ? color : `${color}88`,
                      backgroundColor: task.completed ? `${color}18` : "white",
                      color: task.completed ? color : "transparent",
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggle(task.id);
                    }}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                ) : (
                  <span className="h-5 w-5 shrink-0 rounded-md" style={{ backgroundColor: color }} />
                )}
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm font-semibold ${task.completed ? "text-lume-muted line-through" : "text-lume-ink"}`}>
                    {task.title}
                  </span>
                  <span className="mt-1 flex items-center gap-2 text-xs font-medium text-lume-muted">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    {formatTaskTime(task)}
                    <span style={{ color }}>{meta.label}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DaySidePanel({
  date,
  tasks,
  isToday,
  onClose,
  onCreate,
  onEdit,
  onToggle,
}: {
  date: string;
  tasks: Task[];
  isToday: boolean;
  onClose: () => void;
  onCreate: () => void;
  onEdit: (taskId: string) => void;
  onToggle: (taskId: string) => void;
}) {
  const dateObj = new Date(`${date}T00:00:00`);
  const events = tasks.filter((task) => task.kind === "event" || task.kind === "block");
  const checkables = tasks.filter((task) => task.kind === "task" || task.kind === "habit");

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/5" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-sm flex-col border-l border-lume-border bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-lume-border px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-lume-muted">{isToday ? "TODAY" : "DAY"}</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-lume-ink">
              {new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(dateObj)}
              <span className="ml-2 text-sm font-medium text-lume-muted">음력 03.19</span>
            </h3>
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-xl border border-lume-border text-lume-muted transition hover:bg-[#F4F4F2] hover:text-lume-ink"
            type="button"
            aria-label="Close day details"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <button
            className="mb-5 inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-lume-ink transition hover:bg-[#F4F4F2]"
            type="button"
            onClick={onCreate}
          >
            <Plus className="h-4 w-4" />
            생성
          </button>

          <div className="grid gap-4">
            {events.map((task) => (
              <DayPanelEvent key={task.id} task={task} onEdit={() => onEdit(task.id)} />
            ))}
            {checkables.map((task) => (
              <DayPanelCheckable key={task.id} task={task} onEdit={() => onEdit(task.id)} onToggle={() => onToggle(task.id)} />
            ))}
            {!tasks.length ? (
              <div className="rounded-2xl border border-dashed border-lume-border bg-[#FAFAFA] p-5 text-sm font-medium text-lume-muted">
                아직 등록된 항목이 없어요. 생성으로 이 날의 일정을 추가해보세요.
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-lume-border px-5 py-4">
          <button className="w-full rounded-xl px-1 py-2 text-left text-sm font-semibold text-lume-ink hover:text-lume-primary" type="button">
            이 날의 다른 정보
          </button>
        </div>
      </aside>
    </div>
  );
}

function DayPanelEvent({ task, onEdit }: { task: Task; onEdit: () => void }) {
  const color = getTaskColor(task);

  return (
    <button className="flex w-full gap-3 text-left" type="button" onClick={onEdit}>
      <span className="mt-1 h-4 w-4 shrink-0 rounded" style={{ backgroundColor: color }} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-lume-ink">{task.title}</span>
        <span className="mt-2 block text-xs font-medium text-lume-muted">{task.date} - {task.date}</span>
      </span>
    </button>
  );
}

function DayPanelCheckable({
  task,
  onEdit,
  onToggle,
}: {
  task: Task;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const color = getTaskColor(task);

  return (
    <button className="flex w-full items-start gap-3 text-left" type="button" onClick={onEdit}>
      <span
        className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border bg-white"
        style={{
          borderColor: task.completed ? color : `${color}88`,
          backgroundColor: task.completed ? `${color}18` : "white",
          color: task.completed ? color : "transparent",
        }}
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
      >
        <Check className="h-3 w-3" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm font-semibold ${task.completed ? "text-lume-muted line-through" : "text-lume-ink"}`}>
          {task.title}
        </span>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-lume-muted">
          <CalendarCheck className="h-3.5 w-3.5" />
          {task.kind === "habit" ? "반복 습관" : formatTaskTime(task)}
        </span>
      </span>
    </button>
  );
}
