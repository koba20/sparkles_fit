import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCategoryColor(categoryName: string): string {
  const name = categoryName.toLowerCase().trim();

  if (name === "men" || name === "men's" || name === "mens") {
    return "bg-blue-600 text-white";
  }

  if (name === "women" || name === "women's" || name === "womens") {
    return "bg-pink-500 text-white";
  }

  // Default color for other categories
  return "bg-black/80 text-white";
}
