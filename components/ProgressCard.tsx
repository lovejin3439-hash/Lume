"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Gauge, ListTodo, Trophy, type LucideIcon } from "lucide-react";
import { useLumeStore } from "@/store/useLumeStore";
import { filterTasks } from "@/lib/taskFilters";

export function ProgressCard() {
  const tasks = useLumeStore((state) => state.tasks);
  const pageTitle = useLumeStore((state) => state.pageTitle);
  const selectedDate = useLumeStore((state) => state.selectedDate);
  const searchQuery = useLumeStore((state) => state.searchQuery);
  const todayTasks = filterTasks(tasks, pageTitle, selectedDate, searchQuery);
  const completed = todayTasks.filter((task) => task.completed).length;
  const progress = todayTasks.length ? Math.round((completed / todayTasks.length) * 100) : 0;
  const busyLevel = todayTasks.length >= 7 ? "High" : todayTasks.length >= 4 ? "Balanced" : "Light";
  const points = tasks.reduce((total, task) => {
    if (!task.completed) return total;
    const priorityBonus = task.priority === "p1" ? 3 : 1;
    const deadlineBonus = task.deadline && task.date <= task.deadline ? 2 : 0;
    return total + priorityBonus + deadlineBonus;
  }, 0);
  const level = points >= 1000 ? "Pro" : points >= 500 ? "Intermediate" : "Beginner";

  return (
    <section className="rounded-2xl border border-lume-border bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">Today&apos;s Focus</p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-lume-ink">Today Insight</h2>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Metric icon={ListTodo} label="Tasks" value={todayTasks.length.toString()} />
        <Metric icon={CheckCircle2} label="Done" value={completed.toString()} />
        <Metric icon={Gauge} label="Busy" value={busyLevel} />
      </div>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-lume-muted">
          <span>Daily progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#EAEAE7]">
          <motion.div
            className="h-full rounded-full bg-lume-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
      <p className="mt-5 rounded-xl bg-[#F4F4F2] p-4 text-sm leading-6 text-lume-muted">
        Your day looks balanced. Keep the momentum.
      </p>
      <div className="mt-3 rounded-xl border border-lume-border bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F4F4F2] text-lume-primary">
            <Trophy className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-semibold text-lume-ink">{points} karma points</div>
            <div className="text-xs font-medium text-lume-muted">{level} level</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-lume-border bg-[#FAFAFA] p-3">
      <Icon className="mb-2 h-4 w-4 text-lume-primary" />
      <div className="text-sm font-semibold text-lume-ink">{value}</div>
      <div className="text-[11px] font-medium text-lume-muted">{label}</div>
    </div>
  );
}
