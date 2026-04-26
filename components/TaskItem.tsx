"use client";

import { motion } from "framer-motion";
import { Check, Clock3, Copy, Flag, MoreVertical, Tag, Trash2 } from "lucide-react";
import { getProjectColor } from "@/lib/projectColors";
import { useLumeStore, type Task } from "@/store/useLumeStore";

const priorityStyle: Record<string, string> = {
  p1: "bg-[#FFF0EE] text-[#E06153]",
  p2: "bg-[#F4F4F2] text-lume-primary",
  p3: "bg-[#F0F4F7] text-[#344B60]",
  p4: "bg-[#FAFAFA] text-lume-muted",
  high: "bg-[#FFF0EE] text-[#E06153]",
  medium: "bg-[#F4F4F2] text-lume-primary",
  low: "bg-[#FAFAFA] text-lume-muted",
};

export function TaskItem({ task, density = "default" }: { task: Task; density?: "default" | "compact" }) {
  const toggleComplete = useLumeStore((state) => state.toggleComplete);
  const duplicateTask = useLumeStore((state) => state.duplicateTask);
  const deleteTask = useLumeStore((state) => state.deleteTask);
  const selectTask = useLumeStore((state) => state.selectTask);
  const selectedTaskId = useLumeStore((state) => state.selectedTaskId);
  const selected = selectedTaskId === task.id;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = !task.completed && task.date < today;
  const deadlineSoon = task.deadline && !task.completed && task.deadline <= today;
  const projectColor = getProjectColor(task.project);

  if (density === "compact") {
    return (
      <motion.article
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        whileHover={{ y: -1 }}
        className={`group rounded-xl border bg-white p-3 transition ${
          selected
            ? "border-lume-primary/60 ring-4 ring-black/5"
            : overdue || deadlineSoon
              ? "border-[#FFD8D1]"
              : "border-lume-border hover:border-lume-primary/30 hover:shadow-sm"
        }`}
        onClick={() => selectTask(task.id)}
      >
        <div className="flex items-start gap-2">
          <CompleteButton task={task} compact onToggle={toggleComplete} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <h3
                className={`min-w-0 flex-1 text-sm font-semibold leading-5 text-lume-ink ${
                  task.completed ? "text-lume-muted line-through" : ""
                }`}
              >
                {task.title}
              </h3>
              <span className={`rounded-full border border-lume-border px-2 py-0.5 text-[10px] font-semibold ${priorityStyle[task.priority]}`}>
                {task.priority.toUpperCase()}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-lume-muted">
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3 w-3" />
                {task.time}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${projectColor.chip}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${projectColor.dot}`} />
                {task.project}
              </span>
              {task.labels.slice(0, 1).map((label) => (
                <span key={label} className="rounded-full border border-lume-border bg-white px-2 py-1">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -1 }}
      className={`group grid min-h-[68px] grid-cols-[32px_minmax(0,1fr)_34px] items-center gap-3 rounded-xl border bg-white px-4 py-3 transition lg:grid-cols-[32px_64px_minmax(0,1fr)_132px_96px_132px_34px] lg:gap-4 ${
        selected
          ? "border-lume-primary/60 ring-4 ring-black/5"
          : overdue || deadlineSoon
            ? "border-[#FFD8D1] hover:border-[#E06153]/40"
            : "border-lume-border hover:border-lume-primary/30 hover:shadow-sm"
      }`}
      onClick={() => selectTask(task.id)}
    >
      <CompleteButton task={task} onToggle={toggleComplete} />

      <div className="hidden text-sm font-medium tabular-nums text-lume-muted lg:block">{task.time}</div>

      <div className="min-w-0">
        <h3 className={`truncate text-sm font-semibold text-lume-ink ${task.completed ? "text-lume-muted line-through" : ""}`}>
          {task.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-lume-muted">
          <span className="lg:hidden">{task.time}</span>
          <span className="lg:hidden">{task.project}</span>
          {overdue ? <span className="text-[#E06153]">Overdue</span> : null}
          {task.deadline ? <span>Deadline {task.deadline.slice(5)}</span> : null}
          {task.recurrence && task.recurrence !== "none" ? <span>Repeats {task.recurrence}</span> : null}
        </div>
      </div>

      <span className={`hidden min-w-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium lg:inline-flex ${projectColor.chip}`}>
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${projectColor.dot}`} />
        <span className="truncate">{task.project}</span>
      </span>

      <span className={`hidden items-center justify-center gap-1 rounded-full border border-lume-border px-2.5 py-1 text-[11px] font-semibold lg:inline-flex ${priorityStyle[task.priority]}`}>
        <Flag className="h-3 w-3" />
        {task.priority.toUpperCase()}
      </span>

      <div className="hidden min-w-0 items-center gap-1 overflow-hidden lg:flex">
        {task.labels.length ? (
          task.labels.slice(0, 2).map((label) => (
            <span key={label} className="inline-flex min-w-0 items-center gap-1 rounded-full border border-lume-border bg-white px-2 py-1 text-[11px] font-medium text-lume-muted">
              <Tag className="h-3 w-3 shrink-0" />
              <span className="truncate">{label}</span>
            </span>
          ))
        ) : (
          <span className="text-xs font-medium text-lume-muted/60">No label</span>
        )}
      </div>

      <div className="relative flex justify-end">
        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <QuickButton
            label="Duplicate task"
            onClick={(event) => {
              event.stopPropagation();
              duplicateTask(task.id);
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </QuickButton>
          <QuickButton
            label="Delete task"
            danger
            onClick={(event) => {
              event.stopPropagation();
              deleteTask(task.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </QuickButton>
        </div>
        <MoreVertical className="absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-lume-muted transition group-hover:opacity-0" />
      </div>
    </motion.article>
  );
}

function CompleteButton({
  task,
  compact,
  onToggle,
}: {
  task: Task;
  compact?: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      className={`grid shrink-0 place-items-center rounded-full border transition ${compact ? "h-5 w-5" : "h-6 w-6"} ${
        task.completed
          ? "border-lume-primary bg-lume-primary text-white"
          : "border-lume-border text-transparent hover:border-lume-primary hover:text-lume-primary"
      }`}
      type="button"
      aria-label="Complete task"
      onClick={(event) => {
        event.stopPropagation();
        onToggle(task.id);
      }}
    >
      <motion.span
        initial={false}
        animate={{ scale: task.completed ? 1 : 0.4, opacity: task.completed ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
      >
        <Check className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </motion.span>
    </button>
  );
}

function QuickButton({
  label,
  children,
  danger,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  danger?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      className={`grid h-7 w-7 place-items-center rounded-full border border-lume-border bg-white text-lume-muted transition ${
        danger ? "hover:border-[#FFD8D1] hover:bg-[#FFF0EE] hover:text-[#E06153]" : "hover:border-lume-primary/30 hover:text-lume-primary"
      }`}
      type="button"
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
