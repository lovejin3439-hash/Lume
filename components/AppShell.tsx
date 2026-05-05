"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AddTaskModal } from "@/components/AddTaskModal";
import { BoardView } from "@/components/BoardView";
import { CalendarView } from "@/components/CalendarView";
import { CommandPalette } from "@/components/CommandPalette";
import { FocusView } from "@/components/FocusView";
import { Header } from "@/components/Header";
import { LoginScreen } from "@/components/LoginScreen";
import { Sidebar } from "@/components/Sidebar";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { TaskList } from "@/components/TaskList";
import { TimeView } from "@/components/TimeView";
import { ToastStack } from "@/components/ToastStack";
import { UpcomingView } from "@/components/UpcomingView";
import { WeekView } from "@/components/WeekView";
import { useLumeStore, type TaskKind } from "@/store/useLumeStore";

export function AppShell() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftKind, setDraftKind] = useState<TaskKind>("task");
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const user = useLumeStore((state) => state.user);
  const activeView = useLumeStore((state) => state.activeView);
  const pageTitle = useLumeStore((state) => state.pageTitle);
  const setActiveView = useLumeStore((state) => state.setActiveView);
  const selectTask = useLumeStore((state) => state.selectTask);
  const tasks = useLumeStore((state) => state.tasks);

  function openAddTask(kind: TaskKind = "task") {
    setDraftKind(kind);
    setEditingTaskId(undefined);
    setIsModalOpen(true);
  }

  function openEditTask(taskId: string) {
    setEditingTaskId(taskId);
    setIsModalOpen(true);
  }

  const content = useMemo(() => {
    if (pageTitle === "Upcoming" && activeView === "list") {
      return <UpcomingView onAddTask={() => openAddTask()} />;
    }
    if (pageTitle === "Focus" && activeView === "list") return <FocusView />;
    if (activeView === "board") return <BoardView onAddTask={() => openAddTask()} />;
    if (activeView === "time") return <TimeView />;
    if (activeView === "week") return <WeekView onAddTask={() => openAddTask()} />;
    if (activeView === "calendar") return <CalendarView onAddTask={openAddTask} onEditTask={openEditTask} />;
    return <TaskList />;
  }, [activeView, pageTitle, tasks]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT";

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandOpen(true);
        return;
      }

      if (event.key === "Escape") {
        setIsCommandOpen(false);
        selectTask(undefined);
        return;
      }

      if (isTyping) return;

      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        openAddTask();
      }
      if (event.key === "1") setActiveView("list");
      if (event.key === "2") setActiveView("time");
      if (event.key === "3") setActiveView("week");
      if (event.key === "4") setActiveView("calendar");
      if (event.key === "5") setActiveView("board");
      if (event.key === "/") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>("[data-lume-search]")?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectTask, setActiveView]);

  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen overflow-hidden p-2 text-lume-ink sm:p-3 lg:p-4">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1680px] grid-cols-1 overflow-hidden rounded-[14px] border border-lume-border bg-white shadow-glow lg:grid-cols-[248px_minmax(0,1fr)_320px]">
        <Sidebar />
        <main className="relative min-w-0 border-x border-lume-border bg-white">
          <div className="pointer-events-none absolute left-10 top-0 h-48 w-96 rounded-full bg-black/[0.025] blur-3xl" />
          <Header onAddTask={() => openAddTask()} />
          <section className="relative px-4 pb-5 sm:px-6 lg:px-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </section>
        </main>
        <TaskDetailPanel />
      </div>
      <AddTaskModal
        open={isModalOpen}
        initialKind={draftKind}
        editingTaskId={editingTaskId}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTaskId(undefined);
        }}
      />
      <CommandPalette
        open={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onAddTask={() => openAddTask()}
      />
      <ToastStack />
    </div>
  );
}
