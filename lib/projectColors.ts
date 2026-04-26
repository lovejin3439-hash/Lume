const palette = [
  { dot: "bg-[#111111]", chip: "bg-[#F4F4F2] text-[#111111] border-[#DADAD6]" },
  { dot: "bg-[#5D748A]", chip: "bg-[#F0F4F7] text-[#344B60] border-[#D8E0E7]" },
  { dot: "bg-[#8A7A5D]", chip: "bg-[#F7F4EF] text-[#5B4A30] border-[#E7DED0]" },
  { dot: "bg-[#7D655F]", chip: "bg-[#F7F1EF] text-[#60433D] border-[#E6D8D4]" },
  { dot: "bg-[#5D7F71]", chip: "bg-[#EFF6F3] text-[#355C4C] border-[#D8E7E1]" },
  { dot: "bg-[#8B7F6E]", chip: "bg-[#F6F3EF] text-[#5C5144] border-[#E5DDD2]" },
];

const defaultIndex: Record<string, number> = {
  Personal: 0,
  Work: 1,
  School: 2,
  Sales: 3,
};

export function getProjectColor(project: string) {
  if (project in defaultIndex) return palette[defaultIndex[project]];
  const index = Array.from(project).reduce((total, char) => total + char.charCodeAt(0), 0) % palette.length;
  return palette[index];
}
