// ABOUTME: Shared helpers for UI components.
// ABOUTME: cn() merges Tailwind class names, resolving conflicting utilities.
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
