"use client";

import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { GoogleIcon } from "@/components/GoogleIcon";
import { Logo } from "@/components/Logo";
import { useLumeStore } from "@/store/useLumeStore";

const previewTasks = [
  { time: "09:00", title: "Team meeting", done: true },
  { time: "10:30", title: "Review client quotation", done: false },
  { time: "13:00", title: "Business class assignment", done: false },
];

export function LoginScreen() {
  const signInWithGoogle = useLumeStore((state) => state.signInWithGoogle);

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-lume-bg p-3 text-lume-ink lg:grid-cols-[1fr_480px] lg:p-4">
      <div className="pointer-events-none absolute left-[18%] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-black/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-14rem] right-[16%] h-[32rem] w-[32rem] rounded-full bg-black/[0.025] blur-3xl" />

      <section className="relative flex min-h-[calc(100vh-32px)] flex-col justify-between rounded-[14px] border border-lume-border bg-white p-6 shadow-glow lg:p-10">
        <Logo />

        <div className="max-w-3xl py-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-lume-border bg-white/80 px-4 py-2 text-sm font-medium text-lume-muted"
          >
            <Sparkles className="h-4 w-4 text-lume-primary" />
            Calm planning for bright workdays
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-lume-ink sm:text-6xl xl:text-7xl"
          >
            Plan your day,
            <span className="block text-lume-ink">brighter.</span>
          </motion.h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-lume-muted">
            Lume brings tasks, time blocks, and calendar flow into one focused dashboard.
            Sign in to keep your workspace calm, synced, and ready.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-lume-muted sm:grid-cols-3">
          <Feature icon={CalendarDays} label="Calendar flow" />
          <Feature icon={Clock3} label="Time view" />
          <Feature icon={ShieldCheck} label="Local-first MVP" />
        </div>
      </section>

      <aside className="relative mt-4 flex items-center justify-center rounded-[14px] border border-lume-border bg-[#FCFCFB] p-6 shadow-soft lg:ml-4 lg:mt-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-lume-primary shadow-glow">
              <CalendarDays className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-lume-ink">Welcome to Lume</h2>
            <p className="mt-2 text-sm leading-6 text-lume-muted">Continue with Google to open your productivity dashboard.</p>
          </div>

          <button
            className="flex h-13 w-full items-center justify-center gap-3 rounded-xl border border-lume-border bg-white px-4 py-3 text-sm font-semibold text-lume-ink shadow-sm transition hover:-translate-y-0.5 hover:border-lume-primary/30 hover:shadow-soft"
            type="button"
            onClick={signInWithGoogle}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-lume-muted">
            Demo mode uses localStorage. Real Google OAuth can be connected later with Auth.js or Firebase.
          </p>

          <div className="mt-8 rounded-2xl border border-lume-border bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">Today</p>
                <h3 className="text-base font-semibold text-lume-ink">In focus</h3>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-lume-muted">82%</span>
            </div>
            <div className="grid gap-2">
              {previewTasks.map((task) => (
                <div key={task.title} className="flex items-center gap-3 rounded-xl border border-lume-border bg-[#FAFAFA] px-3 py-2.5">
                  <CheckCircle2 className={`h-4 w-4 ${task.done ? "text-lume-primary" : "text-lume-muted/40"}`} />
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-sm font-semibold ${task.done ? "text-lume-muted line-through" : "text-lume-ink"}`}>
                      {task.title}
                    </div>
                    <div className="text-xs text-lume-muted">{task.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </aside>
    </main>
  );
}

function Feature({
  icon: Icon,
  label,
}: {
  icon: typeof CalendarDays;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-lume-border bg-white px-4 py-3">
      <Icon className="h-4 w-4 text-lume-primary" />
      <span className="font-medium">{label}</span>
    </div>
  );
}
