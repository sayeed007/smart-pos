import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  bg?: string;
  valueColor?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  description,
  bg,
  valueColor,
  className,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "border-none shadow-sm rounded-xl overflow-hidden bg-white",
        className,
      )}
    >
      <CardContent>
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
            bg,
          )}
        >
          {icon}
        </div>
        <div className="space-y-1">
          <p
            className={cn(
              "text-2xl font-bold tracking-tight text-foreground",
              valueColor,
            )}
          >
            {value}
          </p>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {description && (
            <p className="text-xs text-red-500 font-medium pt-1">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
