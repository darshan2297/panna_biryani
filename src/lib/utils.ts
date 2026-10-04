import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indian Rupees using Indian numbering format (e.g., ₹1,250)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format plain Indian number (e.g., 1,250)
 */
export function formatNumberIN(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

/**
 * Generate a unique random order number (e.g., PB-2026-84920)
 */
export function generateOrderNumber(): string {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `PB-${currentYear}-${randomSuffix}`;
}
