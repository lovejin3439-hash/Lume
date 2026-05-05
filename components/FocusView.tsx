"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Pause, Play, RotateCcw, Sparkles, TimerReset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TaskItem } from "@/components/TaskItem";
import { filterTasks } from "@/lib/taskFilters";
import { useLumeStore } from "@/store/useLumeStore";

const defaultFocusMinutes = 25;
const timerPresets = [15, 25, 45, 60];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function FocusView() {
  const [focusMinutes, setFocusMinutes] = useState(defaultFocusMinutes);
  const focusDuration = focusMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(focusDuration);
  const [isRunning, setIsRunning] = useState(false);
  const tasks = useLumeStore((state) => state.tasks);
  const selectedDate = useLumeStore((state) => state.selectedDate);
  const selectedTaskId = useLumeStore((state) => state.selectedTaskId);
  const searchQuery = useLumeStore((state) => state.searchQuery);
  const toggleComplete = useLumeStore((state) => state.toggleComplete);

  const focusTasks = useMemo(
    () => filterTasks(tasks, "Focus", selectedDate, searchQuery),
    [tasks, selectedDate, searchQuery],
  );
  const selectedFocusTask = focusTasks.find((task) => task.id === selectedTaskId);
  const currentTask = selectedFocusTask ?? focusTasks.find((task) => !task.completed) ?? focusTasks[0];
  const progress = Math.round(((focusDuration - secondsLeft) / focusDuration) * 100);
  const focusLabel = currentTask
    ? [
        currentTask.endTime ? `${currentTask.time} - ${currentTask.endTime}` : currentTask.time,
        currentTask.project,
        currentTask.labels.slice(0, 2).join(" · "),
      ].filter(Boolean).join(" · ")
    : "Pick a task";

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setIsRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning]);

  function resetTimer() {
    setIsRunning(false);
    setSecondsLeft(focusDuration);
  }

  function changeDuration(minutes: number) {
    const safeMinutes = Math.min(180, Math.max(1, Math.round(minutes || defaultFocusMinutes)));
    setFocusMinutes(safeMinutes);
    setSecondsLeft(safeMinutes * 60);
    setIsRunning(false);
  }

  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_330px]">
      <section className="relative overflow-hidden rounded-2xl border border-lume-border bg-white p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-black/[0.035] blur-3xl" />
        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#F4F4F2] px-3 py-1.5 text-xs font-semibold text-lume-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Lume Focus Mode
          </div>

          <div className="grid gap-8 xl:grid-cols-[1fr_240px] xl:items-center">
            <div>
              <p className="text-sm font-medium text-lume-muted">Current focus</p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.04em] text-lume-ink">
                {currentTask ? currentTask.title : "Choose one meaningful task."}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-lume-muted">
                Protect one clean block of attention. When the timer is running, Lume keeps the rest of
                your day quiet.
              </p>

              {currentTask ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-lume-border bg-[#FAFAFA] px-3 py-1.5 text-xs font-semibold text-lume-muted">
                    {currentTask.project}
                  </span>
                  {currentTask.labels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-lume-border bg-white px-3 py-1.5 text-xs font-semibold text-lume-muted"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-lume-border bg-[#FAFAFA] p-5 text-center">
              <div className="mb-4 rounded-2xl border border-lume-border bg-white px-3 py-3 text-left shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-lume-muted">Timer task</p>
                <p className="mt-1 truncate text-sm font-semibold text-lume-ink">
                  {currentTask ? currentTask.title : "No task selected"}
                </p>
                {currentTask ? <p className="mt-1 truncate text-xs font-medium text-lume-muted">{focusLabel}</p> : null}
              </div>
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-lume-primary text-white shadow-[0_18px_38px_rgba(0,0,0,0.16)]">
                <TimerReset className="h-7 w-7" />
              </div>
              <div className="text-5xl font-semibold tracking-[-0.06em] text-lume-ink">
                {formatTime(secondsLeft)}
              </div>
              <div className="mt-2 text-xs font-semibold text-lume-muted">
                {focusMinutes} min for {currentTask ? currentTask.title : "focus"}
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                <motion.div
                  className="h-full rounded-full bg-lume-primary"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <button
                  className="grid h-11 place-items-center rounded-xl bg-lume-primary text-white transition hover:bg-black/80"
                  type="button"
                  aria-label={isRunning ? "Pause focus timer" : "Start focus timer"}
                  onClick={() => setIsRunning(!isRunning)}
                >
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  className="grid h-11 place-items-center rounded-xl border border-lume-border bg-white text-lume-muted transition hover:text-lume-primary"
                  type="button"
                  aria-label="Reset timer"
                  onClick={resetTimer}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  className="grid h-11 place-items-center rounded-xl border border-lume-border bg-white text-lume-muted transition hover:text-lume-primary disabled:cursor-not-allowed disabled:opacity-40"
                  type="button"
                  aria-label="Complete current focus task"
                  disabled={!currentTask}
                  onClick={() => currentTask && toggleComplete(currentTask.id)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-5 grid gap-3">
                <div className="grid grid-cols-4 gap-2">
                  {timerPresets.map((minutes) => (
                    <button
                      key={minutes}
                      className={`h-8 rounded-xl border text-xs font-semibold transition ${
                        focusMinutes === minutes
                          ? "border-lume-primary/30 bg-[#F4F4F2] text-lume-primary"
                          : "border-lume-border bg-white text-lume-muted hover:text-lume-primary"
                      }`}
                      type="button"
                      onClick={() => changeDuration(minutes)}
                    >
                      {minutes}
                    </button>
                  ))}
                </div>
                <label className="grid gap-1 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-lume-muted">
                  Custom minutes
                  <input
                    className="h-10 rounded-xl border border-lume-border bg-white px-3 text-sm font-semibold normal-case tracking-normal text-lume-ink outline-none transition focus:border-lume-primary focus:ring-4 focus:ring-black/5"
                    min={1}
                    max={180}
                    type="number"
                    value={focusMinutes}
                    onChange={(event) => changeDuration(Number(event.target.value))}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="rounded-2xl border border-lume-border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">Queue</p>
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-lume-ink">Focus tasks</h3>
          </div>
          <span className="rounded-full bg-[#F4F4F2] px-3 py-1 text-xs font-semibold text-lume-primary">
            {focusTasks.length}
          </span>
        </div>

        <div className="grid gap-3">
          <AnimatePresence initial={false}>
            {focusTasks.length ? (
              focusTasks.map((task) => <TaskItem key={task.id} task={task} density="compact" />)
            ) : (
              <div className="rounded-2xl border border-dashed border-lume-border bg-[#FAFAFA] p-6 text-center">
                <p className="text-sm font-semibold text-lume-ink">No focus tasks yet</p>
                <p className="mt-1 text-xs leading-5 text-lume-muted">
                  Mark tasks high priority or add the Important label.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </div>
  );
}
