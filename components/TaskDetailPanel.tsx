"use client";

import {
  Bell,
  Calendar,
  CheckCircle2,
  Copy,
  Edit3,
  MoreHorizontal,
  Repeat2,
  Sparkles,
  Star,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { LabelPicker } from "@/components/LabelPicker";
import { ProgressCard } from "@/components/ProgressCard";
import { useLumeStore, type Priority, type Recurrence, type TaskSection } from "@/store/useLumeStore";
import { toLocalDateId } from "@/lib/taskFilters";

const priorities: Priority[] = ["p1", "p2", "p3", "p4"];
const sections: TaskSection[] = ["To Do", "In Progress", "Done"];
const recurrenceOptions: Recurrence[] = ["none", "daily", "weekly", "monthly"];

export function TaskDetailPanel() {
  const tasks = useLumeStore((state) => state.tasks);
  const selectedTaskId = useLumeStore((state) => state.selectedTaskId);
  const deleteTask = useLumeStore((state) => state.deleteTask);
  const duplicateTask = useLumeStore((state) => state.duplicateTask);
  const updateTask = useLumeStore((state) => state.updateTask);
  const toggleComplete = useLumeStore((state) => state.toggleComplete);
  const selectTask = useLumeStore((state) => state.selectTask);
  const projects = useLumeStore((state) => state.projects);
  const availableLabels = useLumeStore((state) => state.labels);
  const task = tasks.find((item) => item.id === selectedTaskId);

  if (!task) {
    return (
      <aside className="min-h-[780px] bg-[#FCFCFB] p-5">
        <ProgressCard />
      </aside>
    );
  }

  const today = toLocalDateId(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowId = toLocalDateId(tomorrow);

  return (
    <aside className="min-h-[780px] bg-[#FCFCFB] p-5">
      <section className="rounded-2xl border border-lume-border bg-white p-5 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-lume-muted">
            <PanelIconButton label="Favorite task">
              <Star className="h-4 w-4" />
            </PanelIconButton>
          </div>
          <div className="flex items-center gap-2 text-lume-muted">
            <PanelIconButton label="Edit task">
              <Edit3 className="h-4 w-4" />
            </PanelIconButton>
            <PanelIconButton label="More actions">
              <MoreHorizontal className="h-4 w-4" />
            </PanelIconButton>
            <PanelIconButton label="Close detail" onClick={() => selectTask(undefined)}>
              <X className="h-4 w-4" />
            </PanelIconButton>
          </div>
        </div>

        <div className="mb-5 flex items-start gap-3">
          <button
            className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${
              task.completed
                ? "border-lume-primary bg-lume-primary text-white"
                : "border-lume-border text-transparent hover:border-lume-primary hover:text-lume-primary"
            }`}
            type="button"
            aria-label="Complete task"
            onClick={() => toggleComplete(task.id)}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">Task Detail</p>
            <h2 className={`mt-2 text-xl font-semibold tracking-[-0.03em] text-lume-ink ${task.completed ? "text-lume-muted line-through" : ""}`}>
              {task.title}
            </h2>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2">
          <QuickAction
            icon={Sparkles}
            label="Today"
            onClick={() => updateTask(task.id, { date: today })}
          />
          <QuickAction
            icon={Calendar}
            label="Tomorrow"
            onClick={() => updateTask(task.id, { date: tomorrowId })}
          />
          <QuickAction
            icon={Copy}
            label="Duplicate"
            onClick={() => duplicateTask(task.id)}
          />
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-lume-muted">Title</span>
            <input
              className="h-11 w-full rounded-xl border border-lume-border bg-[#FAFAFA] px-3 text-sm font-semibold text-lume-ink outline-none transition focus:border-lume-primary focus:ring-4 focus:ring-black/5"
              value={task.title}
              onChange={(event) => updateTask(task.id, { title: event.target.value })}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <EditableField label="Date" icon={Calendar}>
              <input
                inputMode="numeric"
                placeholder="YYYY-MM-DD"
                value={task.date}
                onChange={(event) => updateTask(task.id, { date: event.target.value })}
              />
            </EditableField>
            <EditableField label="Time">
              <input
                inputMode="numeric"
                placeholder="HH:mm"
                value={task.time}
                onChange={(event) => updateTask(task.id, { time: event.target.value })}
              />
            </EditableField>
          </div>

          <EditableField label="End Time">
            <input
              inputMode="numeric"
              placeholder="HH:mm"
              value={task.endTime ?? ""}
              onChange={(event) => updateTask(task.id, { endTime: event.target.value || undefined })}
            />
          </EditableField>

          <div className="grid grid-cols-2 gap-3">
            <EditableField label="Deadline">
              <input
                inputMode="numeric"
                placeholder="YYYY-MM-DD"
                value={task.deadline ?? ""}
                onChange={(event) => updateTask(task.id, { deadline: event.target.value || undefined })}
              />
            </EditableField>
            <EditableField label="Status">
              <select
                value={task.completed ? "Done" : "Open"}
                onChange={(event) => {
                  const completed = event.target.value === "Done";
                  updateTask(task.id, { completed, section: completed ? "Done" : task.section });
                }}
              >
                <option>Open</option>
                <option>Done</option>
              </select>
            </EditableField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <EditableField label="Section">
              <select
                value={task.section}
                onChange={(event) => {
                  const section = event.target.value as TaskSection;
                  updateTask(task.id, { section, completed: section === "Done" ? true : task.completed });
                }}
              >
                {sections.map((section) => (
                  <option key={section}>{section}</option>
                ))}
              </select>
            </EditableField>
            <EditableField label="Repeat">
              <select
                value={task.recurrence ?? "none"}
                onChange={(event) => updateTask(task.id, { recurrence: event.target.value as Recurrence })}
              >
                {recurrenceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </EditableField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <EditableField label="Project">
              <select
                value={task.project}
                onChange={(event) => updateTask(task.id, { project: event.target.value })}
              >
                {projects.map((project) => (
                  <option key={project}>{project}</option>
                ))}
              </select>
            </EditableField>
            <EditableField label="Priority">
              <select
                value={task.priority}
                onChange={(event) => updateTask(task.id, { priority: event.target.value as Priority })}
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </EditableField>
          </div>

          <div className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-lume-muted">Labels</span>
            <LabelPicker
              labels={availableLabels}
              selected={task.labels}
              onChange={(labels) => updateTask(task.id, { labels })}
            />
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-lume-muted">
              Notes
            </span>
            <textarea
              className="min-h-32 w-full resize-none rounded-xl border border-lume-border bg-[#FAFAFA] p-3 text-sm leading-6 text-lume-ink outline-none transition focus:border-lume-primary focus:ring-4 focus:ring-black/5"
              value={task.notes ?? ""}
              placeholder="Add context, links, decisions, or next steps."
              onChange={(event) => updateTask(task.id, { notes: event.target.value })}
            />
          </label>
        </div>

        <div className="mt-5 grid gap-3">
          <ToggleLine icon={Bell} label="Reminder" />
          <ToggleLine icon={Repeat2} label="Repeat" value="None" />
          <button
            className="flex items-center gap-2 rounded-xl border border-lume-border bg-white px-4 py-3 text-sm font-semibold text-lume-muted transition hover:border-[#FFD8D1] hover:bg-[#FFF5F3] hover:text-[#E06153]"
            type="button"
            onClick={() => deleteTask(task.id)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Task
          </button>
        </div>
      </section>
      <div className="mt-4">
        <ProgressCard />
      </div>
    </aside>
  );
}

function PanelIconButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      className="grid h-8 w-8 place-items-center rounded-lg text-lume-muted transition hover:bg-[#F4F4F2] hover:text-lume-ink"
      type="button"
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="grid place-items-center gap-1 rounded-xl border border-lume-border bg-[#FAFAFA] px-2 py-3 text-xs font-semibold text-lume-muted transition hover:border-lume-primary/30 hover:bg-[#F4F4F2] hover:text-lume-primary"
      type="button"
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function EditableField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-lume-muted">
        {Icon ? <Icon className="h-3.5 w-3.5 text-lume-primary" /> : null}
        {label}
      </span>
      <div className="[&_input]:h-11 [&_input]:w-full [&_input]:min-w-0 [&_input]:rounded-xl [&_input]:border [&_input]:border-lume-border [&_input]:bg-[#FAFAFA] [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:text-lume-ink [&_input]:outline-none [&_input]:transition [&_input:focus]:border-lume-primary [&_input:focus]:ring-4 [&_input:focus]:ring-black/5 [&_select]:h-11 [&_select]:w-full [&_select]:min-w-0 [&_select]:rounded-xl [&_select]:border [&_select]:border-lume-border [&_select]:bg-[#FAFAFA] [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:capitalize [&_select]:text-lume-ink [&_select]:outline-none [&_select]:transition [&_select:focus]:border-lume-primary [&_select:focus]:ring-4 [&_select:focus]:ring-black/5">
        {children}
      </div>
    </label>
  );
}

function ToggleLine({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-lume-border bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-medium text-lume-ink">
        <Icon className="h-4 w-4 text-lume-primary" />
        {label}
      </div>
      {value ? (
        <span className="text-sm font-medium text-lume-muted">{value}</span>
      ) : (
        <button className="h-6 w-11 rounded-full bg-[#E9E9E6] p-1" type="button" aria-label={label}>
          <span className="block h-4 w-4 rounded-full bg-lume-primary" />
        </button>
      )}
    </div>
  );
}
