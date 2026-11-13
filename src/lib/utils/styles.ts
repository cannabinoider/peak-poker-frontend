import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Joins class names, letting later Tailwind classes win (`cn("p-2", big && "p-4")`). */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
