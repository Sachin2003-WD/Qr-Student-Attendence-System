export type Role = "student" | "mentor" | "admin";

export const departments = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Business",
];

export const mentors = [
  { id: "m1", name: "Dr. Priya Sharma", email: "priya@college.edu", department: "Computer Science", rating: 4.9, students: 12, capacity: 15, skills: ["AI/ML", "Data Structures", "Python"], avatar: "PS" },
  { id: "m2", name: "Prof. Arjun Rao", email: "arjun@college.edu", department: "Information Technology", rating: 4.7, students: 10, capacity: 15, skills: ["Cloud", "DevOps", "Java"], avatar: "AR" },
  { id: "m3", name: "Dr. Neha Kapoor", email: "neha@college.edu", department: "Electronics", rating: 4.8, students: 8, capacity: 12, skills: ["VLSI", "Embedded"], avatar: "NK" },
  { id: "m4", name: "Prof. Karthik Iyer", email: "karthik@college.edu", department: "Computer Science", rating: 4.6, students: 14, capacity: 15, skills: ["Web", "React", "Node.js"], avatar: "KI" },
  { id: "m5", name: "Dr. Meera Nair", email: "meera@college.edu", department: "Business", rating: 4.9, students: 9, capacity: 12, skills: ["Strategy", "Analytics"], avatar: "MN" },
];

export const students = [
  { id: "s1", name: "Rohan Verma", email: "rohan@college.edu", department: "Computer Science", semester: 5, mentor: "m1", progress: 82, skills: ["Python", "ML"], interests: ["AI", "Startups"], avatar: "RV" },
  { id: "s2", name: "Ananya Singh", email: "ananya@college.edu", department: "Information Technology", semester: 6, mentor: "m2", progress: 74, skills: ["AWS", "Docker"], interests: ["Cloud"], avatar: "AS" },
  { id: "s3", name: "Vikram Patel", email: "vikram@college.edu", department: "Computer Science", semester: 4, mentor: "m4", progress: 66, skills: ["React"], interests: ["Web"], avatar: "VP" },
  { id: "s4", name: "Sneha Reddy", email: "sneha@college.edu", department: "Electronics", semester: 7, mentor: "m3", progress: 91, skills: ["VLSI"], interests: ["Chip Design"], avatar: "SR" },
  { id: "s5", name: "Aditya Menon", email: "aditya@college.edu", department: "Business", semester: 3, mentor: "m5", progress: 58, skills: ["Excel"], interests: ["Finance"], avatar: "AM" },
  { id: "s6", name: "Ishita Joshi", email: "ishita@college.edu", department: "Computer Science", semester: 5, mentor: "m1", progress: 88, skills: ["Java", "Spring"], interests: ["Backend"], avatar: "IJ" },
];

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

const today = new Date();
const iso = (d: number) => {
  const dt = new Date(today);
  dt.setDate(today.getDate() + d);
  return dt.toISOString().slice(0, 10);
};

export const sessions: Session[] = [
  { id: "se1", student: "s1", mentor: "m1", topic: "ML Project Review", description: "Discuss dataset selection and baseline model.", date: iso(0), time: "10:00", status: "upcoming" },
  { id: "se2", student: "s2", mentor: "m2", topic: "AWS Certification Path", description: "Plan for Solutions Architect exam.", date: iso(0), time: "14:30", status: "upcoming" },
  { id: "se3", student: "s3", mentor: "m4", topic: "React Portfolio Feedback", description: "Review portfolio site and code.", date: iso(1), time: "11:00", status: "pending" },
  { id: "se4", student: "s6", mentor: "m1", topic: "DSA Interview Prep", description: "Graph problems walkthrough.", date: iso(2), time: "16:00", status: "upcoming" },
  { id: "se5", student: "s4", mentor: "m3", topic: "Thesis Direction", description: "VLSI research topics.", date: iso(-3), time: "09:30", status: "completed", notes: "Great progress. Focus on FPGA prototype next." },
  { id: "se6", student: "s5", mentor: "m5", topic: "Case Study Practice", description: "Consulting frameworks.", date: iso(-5), time: "15:00", status: "completed", notes: "Improve MECE structuring." },
  { id: "se7", student: "s1", mentor: "m1", topic: "Resume Review", description: "Optimize for internships.", date: iso(-7), time: "12:00", status: "completed", notes: "Quantify impact bullets." },
  { id: "se8", student: "s3", mentor: "m4", topic: "System Design Basics", description: "Intro to scaling.", date: iso(-2), time: "13:00", status: "cancelled" },
  { id: "se9", student: "s2", mentor: "m2", topic: "Docker Deep Dive", description: "Containers and Compose.", date: iso(4), time: "10:30", status: "pending" },
];

export const feedback = [
  { id: "f1", session: "se5", from: "s4", to: "m3", rating: 5, comment: "Insightful direction and clear next steps.", date: iso(-3) },
  { id: "f2", session: "se7", from: "s1", to: "m1", rating: 5, comment: "Very actionable resume feedback.", date: iso(-7) },
  { id: "f3", session: "se6", from: "s5", to: "m5", rating: 4, comment: "Helpful frameworks, would love more examples.", date: iso(-5) },
];

export const notifications = [
  { id: "n1", title: "Session request approved", body: "Dr. Priya Sharma approved your ML Project Review.", time: "2h ago", unread: true },
  { id: "n2", title: "New feedback", body: "You received a 5★ rating from Sneha Reddy.", time: "1d ago", unread: true },
  { id: "n3", title: "Reminder", body: "Session with Prof. Arjun Rao at 2:30 PM today.", time: "3h ago", unread: false },
  { id: "n4", title: "Profile approved", body: "Admin approved your registration.", time: "2d ago", unread: false },
];

export const monthlySessions = [
  { month: "Jan", sessions: 42, completed: 38 },
  { month: "Feb", sessions: 55, completed: 49 },
  { month: "Mar", sessions: 61, completed: 55 },
  { month: "Apr", sessions: 48, completed: 44 },
  { month: "May", sessions: 72, completed: 66 },
  { month: "Jun", sessions: 80, completed: 75 },
  { month: "Jul", sessions: 68, completed: 62 },
];

export const deptDistribution = departments.map((d, i) => ({
  name: d,
  value: [42, 35, 22, 18, 14, 20][i] ?? 10,
}));

export const ratingTrend = [
  { week: "W1", rating: 4.4 },
  { week: "W2", rating: 4.5 },
  { week: "W3", rating: 4.7 },
  { week: "W4", rating: 4.6 },
  { week: "W5", rating: 4.8 },
  { week: "W6", rating: 4.9 },
];

export function mentorName(id: string) {
  return mentors.find((m) => m.id === id)?.name ?? "—";
}
export function studentName(id: string) {
  return students.find((s) => s.id === id)?.name ?? "—";
}
