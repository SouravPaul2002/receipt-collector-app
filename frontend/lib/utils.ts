import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility helper to conditionally merge and resolve Tailwind CSS classes.
 * Perfect for combining base component classes with customizable class props
 * from parent components (e.g., className, leftContainerClassName, rightContentClassName, headerClassName, etc.).
 *
 * @example
 * // In a child component accepting custom sub-element classes:
 * <div className={cn("flex items-center gap-2 p-4", leftContainerClassName)}>
 *   <span className={cn("text-sm font-semibold", titleClassName)}>Title</span>
 * </div>
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs))
}

export default cn
