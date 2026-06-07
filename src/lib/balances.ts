import { OVERDUE_DAYS } from "./constants";
import { todayIso } from "./money";

export type StudentBalanceInput = {
  id: number;
  monthlyRentCents: number;
  leaseStart: string;
  active: boolean;
};

export type PaymentSum = {
  studentId: number;
  totalCents: number;
  lastPaymentDate: string | null;
};

export function monthsBetweenLeaseAndToday(leaseStart: string, today = todayIso()): number {
  if (today < leaseStart) return 0;
  const [y1, m1] = leaseStart.split("-").map(Number);
  const [y2, m2] = today.split("-").map(Number);
  return (y2 - y1) * 12 + (m2 - m1) + 1;
}

export function computeExpectedCents(
  student: StudentBalanceInput,
  today = todayIso(),
): number {
  if (!student.active) return 0;
  const months = monthsBetweenLeaseAndToday(student.leaseStart, today);
  return months * student.monthlyRentCents;
}

export function computeBalanceCents(
  student: StudentBalanceInput,
  paidCents: number,
  today = todayIso(),
): number {
  return computeExpectedCents(student, today) - paidCents;
}

export function isOverdue(
  balanceCents: number,
  lastPaymentDate: string | null,
  today = todayIso(),
): boolean {
  if (balanceCents <= 0) return false;
  if (!lastPaymentDate) return true;
  const last = new Date(lastPaymentDate + "T12:00:00");
  const now = new Date(today + "T12:00:00");
  const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > OVERDUE_DAYS;
}
