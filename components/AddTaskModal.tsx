"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { LabelPicker } from "@/components/LabelPicker";
import { useLumeStore, type Priority, type Recurrence, type TaskSection } from "@/store/useLumeStore";
import { toLocalDateId } from "@/lib/taskFilters";
import { parseQuickAdd } from "@/lib/quickAddParser";

const today = toLocalDateId(new Date());

export function AddTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addTask = useLumeStore((state) => state.addTask);
  const projects = useLumeStore((state) => state.projects);
  const availableLabels = useLumeStore((state) => state.labels);
  const selectedDate = useLumeStore((state) => state.selectedDate);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(selectedDate || today);
  const [time, setTime] = useState("09:00");
  const [project, setProject] = useState("Work");
  const [priority, setPriority] = useState<Priority>("p4");
  const [labels, setLabels] = useState<string[]>(["Important"]);
  const [deadline, setDeadline] = useState("");
  const [section, setSection] = useState<TaskSection>("To Do");
  const [recurrence, setRecurrence] = useState<Recurrence>("none");
  const [notes, setNotes] = useState("");
  const [smartInput, setSmartInput] = useState("");

  useEffect(() => {
    if (open) setDate(selectedDate || today);
  }, [open, selectedDate]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      date,
      time,
      project,
      priority,
      labels,
      deadline: deadline || undefined,
      section,
      recurrence,
      notes,
    });
    setTitle("");
    setNotes("");
    setDeadline("");
    setSection("To Do");
    setRecurrence("none");
    setSmartInput("");
    setDate(selectedDate || today);
    onClose();
  }

  function applySmartInput() {
    const parsed = parseQuickAdd(smartInput);
    if (parsed.title) setTitle(parsed.title);
    if (parsed.date) setDate(parsed.date);
    if (parsed.time) setTime(parsed.time);
    if (parsed.project) setProject(parsed.project);
    if (parsed.priority) setPriority(parsed.priority);
    if (parsed.deadline) setDeadline(parsed.deadline);
    if (parsed.labels.length) setLabels(Array.from(new Set([...labels, ...parsed.labels])));
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-lume-ink/30 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.form
            className="flex max-h-[calc(100vh-32px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-lume-border bg-white shadow-glow"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onSubmit={submit}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-lume-border px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">New Task</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-lume-ink">Add clarity to your day</h2>
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-xl border border-lume-border text-lume-muted transition hover:bg-[#F4F4F2] hover:text-lume-ink"
                type="button"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 overflow-y-auto px-6 py-5">
              <div className="rounded-2xl border border-lume-border bg-[#FAFAFA] p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">
                  Smart Quick Add
                </div>
                <div className="flex gap-2">
                  <input
                    className="h-11 min-w-0 flex-1 rounded-xl border border-lume-border bg-white px-4 text-sm font-medium outline-none transition focus:border-lume-primary focus:ring-4 focus:ring-black/5"
                    value={smartInput}
                    onChange={(event) => setSmartInput(event.target.value)}
                    placeholder="Prepare proposal #Work @Important p1 tomorrow 14:00 !deadline 12/31"
                  />
                  <button
                    className="rounded-xl bg-lume-primary px-4 text-sm font-semibold text-white transition hover:bg-black/80"
                    type="button"
                    onClick={applySmartInput}
                  >
                    Parse
                  </button>
                </div>
              </div>
              <Field label="Task title">
                <input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="e.g. Prepare client proposal" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date">
                  <input inputMode="numeric" placeholder="YYYY-MM-DD" value={date} onChange={(event) => setDate(event.target.value)} />
                </Field>
                <Field label="Time">
                  <input inputMode="numeric" placeholder="HH:mm" value={time} onChange={(event) => setTime(event.target.value)} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Project">
                  <select value={project} onChange={(event) => setProject(event.target.value)}>
                    {projects.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Priority">
                  <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
                    <option value="p1">P1 urgent</option>
                    <option value="p2">P2 high</option>
                    <option value="p3">P3 medium</option>
                    <option value="p4">P4 default</option>
                  </select>
                </Field>
              </div>
              <Field label="Deadline">
                <input inputMode="numeric" placeholder="YYYY-MM-DD" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Section">
                  <select value={section} onChange={(event) => setSection(event.target.value as TaskSection)}>
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                </Field>
                <Field label="Repeat">
                  <select value={recurrence} onChange={(event) => setRecurrence(event.target.value as Recurrence)}>
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </Field>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-semibold text-lume-ink">Labels</div>
                <LabelPicker labels={availableLabels} selected={labels} onChange={setLabels} />
              </div>
              <Field label="Notes">
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add context, links, or next steps" />
              </Field>
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-lume-border bg-white px-6 py-4">
              <button
                className="h-11 rounded-xl border border-lume-border px-5 text-sm font-semibold text-lume-muted transition hover:bg-[#F4F4F2] hover:text-lume-ink"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="h-11 rounded-xl bg-lume-primary px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(0,0,0,0.14)] transition hover:bg-black/80"
                type="submit"
              >
                Save task
              </button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-lume-ink">
      {label}
      <div className="[&_input]:h-11 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-lume-border [&_input]:bg-[#FAFAFA] [&_input]:px-4 [&_input]:text-sm [&_input]:font-medium [&_input]:outline-none [&_input]:transition [&_input:focus]:border-lume-primary [&_input:focus]:ring-4 [&_input:focus]:ring-black/5 [&_select]:h-11 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-lume-border [&_select]:bg-[#FAFAFA] [&_select]:px-4 [&_select]:text-sm [&_select]:font-medium [&_select]:outline-none [&_select]:transition [&_select:focus]:border-lume-primary [&_select:focus]:ring-4 [&_select:focus]:ring-black/5 [&_textarea]:min-h-28 [&_textarea]:w-full [&_textarea]:resize-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-lume-border [&_textarea]:bg-[#FAFAFA] [&_textarea]:p-4 [&_textarea]:text-sm [&_textarea]:font-medium [&_textarea]:leading-6 [&_textarea]:outline-none [&_textarea]:transition [&_textarea:focus]:border-lume-primary [&_textarea:focus]:ring-4 [&_textarea:focus]:ring-black/5">
        {children}
      </div>
    </label>
  );
}
