import { toLocalDateId } from "@/lib/taskFilters";
import type { Priority } from "@/store/useLumeStore";

export type ParsedQuickAdd = {
  title: string;
  date?: string;
  time?: string;
  project?: string;
  labels: string[];
  priority?: Priority;
  deadline?: string;
};

const priorityTokens: Record<string, Priority> = {
  p1: "p1",
  p2: "p2",
  p3: "p3",
  p4: "p4",
};

export function parseQuickAdd(input: string): ParsedQuickAdd {
  const labels = new Set<string>();
  let project: string | undefined;
  let priority: Priority | undefined;
  let date: string | undefined;
  let time: string | undefined;
  let deadline: string | undefined;
  const tokens = input.split(/\s+/).filter(Boolean);
  const titleParts: string[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const lower = token.toLowerCase();

    if (token.startsWith("#") && token.length > 1) {
      project = token.slice(1);
      continue;
    }

    if (token.startsWith("@") && token.length > 1) {
      labels.add(token.slice(1));
      continue;
    }

    if (priorityTokens[lower]) {
      priority = priorityTokens[lower];
      continue;
    }

    if (lower === "today" || token === "오늘") {
      date = toLocalDateId(new Date());
      continue;
    }

    if (lower === "tomorrow" || token === "내일") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = toLocalDateId(tomorrow);
      continue;
    }

    if (token === "오후" || token === "오전") {
      const next = tokens[index + 1];
      const parsedTime = next ? parseKoreanTime(token, next) : undefined;
      if (parsedTime) {
        time = parsedTime;
        index += 1;
        continue;
      }
    }

    if (/^\d{1,2}:\d{2}$/.test(token)) {
      time = token.padStart(5, "0");
      continue;
    }

    if (lower === "!deadline" || lower === "d:" || token === "!마감") {
      const next = tokens[index + 1];
      if (next) {
        deadline = parseLooseDate(next);
        index += deadline ? 1 : 0;
        if (deadline) continue;
      }
    }

    const looseDate = parseLooseDate(token);
    if (looseDate) {
      date = looseDate;
      continue;
    }

    titleParts.push(token);
  }

  return {
    title: titleParts.join(" ").trim(),
    date,
    time,
    project,
    labels: Array.from(labels),
    priority,
    deadline,
  };
}

function parseKoreanTime(period: string, value: string) {
  const match = value.match(/^(\d{1,2})시?$/);
  if (!match) return undefined;
  let hour = Number(match[1]);
  if (period === "오후" && hour < 12) hour += 12;
  if (period === "오전" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:00`;
}

function parseLooseDate(value: string) {
  const now = new Date();
  const slash = value.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (slash) {
    const date = new Date(now.getFullYear(), Number(slash[1]) - 1, Number(slash[2]));
    return toLocalDateId(date);
  }

  const korean = value.match(/^(\d{1,2})월(\d{1,2})일$/);
  if (korean) {
    const date = new Date(now.getFullYear(), Number(korean[1]) - 1, Number(korean[2]));
    return toLocalDateId(date);
  }

  return undefined;
}
