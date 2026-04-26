"use client";

import { FormEvent, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  CircleDot,
  GraduationCap,
  Inbox,
  Layers3,
  Search,
  LogOut,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  SunMedium,
  Tag,
  Timer,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { getProjectColor } from "@/lib/projectColors";
import { useLumeStore } from "@/store/useLumeStore";
import { filterTasks, toLocalDateId } from "@/lib/taskFilters";

const navItems = [
  { label: "Inbox", icon: Inbox },
  { label: "Today", icon: SunMedium },
  { label: "Upcoming", icon: CalendarDays },
  { label: "Calendar", icon: Layers3 },
  { label: "Focus", icon: Timer },
];

const projectMeta = {
  Personal: { icon: UserRound },
  Work: { icon: BriefcaseBusiness },
  School: { icon: GraduationCap },
  Sales: { icon: UsersRound },
};

export function Sidebar() {
  const [projectInput, setProjectInput] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const tasks = useLumeStore((state) => state.tasks);
  const projects = useLumeStore((state) => state.projects);
  const labels = useLumeStore((state) => state.labels);
  const pageTitle = useLumeStore((state) => state.pageTitle);
  const selectedDate = useLumeStore((state) => state.selectedDate);
  const searchQuery = useLumeStore((state) => state.searchQuery);
  const setPageTitle = useLumeStore((state) => state.setPageTitle);
  const setActiveView = useLumeStore((state) => state.setActiveView);
  const setSearchQuery = useLumeStore((state) => state.setSearchQuery);
  const addProject = useLumeStore((state) => state.addProject);
  const addLabel = useLumeStore((state) => state.addLabel);
  const resetWorkspace = useLumeStore((state) => state.resetWorkspace);
  const user = useLumeStore((state) => state.user);
  const signOut = useLumeStore((state) => state.signOut);
  const todayCount = tasks.filter((task) => task.date === toLocalDateId(new Date())).length;

  function submitProject(event: FormEvent) {
    event.preventDefault();
    addProject(projectInput);
    setProjectInput("");
  }

  function submitLabel(event: FormEvent) {
    event.preventDefault();
    addLabel(labelInput);
    setLabelInput("");
  }

  function handleReset() {
    if (window.confirm("Reset Lume demo data? Your local tasks, projects, and labels will be restored to the sample workspace.")) {
      resetWorkspace();
    }
  }

  return (
    <aside className="flex min-h-[780px] flex-col gap-6 bg-[#FCFCFB] p-5">
      <Logo />

      <label className="relative block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lume-muted" />
        <input
          data-lume-search
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="h-11 w-full rounded-xl border border-lume-border bg-white pl-10 pr-10 text-sm outline-none transition focus:border-lume-primary focus:ring-4 focus:ring-black/5"
          placeholder="Search"
          type="search"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-lume-muted">Cmd K</span>
      </label>

      <nav className="grid gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pageTitle === item.label;
          return (
            <button
              key={item.label}
              className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                active
                  ? "bg-[#EFEFEC] text-lume-ink"
                  : "text-lume-muted hover:bg-white hover:text-lume-ink"
              }`}
              type="button"
              onClick={() => {
                setPageTitle(item.label);
                if (item.label === "Focus") setActiveView("list");
              }}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.label === "Today" ? (
                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-lume-muted">{todayCount}</span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <section>
        <div className="mb-3 flex items-center justify-between px-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">Projects</h2>
          <Sparkles className="h-4 w-4 text-lume-primary" />
        </div>
        <div className="grid gap-1">
          {projects.map((project) => {
            const meta = projectMeta[project as keyof typeof projectMeta];
            const Icon = meta?.icon ?? BriefcaseBusiness;
            const color = getProjectColor(project).dot;
            const count = filterTasks(tasks, project, selectedDate, "").length;
            const active = pageTitle === project;
            return (
              <button
                key={project}
                className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                  active
                    ? "bg-[#EFEFEC] text-lume-ink"
                    : "text-lume-muted hover:bg-white hover:text-lume-ink"
                }`}
                type="button"
                onClick={() => setPageTitle(project)}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{project}</span>
                <span className="text-xs text-lume-muted/70">{count}</span>
              </button>
            );
          })}
        </div>
        <QuickAddForm
          value={projectInput}
          onChange={setProjectInput}
          onSubmit={submitProject}
          placeholder="New project"
        />
      </section>

      <section>
        <h2 className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">Labels</h2>
        <div className="grid gap-1">
          {labels.map((label) => {
            const active = pageTitle === label;
            const count = filterTasks(tasks, label, selectedDate, "").length;
            return (
              <button
                key={label}
                className={`flex h-9 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                  active
                    ? "bg-[#EFEFEC] text-lume-ink"
                    : "text-lume-muted hover:bg-white hover:text-lume-ink"
                }`}
                type="button"
                onClick={() => setPageTitle(label)}
              >
                {label === "Important" ? <Star className="h-3 w-3" /> : <Tag className="h-3 w-3" />}
                <span className="flex-1 text-left">{label}</span>
                <span className="text-xs text-lume-muted/70">{count}</span>
              </button>
            );
          })}
        </div>
        <QuickAddForm
          value={labelInput}
          onChange={setLabelInput}
          onSubmit={submitLabel}
          placeholder="New label"
        />
      </section>

      <div className="mt-auto rounded-2xl border border-lume-border bg-white p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-lume-primary text-sm font-semibold text-white">
            {user?.avatarInitial ?? "J"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-lume-ink">{user?.name ?? "Jin"}</div>
            <div className="truncate text-xs text-lume-muted">{user?.email ?? "Lume Pro"}</div>
          </div>
        </div>
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-[#F6F6F4] px-3 py-2 text-xs font-medium text-lume-muted">
          <CircleDot className="h-3.5 w-3.5 text-lume-primary" />
          Calm focus mode ready
        </div>
        <button
          className="flex h-9 w-full items-center justify-center gap-2 rounded-2xl text-xs font-semibold text-lume-muted transition hover:bg-white hover:text-lume-ink"
          type="button"
          onClick={signOut}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
        <button
          className="mt-1 flex h-9 w-full items-center justify-center gap-2 rounded-2xl text-xs font-semibold text-lume-muted transition hover:bg-white hover:text-[#E06153]"
          type="button"
          onClick={handleReset}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset demo data
        </button>
      </div>
    </aside>
  );
}

function QuickAddForm({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  placeholder: string;
}) {
  return (
    <form className="mt-2 flex items-center gap-2 rounded-xl border border-lume-border bg-white p-1.5" onSubmit={onSubmit}>
      <input
        className="min-w-0 flex-1 bg-transparent px-2 text-xs font-medium text-lume-ink outline-none placeholder:text-lume-muted/70"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <button
        className="grid h-7 w-7 place-items-center rounded-lg bg-[#F4F4F2] text-lume-primary transition hover:bg-lume-primary hover:text-white"
        type="submit"
        aria-label={placeholder}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}
