"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Clock3,
  Columns3,
  Inbox,
  KanbanSquare,
  ListChecks,
  Plus,
  Search,
  Sparkles,
  SunMedium,
  Timer,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLumeStore, type ActiveView } from "@/store/useLumeStore";

type Command = {
  id: string;
  label: string;
  hint: string;
  icon: typeof Search;
  action: () => void;
};

export function CommandPalette({
  open,
  onClose,
  onAddTask,
}: {
  open: boolean;
  onClose: () => void;
  onAddTask: () => void;
}) {
  const [query, setQuery] = useState("");
  const setPageTitle = useLumeStore((state) => state.setPageTitle);
  const setActiveView = useLumeStore((state) => state.setActiveView);
  const setSearchQuery = useLumeStore((state) => state.setSearchQuery);

  const commands = useMemo<Command[]>(
    () => [
      {
        id: "add-task",
        label: "Add a new task",
        hint: "Open task composer",
        icon: Plus,
        action: onAddTask,
      },
      {
        id: "today",
        label: "Go to Today",
        hint: "Show today's focus list",
        icon: SunMedium,
        action: () => setPageTitle("Today"),
      },
      {
        id: "upcoming",
        label: "Go to Upcoming",
        hint: "See future tasks",
        icon: CalendarDays,
        action: () => setPageTitle("Upcoming"),
      },
      {
        id: "focus",
        label: "Go to Focus",
        hint: "Important and high priority",
        icon: Timer,
        action: () => {
          setPageTitle("Focus");
          setActiveView("list" as ActiveView);
        },
      },
      {
        id: "inbox",
        label: "Open Inbox",
        hint: "All tasks",
        icon: Inbox,
        action: () => setPageTitle("Inbox"),
      },
      {
        id: "list-view",
        label: "Switch to List View",
        hint: "Grouped by day or time",
        icon: ListChecks,
        action: () => setActiveView("list" as ActiveView),
      },
      {
        id: "time-view",
        label: "Switch to Time View",
        hint: "Vertical day timeline",
        icon: Clock3,
        action: () => setActiveView("time" as ActiveView),
      },
      {
        id: "week-view",
        label: "Switch to Week View",
        hint: "Seven-day planning board",
        icon: Columns3,
        action: () => setActiveView("week" as ActiveView),
      },
      {
        id: "calendar-view",
        label: "Switch to Calendar View",
        hint: "Monthly planning grid",
        icon: CalendarDays,
        action: () => setActiveView("calendar" as ActiveView),
      },
      {
        id: "board-view",
        label: "Switch to Board View",
        hint: "Kanban section workflow",
        icon: KanbanSquare,
        action: () => setActiveView("board" as ActiveView),
      },
      {
        id: "clear-search",
        label: "Clear search",
        hint: "Reset task search filter",
        icon: X,
        action: () => setSearchQuery(""),
      },
    ],
    [onAddTask, setActiveView, setPageTitle, setSearchQuery],
  );

  const results = commands.filter((command) =>
    `${command.label} ${command.hint}`.toLowerCase().includes(query.toLowerCase()),
  );

  function run(command: Command) {
    command.action();
    setQuery("");
    onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] bg-lume-ink/25 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="mx-auto mt-[10vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-lume-border bg-white shadow-glow"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-lume-border px-5 py-4">
              <Search className="h-5 w-5 text-lume-primary" />
              <input
                autoFocus
                className="h-10 flex-1 bg-transparent text-base font-medium text-lume-ink outline-none placeholder:text-lume-muted"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search commands or jump anywhere..."
              />
              <span className="rounded-full border border-lume-border px-2 py-1 text-[11px] font-semibold text-lume-muted">
                esc
              </span>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-3">
              {results.length ? (
                results.map((command) => {
                  const Icon = command.icon;
                  return (
                    <button
                      key={command.id}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#F4F4F2]"
                      type="button"
                      onClick={() => run(command)}
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F4F4F2] text-lume-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-lume-ink">{command.label}</span>
                        <span className="block text-xs font-medium text-lume-muted">{command.hint}</span>
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="grid place-items-center rounded-2xl border border-dashed border-lume-border bg-[#FAFAFA] p-8 text-center">
                  <Sparkles className="mb-3 h-6 w-6 text-lume-primary" />
                  <p className="text-sm font-semibold text-lume-ink">No matching command</p>
                  <p className="mt-1 text-xs text-lume-muted">Try Add, Today, Time, or Focus.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
