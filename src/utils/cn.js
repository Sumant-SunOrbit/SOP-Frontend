import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This helper merges tailwind classes cleanly
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}