"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlarmClock,
  CalendarDays,
  Check,
  CheckSquare,
  ChevronRight,
  MapPin,
  MoreHorizontal,
  NotebookText,
  Palette,
  Paperclip,
  Plus,
  Repeat2,
  StretchHorizontal,
  Target,
  Trash2,
  type LucideIcon,
  X,
} from "lucide-react";
import { LabelPicker } from "@/components/LabelPicker";
import {
  getDefaultKindColor,
  useLumeStore,
  type Priority,
  type Recurrence,
  type TaskKind,
  type TaskSection,
} from "@/store/useLumeStore";
import { toLocalDateId } from "@/lib/taskFilters";
import { parseQuickAdd } from "@/lib/quickAddParser";

const today = toLocalDateId(new Date());

const kindOptions: Array<{ value: TaskKind; label: string; icon: typeof CalendarDays }> = [
  { value: "event", label: "일정", icon: CalendarDays },
  { value: "task", label: "할일", icon: CheckSquare },
  { value: "block", label: "구간", icon: StretchHorizontal },
  { value: "habit", label: "습관", icon: Repeat2 },
];

const colorOptions = [
  "#FF4B12",
  "#1687E8",
  "#35A8F2",
  "#9C6ADE",
  "#00B894",
  "#64C7B7",
  "#FF7F98",
  "#F83245",
  "#62D84E",
  "#D4DB48",
  "#FFC533",
  "#FF981B",
];

const hourOptions = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));
const minuteOptions = ["00", "10", "15", "20", "30", "40", "45", "50"];

const weekdayOptions = [
  { label: "일", value: 0 },
  { label: "월", value: 1 },
  { label: "화", value: 2 },
  { label: "수", value: 3 },
  { label: "목", value: 4 },
  { label: "금", value: 5 },
  { label: "토", value: 6 },
];

type AddOnKey = "repeat" | "reminder" | "achievement" | "location" | "notes" | "attachment";

const addOnItems: Array<{ key: AddOnKey; label: string; icon: typeof Repeat2; hasSubmenu?: boolean }> = [
  { key: "repeat", label: "반복", icon: Repeat2, hasSubmenu: true },
  { key: "reminder", label: "알림", icon: AlarmClock },
  { key: "achievement", label: "달성도", icon: Target },
  { key: "location", label: "위치", icon: MapPin },
  { key: "notes", label: "노트", icon: NotebookText },
  { key: "attachment", label: "파일첨부", icon: Paperclip },
];

const repeatOptions: Array<{ value: Recurrence; label: string }> = [
  { value: "none", label: "없음" },
  { value: "daily", label: "매일" },
  { value: "weekly", label: "매주 화요일" },
  { value: "monthly", label: "매월 5일" },
  { value: "monthlyOrdinal", label: "매월 첫 번째 화요일" },
  { value: "yearly", label: "매년 5월 5일" },
  { value: "weekdays", label: "주중 매일 (월 - 금)" },
  { value: "custom", label: "사용자화" },
];

const kindCopy: Record<TaskKind, { heading: string; placeholder: string; accent: string; reminder: string }> = {
  event: {
    heading: "일정 추가",
    placeholder: "일정 제목",
    accent: "bg-[#FF4B12] text-white",
    reminder: "이벤트 당일(오전 9시)",
  },
  task: {
    heading: "할일 추가",
    placeholder: "할일 제목",
    accent: "bg-[#1687E8] text-white",
    reminder: "마감 당일",
  },
  block: {
    heading: "구간 추가",
    placeholder: "구간 제목",
    accent: "bg-[#35A8F2] text-white",
    reminder: "구간 시작 전",
  },
  habit: {
    heading: "습관 추가",
    placeholder: "습관 제목",
    accent: "bg-[#FFB84D] text-lume-ink",
    reminder: "반복 시간",
  },
};

type DetailValues = {
  recurrence: Recurrence;
  reminder: string;
  achievement: string;
  location: string;
  notes: string;
  attachmentName: string;
};

function getRepeatLabel(value: Recurrence) {
  const option = repeatOptions.find((item) => item.value === value);
  return option?.label ?? "없음";
}

function getReminderLabel(value: string) {
  if (value === "event-time") return "이벤트 당시";
  if (value === "before-10") return "10분 전";
  if (value === "before-30") return "30분 전";
  if (value === "before-60") return "1시간 전";
  return "이벤트 당일";
}

function getAddOnHint(key: AddOnKey, values: DetailValues) {
  if (key === "repeat") return values.recurrence === "none" ? "반복 없음" : getRepeatLabel(values.recurrence);
  if (key === "reminder") return values.reminder ? getReminderLabel(values.reminder) : "시간 알림 설정";
  if (key === "achievement") return values.achievement ? `${values.achievement}% 목표` : "진행률 기록";
  if (key === "location") return values.location || "장소 또는 링크";
  if (key === "notes") return values.notes ? "메모 있음" : "메모 추가";
  return values.attachmentName || "파일명 또는 링크";
}

function buildActiveDetails(values: DetailValues): Array<{ key: AddOnKey; label: string }> {
  return [
    ...(values.recurrence !== "none" ? [{ key: "repeat" as AddOnKey, label: getRepeatLabel(values.recurrence) }] : []),
    ...(values.reminder ? [{ key: "reminder" as AddOnKey, label: getReminderLabel(values.reminder) }] : []),
    ...(values.achievement ? [{ key: "achievement" as AddOnKey, label: `${values.achievement}%` }] : []),
    ...(values.location ? [{ key: "location" as AddOnKey, label: values.location }] : []),
    ...(values.notes ? [{ key: "notes" as AddOnKey, label: "노트" }] : []),
    ...(values.attachmentName ? [{ key: "attachment" as AddOnKey, label: values.attachmentName }] : []),
  ];
}

function splitTime(value: string) {
  const [hour = "09", minute = "00"] = value.split(":");
  return { hour: hour.padStart(2, "0"), minute: minute.padStart(2, "0") };
}

function joinTime(hour: string, minute: string) {
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

function suggestEndTime(value: string) {
  const { hour, minute } = splitTime(value);
  const nextHour = Math.min(23, Number(hour) + 1);
  return joinTime(String(nextHour), minute);
}

export function AddTaskModal({
  open,
  initialKind = "task",
  editingTaskId,
  onClose,
}: {
  open: boolean;
  initialKind?: TaskKind;
  editingTaskId?: string;
  onClose: () => void;
}) {
  const addTask = useLumeStore((state) => state.addTask);
  const updateTask = useLumeStore((state) => state.updateTask);
  const deleteTask = useLumeStore((state) => state.deleteTask);
  const tasks = useLumeStore((state) => state.tasks);
  const projects = useLumeStore((state) => state.projects);
  const availableLabels = useLumeStore((state) => state.labels);
  const selectedDate = useLumeStore((state) => state.selectedDate);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<TaskKind>(initialKind);
  const [date, setDate] = useState(selectedDate || today);
  const [time, setTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [project, setProject] = useState("Work");
  const [priority, setPriority] = useState<Priority>("p4");
  const [labels, setLabels] = useState<string[]>(["Important"]);
  const [deadline, setDeadline] = useState("");
  const [hasTime, setHasTime] = useState(true);
  const [section, setSection] = useState<TaskSection>("To Do");
  const [recurrence, setRecurrence] = useState<Recurrence>("none");
  const [notes, setNotes] = useState("");
  const [reminder, setReminder] = useState("");
  const [achievement, setAchievement] = useState("");
  const [location, setLocation] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [color, setColor] = useState(getDefaultKindColor(initialKind));
  const [habitDays, setHabitDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [smartInput, setSmartInput] = useState("");
  const [showSmart, setShowSmart] = useState(false);
  const [showAddOnMenu, setShowAddOnMenu] = useState(false);
  const [showRepeatMenu, setShowRepeatMenu] = useState(false);
  const [visibleAddOns, setVisibleAddOns] = useState<AddOnKey[]>([]);
  const editingTask = tasks.find((task) => task.id === editingTaskId);
  const copy = kindCopy[kind];
  const isEditing = Boolean(editingTask);
  const activeDetails = buildActiveDetails({
    recurrence,
    reminder,
    achievement,
    location,
    notes,
    attachmentName,
  });

  useEffect(() => {
    if (open) {
      if (editingTask) {
        setTitle(editingTask.title);
        setKind(editingTask.kind ?? "task");
        setDate(editingTask.date);
        setTime(editingTask.time);
        setEndTime(editingTask.endTime ?? suggestEndTime(editingTask.time));
        setProject(editingTask.project);
        setPriority(editingTask.priority);
        setLabels(editingTask.labels);
        setColor(editingTask.color ?? getDefaultKindColor(editingTask.kind ?? "task"));
        setHabitDays(editingTask.habitDays ?? [1, 2, 3, 4, 5]);
        setDeadline(editingTask.deadline ?? "");
        setHasTime(editingTask.time !== "00:00");
        setSection(editingTask.section ?? "To Do");
        setRecurrence(editingTask.recurrence ?? "none");
        setNotes(editingTask.notes ?? "");
        setReminder(editingTask.reminder ?? "");
        setAchievement(editingTask.achievement ?? "");
        setLocation(editingTask.location ?? "");
        setAttachmentName(editingTask.attachmentName ?? "");
        setVisibleAddOns([
          ...(editingTask.recurrence && editingTask.recurrence !== "none" ? (["repeat"] as AddOnKey[]) : []),
          ...(editingTask.reminder ? (["reminder"] as AddOnKey[]) : []),
          ...(editingTask.achievement ? (["achievement"] as AddOnKey[]) : []),
          ...(editingTask.location ? (["location"] as AddOnKey[]) : []),
          ...(editingTask.notes ? (["notes"] as AddOnKey[]) : []),
          ...(editingTask.attachmentName ? (["attachment"] as AddOnKey[]) : []),
        ]);
      } else {
        setTitle("");
        setDate(selectedDate || today);
        setKind(initialKind);
        setColor(getDefaultKindColor(initialKind));
        setHabitDays([1, 2, 3, 4, 5]);
        setTime("09:00");
        setEndTime("10:00");
        setProject("Work");
        setPriority("p4");
        setLabels(["Important"]);
        setDeadline("");
        setHasTime(true);
        setSection("To Do");
        setRecurrence("none");
        setNotes("");
        setReminder("");
        setAchievement("");
        setLocation("");
        setAttachmentName("");
        setVisibleAddOns([]);
      }
      setShowSmart(false);
      setShowAddOnMenu(false);
      setShowRepeatMenu(false);
      setSmartInput("");
    }
  }, [open, selectedDate, initialKind, editingTask]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      kind,
      date,
      time: hasTime ? time : "00:00",
      endTime: hasTime ? endTime : undefined,
      project,
      priority,
      labels,
      color,
      habitDays: kind === "habit" ? habitDays : undefined,
      deadline: deadline || undefined,
      section,
      recurrence,
      notes,
      reminder: reminder || undefined,
      achievement: achievement || undefined,
      location: location || undefined,
      attachmentName: attachmentName || undefined,
    };
    if (editingTask) {
      updateTask(editingTask.id, payload);
    } else {
      addTask(payload);
    }
    setTitle("");
    setKind(initialKind);
    setColor(getDefaultKindColor(initialKind));
    setHabitDays([1, 2, 3, 4, 5]);
    setNotes("");
    setDeadline("");
    setSection("To Do");
    setRecurrence("none");
    setReminder("");
    setAchievement("");
    setLocation("");
    setAttachmentName("");
    setVisibleAddOns([]);
    setSmartInput("");
    setDate(selectedDate || today);
    setTime("09:00");
    setEndTime("10:00");
    onClose();
  }

  function removeEditingTask() {
    if (!editingTask) return;
    deleteTask(editingTask.id);
    onClose();
  }

  function applySmartInput() {
    const parsed = parseQuickAdd(smartInput);
    if (parsed.title) setTitle(parsed.title);
    if (parsed.date) setDate(parsed.date);
    if (parsed.time) setTime(parsed.time);
    if (parsed.time) setEndTime(suggestEndTime(parsed.time));
    if (parsed.project) setProject(parsed.project);
    if (parsed.priority) setPriority(parsed.priority);
    if (parsed.deadline) setDeadline(parsed.deadline);
    if (parsed.labels.length) setLabels(Array.from(new Set([...labels, ...parsed.labels])));
  }

  function selectKind(nextKind: TaskKind) {
    setKind(nextKind);
    setColor((current) => (current === getDefaultKindColor(kind) ? getDefaultKindColor(nextKind) : current));
    if (nextKind === "habit" && recurrence === "none") setRecurrence("daily");
  }

  function toggleHabitDay(day: number) {
    setHabitDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort((a, b) => a - b),
    );
  }

  function revealAddOn(key: AddOnKey) {
    if (key === "repeat") {
      setVisibleAddOns((current) => (current.includes("repeat") ? current : [...current, "repeat"]));
      setShowRepeatMenu(true);
      return;
    }
    setVisibleAddOns((current) => (current.includes(key) ? current : [...current, key]));
    setShowAddOnMenu(false);
    setShowRepeatMenu(false);
  }

  function selectRepeat(value: Recurrence) {
    setRecurrence(value);
    setVisibleAddOns((current) => (current.includes("repeat") ? current : [...current, "repeat"]));
    setShowAddOnMenu(false);
    setShowRepeatMenu(false);
  }

  function removeAddOn(key: AddOnKey) {
    setVisibleAddOns((current) => current.filter((item) => item !== key));
    if (key === "repeat") setRecurrence("none");
    if (key === "reminder") setReminder("");
    if (key === "achievement") setAchievement("");
    if (key === "location") setLocation("");
    if (key === "notes") setNotes("");
    if (key === "attachment") setAttachmentName("");
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
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">
                  {isEditing ? "Edit Item" : "New Item"}
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-lume-ink">
                  {isEditing ? copy.heading.replace("추가", "수정") : copy.heading}
                </h2>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      className="grid h-10 w-10 place-items-center rounded-xl border border-lume-border text-lume-muted transition hover:border-[#FFD8D1] hover:bg-[#FFF5F3] hover:text-[#E06153]"
                      type="button"
                      onClick={removeEditingTask}
                      aria-label="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      className="grid h-10 w-10 place-items-center rounded-xl border border-lume-border text-lume-muted transition hover:bg-[#F4F4F2] hover:text-lume-ink"
                      type="button"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </>
                ) : null}
              <button
                className="grid h-10 w-10 place-items-center rounded-xl border border-lume-border text-lume-muted transition hover:bg-[#F4F4F2] hover:text-lume-ink"
                type="button"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
              </div>
            </div>

            <div className="grid gap-4 overflow-y-auto px-6 py-5">
              <input
                className="h-16 w-full border-0 bg-transparent text-3xl font-semibold tracking-[-0.04em] text-lume-ink outline-none placeholder:text-lume-muted/45"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={copy.placeholder}
                required
              />
              <div className="grid grid-cols-4 gap-2">
                {kindOptions.map((option) => {
                  const Icon = option.icon;
                  const active = kind === option.value;
                  return (
                    <button
                      key={option.value}
                      className={`grid place-items-center gap-1 rounded-xl border px-2 py-3 text-xs font-semibold transition ${
                        active
                          ? `border-transparent ${kindCopy[option.value].accent}`
                          : "border-lume-border bg-[#FAFAFA] text-lume-muted hover:border-lume-primary/30 hover:text-lume-primary"
                      }`}
                      type="button"
                      onClick={() => selectKind(option.value)}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <div className="rounded-2xl border border-lume-border bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-lume-ink">
                    <Palette className="h-4 w-4 text-lume-muted" />
                    컬러
                  </div>
                  <span className="rounded-full border border-lume-border px-3 py-1 text-xs font-semibold text-lume-muted">
                    {kindOptions.find((option) => option.value === kind)?.label}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
                  {colorOptions.map((option) => {
                    const active = color.toLowerCase() === option.toLowerCase();
                    return (
                      <button
                        key={option}
                        className={`grid h-9 w-9 place-items-center rounded-xl border transition hover:scale-105 ${
                          active ? "border-lume-ink bg-white shadow-sm" : "border-transparent"
                        }`}
                        type="button"
                        onClick={() => setColor(option)}
                        aria-label={`Select ${option}`}
                      >
                        <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ backgroundColor: option }}>
                          {active ? <Check className="h-4 w-4 text-white drop-shadow" /> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {kind === "habit" ? (
                <div className="rounded-2xl border border-lume-border bg-[#FAFAFA] p-4">
                  <div className="mb-3 text-sm font-semibold text-lume-ink">요일</div>
                  <div className="flex flex-wrap gap-2">
                    {weekdayOptions.map((day) => {
                      const active = habitDays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          className={`h-9 w-9 rounded-full text-sm font-semibold transition ${
                            active ? "bg-lume-primary text-white shadow-sm" : "bg-white text-lume-muted ring-1 ring-lume-border"
                          }`}
                          type="button"
                          onClick={() => toggleHabitDay(day.value)}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-lume-ink">
                <span>{date}</span>
                <span className="text-lume-muted">-</span>
                <span>{date}</span>
                {hasTime ? (
                  <span className="rounded-full bg-[#F4F4F2] px-2 py-1 text-xs text-lume-muted">
                    {time} - {endTime}
                  </span>
                ) : null}
              </div>
              <button
                className="flex items-center gap-3 border-b border-lume-border pb-4 text-left text-sm font-medium text-lume-ink"
                type="button"
                onClick={() => setHasTime(!hasTime)}
              >
                <span
                  className={`grid h-5 w-5 place-items-center rounded border ${
                    hasTime ? "border-[#5CB4FF] bg-[#E9F5FF] text-[#1687E8]" : "border-[#7EC3FF] text-transparent"
                  }`}
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                </span>
                시간 설정
              </button>
              <div className="rounded-2xl border border-lume-border bg-[#FAFAFA] p-3">
                <button
                  className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted"
                  type="button"
                  onClick={() => setShowSmart(!showSmart)}
                >
                  Smart Quick Add
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] tracking-normal">
                    {showSmart ? "Hide" : "Optional"}
                  </span>
                </button>
                {showSmart ? (
                  <div className="mt-3 flex gap-2">
                    <input
                      className="h-11 min-w-0 flex-1 rounded-xl border border-lume-border bg-white px-4 text-sm font-medium outline-none transition focus:border-lume-primary focus:ring-4 focus:ring-black/5"
                      value={smartInput}
                      onChange={(event) => setSmartInput(event.target.value)}
                      placeholder="#Work @Important p1 tomorrow 14:00"
                    />
                    <button
                      className="rounded-xl bg-lume-primary px-4 text-sm font-semibold text-white transition hover:bg-black/80"
                      type="button"
                      onClick={applySmartInput}
                    >
                      Apply
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Date">
                  <input inputMode="numeric" placeholder="YYYY-MM-DD" value={date} onChange={(event) => setDate(event.target.value)} />
                </Field>
                <TimeRangeField
                  disabled={!hasTime}
                  endTime={endTime}
                  startTime={time}
                  onEndChange={setEndTime}
                  onStartChange={(nextTime) => {
                    setTime(nextTime);
                    if (!endTime || endTime <= nextTime) setEndTime(suggestEndTime(nextTime));
                  }}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
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
              <div className="grid gap-4 md:grid-cols-2">
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
                    <option value="monthlyOrdinal">Monthly ordinal</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="custom">Custom</option>
                  </select>
                </Field>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-semibold text-lume-ink">Labels</div>
                <LabelPicker labels={availableLabels} selected={labels} onChange={setLabels} />
              </div>
              {activeDetails.length ? (
                <div className="flex flex-wrap gap-2 rounded-2xl border border-lume-border bg-white p-3">
                  {activeDetails.map((detail) => {
                    const item = addOnItems.find((option) => option.key === detail.key);
                    const Icon = item?.icon ?? Plus;
                    return (
                      <button
                        key={detail.key}
                        className="inline-flex max-w-full items-center gap-2 rounded-full border border-lume-border bg-[#FAFAFA] px-3 py-1.5 text-xs font-semibold text-lume-ink transition hover:border-[#FFD8D1] hover:bg-[#FFF5F3]"
                        type="button"
                        onClick={() => removeAddOn(detail.key)}
                        title="클릭하면 항목이 제거됩니다"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 text-lume-muted" />
                        <span className="truncate">{detail.label}</span>
                        <X className="h-3 w-3 shrink-0 text-lume-muted" />
                      </button>
                    );
                  })}
                </div>
              ) : null}
              {visibleAddOns.length ? (
                <div className="grid gap-4 rounded-2xl border border-lume-border bg-[#FAFAFA] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">추가 항목</div>
                      <div className="mt-1 text-sm font-semibold text-lume-ink">세부 조건</div>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-lume-muted">
                      {visibleAddOns.length}
                    </span>
                  </div>
                  {visibleAddOns.includes("repeat") ? (
                    <DetailCard icon={Repeat2} label="반복" value={getRepeatLabel(recurrence)} onRemove={() => removeAddOn("repeat")}>
                      <div className="grid grid-cols-2 gap-2">
                        {repeatOptions.map((option, index) => (
                          <button
                            key={`${option.label}-${index}`}
                            className={`h-10 rounded-xl border px-3 text-left text-xs font-semibold transition ${
                              recurrence === option.value
                                ? "border-lume-primary/30 bg-white text-lume-primary shadow-sm"
                                : "border-lume-border bg-white text-lume-muted hover:text-lume-primary"
                            }`}
                            type="button"
                            onClick={() => setRecurrence(option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </DetailCard>
                  ) : null}
                  {visibleAddOns.includes("reminder") ? (
                    <DetailCard icon={AlarmClock} label="알림" value={getReminderLabel(reminder)} onRemove={() => removeAddOn("reminder")}>
                    <AddOnField label="알림">
                      <select value={reminder} onChange={(event) => setReminder(event.target.value)}>
                        <option value="">이벤트 당일</option>
                        <option value="event-time">이벤트 당시</option>
                        <option value="before-10">10분 전</option>
                        <option value="before-30">30분 전</option>
                        <option value="before-60">1시간 전</option>
                      </select>
                    </AddOnField>
                    </DetailCard>
                  ) : null}
                  {visibleAddOns.includes("achievement") ? (
                    <DetailCard icon={Target} label="달성도" value={achievement ? `${achievement}%` : "체크 완료"} onRemove={() => removeAddOn("achievement")}>
                    <AddOnField label="달성도">
                      <select value={achievement} onChange={(event) => setAchievement(event.target.value)}>
                        <option value="">체크 완료</option>
                        <option value="25">25%</option>
                        <option value="50">50%</option>
                        <option value="75">75%</option>
                        <option value="100">100%</option>
                      </select>
                    </AddOnField>
                    </DetailCard>
                  ) : null}
                  {visibleAddOns.includes("location") ? (
                    <DetailCard icon={MapPin} label="위치" value={location || "장소 미입력"} onRemove={() => removeAddOn("location")}>
                    <AddOnField label="위치">
                      <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="장소 또는 링크" />
                    </AddOnField>
                    </DetailCard>
                  ) : null}
                  {visibleAddOns.includes("notes") ? (
                    <DetailCard icon={NotebookText} label="노트" value={notes ? "메모 있음" : "비어 있음"} onRemove={() => removeAddOn("notes")}>
                    <AddOnField label="노트">
                      <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="메모, 준비물, 참고 링크" />
                    </AddOnField>
                    </DetailCard>
                  ) : null}
                  {visibleAddOns.includes("attachment") ? (
                    <DetailCard icon={Paperclip} label="파일첨부" value={attachmentName || "파일 미지정"} onRemove={() => removeAddOn("attachment")}>
                    <AddOnField label="파일첨부">
                      <input
                        value={attachmentName}
                        onChange={(event) => setAttachmentName(event.target.value)}
                        placeholder="파일명 또는 첨부 링크"
                      />
                    </AddOnField>
                    </DetailCard>
                  ) : null}
                </div>
              ) : null}
              <div className="grid gap-3 border-t border-lume-border pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">Details</div>
                    <div className="text-sm font-semibold text-lume-ink">필요한 항목만 추가하세요</div>
                  </div>
                  <span className="rounded-full bg-[#F4F4F2] px-2.5 py-1 text-xs font-semibold text-lume-muted">
                    {activeDetails.length ? `${activeDetails.length} active` : "optional"}
                  </span>
                </div>
                <div className="relative">
                  <button
                    className={`inline-flex w-fit items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      showAddOnMenu
                        ? "border-lume-primary/30 bg-[#F4F4F2] text-lume-primary"
                        : "border-lume-border bg-white text-[#1687E8] hover:border-lume-primary/30"
                    }`}
                    type="button"
                    onClick={() => {
                      setShowAddOnMenu((current) => !current);
                      setShowRepeatMenu(false);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    항목 추가
                  </button>
                  {showAddOnMenu ? (
                    <div className="mt-3 rounded-2xl border border-lume-border bg-white p-3 shadow-sm">
                      <div className="grid gap-2 sm:grid-cols-2">
                        {addOnItems.map((item) => {
                          const Icon = item.icon;
                          const active = item.key === "repeat" ? recurrence !== "none" : visibleAddOns.includes(item.key);
                          return (
                            <button
                              key={item.key}
                              className={`flex min-h-14 items-center gap-3 rounded-xl border px-3 text-left transition ${
                                active
                                  ? "border-lume-primary/30 bg-[#F4F4F2] text-lume-primary"
                                  : "border-lume-border bg-white text-lume-ink hover:border-lume-primary/30 hover:bg-[#FAFAFA]"
                              }`}
                              type="button"
                              onClick={() => revealAddOn(item.key)}
                            >
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FAFAFA]">
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold">{item.label}</span>
                                <span className="block truncate text-[11px] font-medium text-lume-muted">
                                  {getAddOnHint(item.key, { recurrence, reminder, achievement, location, notes, attachmentName })}
                                </span>
                              </span>
                              {item.hasSubmenu ? <ChevronRight className="h-4 w-4 shrink-0 text-lume-muted" /> : null}
                            </button>
                          );
                        })}
                      </div>
                      {showRepeatMenu ? (
                        <div className="mt-3 rounded-2xl border border-lume-border bg-[#FAFAFA] p-3">
                          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-lume-muted">반복 옵션</div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {repeatOptions.map((option, index) => (
                              <button
                                key={`${option.label}-${index}`}
                                className={`flex min-h-10 items-center justify-between rounded-xl border px-3 text-left text-sm font-semibold transition ${
                                  recurrence === option.value
                                    ? "border-lume-primary/30 bg-white text-lume-primary shadow-sm"
                                    : "border-lume-border bg-white text-lume-ink hover:text-lume-primary"
                                }`}
                                type="button"
                                onClick={() => selectRepeat(option.value)}
                              >
                                {option.label}
                                {recurrence === option.value ? <Check className="h-4 w-4" /> : null}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
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
                {isEditing ? "Save changes" : "Save task"}
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

function TimeRangeField({
  disabled,
  startTime,
  endTime,
  onStartChange,
  onEndChange,
}: {
  disabled: boolean;
  startTime: string;
  endTime: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
}) {
  const start = splitTime(startTime);
  const end = splitTime(endTime);

  return (
    <div className="grid gap-2 text-sm font-semibold text-lume-ink">
      Time
      <div className={`rounded-xl border border-lume-border bg-[#FAFAFA] p-3 ${disabled ? "opacity-45" : ""}`}>
        <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-end">
          <TimeSelectGroup
            disabled={disabled}
            hour={start.hour}
            label="Start"
            minute={start.minute}
            onChange={(hour, minute) => onStartChange(joinTime(hour, minute))}
          />
          <span className="hidden pb-3 text-center text-sm font-semibold text-lume-muted xl:block">-</span>
          <TimeSelectGroup
            disabled={disabled}
            hour={end.hour}
            label="End"
            minute={end.minute}
            onChange={(hour, minute) => onEndChange(joinTime(hour, minute))}
          />
        </div>
      </div>
    </div>
  );
}

function TimeSelectGroup({
  disabled,
  hour,
  label,
  minute,
  onChange,
}: {
  disabled: boolean;
  hour: string;
  label: string;
  minute: string;
  onChange: (hour: string, minute: string) => void;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lume-muted">{label}</span>
      <div className="grid min-w-0 grid-cols-2 gap-2">
        <select
          className="h-10 w-full min-w-0 rounded-lg border border-lume-border bg-white px-2 text-center text-sm font-semibold tabular-nums text-lume-ink outline-none focus:border-lume-primary"
          disabled={disabled}
          value={hour}
          onChange={(event) => onChange(event.target.value, minute)}
        >
          {hourOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          className="h-10 w-full min-w-0 rounded-lg border border-lume-border bg-white px-2 text-center text-sm font-semibold tabular-nums text-lume-ink outline-none focus:border-lume-primary"
          disabled={disabled}
          value={minute}
          onChange={(event) => onChange(hour, event.target.value)}
        >
          {minuteOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
  children,
  onRemove,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <section className="rounded-2xl border border-lume-border bg-white p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FAFAFA] text-lume-muted">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-lume-ink">{label}</div>
            <div className="truncate text-xs font-medium text-lume-muted">{value}</div>
          </div>
        </div>
        <button
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-lume-muted transition hover:bg-[#FFF5F3] hover:text-[#E06153]"
          type="button"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </section>
  );
}

function AddOnField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-lume-muted">
      {label}
      <div className="[&_input]:h-11 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-lume-border [&_input]:bg-white [&_input]:px-4 [&_input]:text-sm [&_input]:font-medium [&_input]:normal-case [&_input]:tracking-normal [&_input]:text-lume-ink [&_input]:outline-none [&_input]:transition [&_input:focus]:border-lume-primary [&_input:focus]:ring-4 [&_input:focus]:ring-black/5 [&_select]:h-11 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-lume-border [&_select]:bg-white [&_select]:px-4 [&_select]:text-sm [&_select]:font-medium [&_select]:normal-case [&_select]:tracking-normal [&_select]:text-lume-ink [&_select]:outline-none [&_select]:transition [&_select:focus]:border-lume-primary [&_select:focus]:ring-4 [&_select:focus]:ring-black/5 [&_textarea]:min-h-24 [&_textarea]:w-full [&_textarea]:resize-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-lume-border [&_textarea]:bg-white [&_textarea]:p-4 [&_textarea]:text-sm [&_textarea]:font-medium [&_textarea]:normal-case [&_textarea]:tracking-normal [&_textarea]:text-lume-ink [&_textarea]:outline-none [&_textarea]:transition [&_textarea:focus]:border-lume-primary [&_textarea:focus]:ring-4 [&_textarea:focus]:ring-black/5">
        {children}
      </div>
    </label>
  );
}
