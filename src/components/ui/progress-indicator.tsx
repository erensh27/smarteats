import * as React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  value: number;
  label: string;
  color?: string;
  className?: string;
  showValue?: boolean;
}

const ProgressIndicator = React.forwardRef<
  HTMLDivElement,
  ProgressIndicatorProps
>(({ value, label, color = "hsl(var(--cta))", className, showValue = true }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)}>
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {showValue && (
        <span className="text-sm text-muted-foreground">{Math.round(value)}%</span>
      )}
    </div>
    <Progress 
      value={value} 
      className="h-2"
      style={{ 
        '--progress-background': color 
      } as React.CSSProperties}
    />
  </div>
));
ProgressIndicator.displayName = "ProgressIndicator";

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
  children?: React.ReactNode;
}

const CircularProgress = React.forwardRef<
  HTMLDivElement,
  CircularProgressProps
>(({ value, size = 120, strokeWidth = 8, color = "hsl(var(--cta))", className, children }, ref) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div ref={ref} className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <span className="text-2xl font-bold text-foreground">
            {Math.round(value)}%
          </span>
        )}
      </div>
    </div>
  );
});
CircularProgress.displayName = "CircularProgress";

interface NutrientCardProps {
  nutrient: string;
  value: number;
  target: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}

const NutrientCard = React.forwardRef<
  HTMLDivElement,
  NutrientCardProps
>(({ nutrient, value, target, unit, trend = 'stable', className }, ref) => {
  const percentage = Math.min((value / target) * 100, 100);
  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';
  const trendColor = trend === 'up' ? 'text-cta' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div ref={ref} className={cn("p-4 rounded-lg border bg-card", className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-foreground">{nutrient}</h4>
        <span className={cn("text-sm font-medium", trendColor)}>
          {trendIcon} {Math.round(percentage)}%
        </span>
      </div>
      <div className="space-y-2">
        <Progress value={percentage} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{value}{unit}</span>
          <span>Goal: {target}{unit}</span>
        </div>
      </div>
    </div>
  );
});
NutrientCard.displayName = "NutrientCard";

export { ProgressIndicator, CircularProgress, NutrientCard };