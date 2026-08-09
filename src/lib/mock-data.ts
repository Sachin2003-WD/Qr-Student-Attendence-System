export type Role = "student" | "faculty" | "admin";

export const departments: string[] = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration"
];

export const mentors: any[] = [];
export const students: any[] = [];

export type SessionStatus = "upcoming" | "pending" | "completed" | "cancelled";
export interface Session {
  id: string;
  student: string;
  mentor: string;
  topic: string;
  description: string;
  date: string;
  time: string;
  status: SessionStatus;
  notes?: string;
}

export const sessions: Session[] = [];
export const feedback: any[] = [];
export const notifications: any[] = [];
export const monthlySessions: any[] = [];
export const deptDistribution: any[] = [];
export const ratingTrend: any[] = [];

export function mentorName(id: string) {
  return "—";
}

export function studentName(id: string) {
  return "—";
}
