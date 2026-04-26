"use client";

import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { TaskItem } from "@/components/TaskItem";
import { filterTasks } from "@/lib/taskFilters";
import { useLumeStore, type TaskSection } from "@/store/useLumeStore";

const sections: TaskSection[] = ["To Do", "In Progress", "Done"];

export function BoardView({ onAddTask }: { onAddTask: () => void }) {
  const tasks = useLumeStore((state) => state.tasks);
  const pageTitle = useLumeStore((state) => state.pageTitle);
  const selectedDate = useLumeStore((state) => state.selectedDate);
  const searchQuery = useLumeStore((state) => state.searchQuery);
  const updateTask = useLumeStore((state) => state.updateTask);
  const visibleTasks = filterTasks(tasks, pageTitle, selectedDate, searchQuery);

  function move(taskId: string, direction: -1 | 1) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    const index = sections.indexOf(task.section ?? "To Do");
    const next = sections[Math.max(0, Math.min(sections.length - 1, index + direction))];
    updateTask(taskId, {
      section: next,
      completed: next === "Done",
    });
  }

  return (
    <div className="rounded-2xl border border-lume-border bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">Board</p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-lume-ink">Section workflow</h2>
          <p className="mt-1 text-sm text-lume-muted">A clean Kanban layout for project execution.</p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-lume-primary px-4 text-sm font-semibold text-white transition hover:bg-black/80"
          type="button"
          onClick={onAddTask}
        >
          <Plus className="h-4 w-4" />
          Add card
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {sections.map((section) => {
          const columnTasks = visibleTasks.filter((task) => (task.section ?? "To Do") === section);
          return (
            <section key={section} className="min-h-[460px] rounded-2xl border border-lume-border bg-[#FAFAFA] p-3">
              <div className="mb-3 flex items-center justify-between rounded-xl bg-white px-3 py-3 shadow-sm">
                <h3 className="text-sm font-semibold text-lume-ink">{section}</h3>
                <span className="rounded-full bg-[#F4F4F2] px-2 py-1 text-xs font-semibold text-lume-primary">
                  {columnTasks.length}
                </span>
              </div>

              <div className="grid gap-3">
                {columnTasks.length ? (
                  columnTasks.map((task) => {
                    const index = sections.indexOf(task.section ?? "To Do");
                    return (
                      <article key={task.id} className="rounded-2xl bg-white p-2 shadow-sm">
                        <TaskItem task={task} density="compact" />
                        <div className="mt-2 flex justify-end gap-2 px-1 pb-1">
                          <MoveButton disabled={index === 0} label="Move left" onClick={() => move(task.id, -1)}>
                            <ArrowLeft className="h-3.5 w-3.5" />
                          </MoveButton>
                          <MoveButton disabled={index === sections.length - 1} label="Move right" onClick={() => move(task.id, 1)}>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </MoveButton>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-lume-border bg-white/70 p-5 text-center text-sm font-medium text-lume-muted">
                    No cards here
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function MoveButton({
  disabled,
  label,
  children,
  onClick,
}: {
  disabled: boolean;
  label: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="grid h-8 w-8 place-items-center rounded-lg border border-lume-border text-lume-muted transition hover:border-lume-primary/30 hover:text-lume-primary disabled:cursor-not-allowed disabled:opacity-35"
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
