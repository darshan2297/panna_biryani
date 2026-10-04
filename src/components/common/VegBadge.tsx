import { cn } from "@/lib/utils";

interface VegBadgeProps {
  showLabel?: boolean;
  labelText?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Standard Indian FSSAI-compliant 100% Pure Vegetarian Symbol
 * Green square container with solid green circle inside
 */
export function VegBadge({
  showLabel = false,
  labelText = "100% Pure Veg",
  size = "md",
  className,
}: VegBadgeProps) {
  const sizeMap = {
    sm: { box: "w-3.5 h-3.5 p-[2px]", dot: "w-1.5 h-1.5", text: "text-[10px]" },
    md: { box: "w-4 h-4 p-[2.5px]", dot: "w-2 h-2", text: "text-xs" },
    lg: { box: "w-5 h-5 p-[3px]", dot: "w-2.5 h-2.5", text: "text-sm" },
  };

  const current = sizeMap[size];

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 select-none shrink-0", className)}
      title="100% Pure Vegetarian"
    >
      <span
        className={cn(
          "border border-emerald-600 rounded-[3px] bg-white flex items-center justify-center shrink-0 shadow-2xs",
          current.box
        )}
        aria-hidden="true"
      >
        <span className={cn("rounded-full bg-emerald-600 shrink-0", current.dot)} />
      </span>
      {showLabel && (
        <span className={cn("font-bold text-emerald-800 tracking-wide", current.text)}>
          {labelText}
        </span>
      )}
    </span>
  );
}
