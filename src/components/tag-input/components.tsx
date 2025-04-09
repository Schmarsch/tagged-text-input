import { cn } from "@/lib/utils";

interface CustomBadgeProps {
  children: React.ReactNode;
  color?: string;
}

export const CustomBadge: React.FC<CustomBadgeProps> = ({
  children,
  color,
}) => {
  return (
    <span
      className={cn(
        "flex items-center justify-center h-8 p-2 border rounded-sm",
        color ? `bg-${color}-500` : "bg-gray-200"
      )}
    >
      {children}
    </span>
  );
};
