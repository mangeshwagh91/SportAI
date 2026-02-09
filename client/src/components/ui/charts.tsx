import { useEffect, useRef } from 'react';

interface LineChartProps extends React.HTMLAttributes<HTMLDivElement> {}

interface XAxisProps {
  dataKey: string;
}

interface YAxisProps {}

interface CartesianGridProps {
  strokeDasharray?: string;
}

interface TooltipProps {}

interface LineProps {
  type: string;
  dataKey: string;
  stroke: string;
  strokeWidth?: number;
}

interface ResponsiveContainerProps {
  width: string;
  height: number;
  children: React.ReactNode;
}

// Simple chart implementation for demo purposes
export const LineChart: React.FC<LineChartProps & { data: any[] }> = ({ data, children, ...props }) => {
  return (
    <div className="relative w-full h-full bg-secondary/20 rounded border flex items-center justify-center" {...props}>
      <div className="text-sm text-muted-foreground">
        📊 BMI Chart ({data.length} data points)
      </div>
    </div>
  );
};

export const XAxis: React.FC<XAxisProps> = ({ dataKey }) => null;
export const YAxis: React.FC<YAxisProps> = () => null;
export const CartesianGrid: React.FC<CartesianGridProps> = ({ strokeDasharray }) => null;
export const Tooltip: React.FC<TooltipProps> = () => null;
export const Line: React.FC<LineProps> = ({ type, dataKey, stroke, strokeWidth }) => null;

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ width, height, children }) => {
  return (
    <div style={{ width, height }} className="relative">
      {children}
    </div>
  );
};

// Fallback for when recharts isn't available
export * from 'recharts';