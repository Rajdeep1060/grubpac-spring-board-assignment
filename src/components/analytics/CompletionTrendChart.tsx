import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Task } from '../../types';
import { useThemeStore } from '../../store/themeStore';

interface CompletionTrendChartProps {
  tasks: Task[];
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-gray-900/95 border border-emerald-500/30 shadow-xl rounded-2xl p-3 text-xs backdrop-blur-md space-y-1.5 min-w-[150px]">
        <p className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-1">
          {label}
        </p>
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
            <span className="text-gray-600 dark:text-gray-300 font-medium">Cumulative Total:</span>
          </div>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{payload[0].value} tasks</span>
        </div>
      </div>
    );
  }
  return null;
};

export const CompletionTrendChart: React.FC<CompletionTrendChartProps> = ({ tasks }) => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const completedTasks = tasks
    .filter((t) => t.completedAt)
    .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime());

  const dateMap: Record<string, number> = {};
  completedTasks.forEach((t) => {
    const dateStr = new Date(t.completedAt!).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
  });

  let runningTotal = 0;
  const data = Object.entries(dateMap).map(([date, count]) => {
    runningTotal += count;
    return {
      date,
      daily: count,
      cumulative: runningTotal,
    };
  });

  const chartData =
    data.length > 0
      ? data
      : [
          { date: 'Aug 15', daily: 1, cumulative: 1 },
          { date: 'Aug 18', daily: 3, cumulative: 4 },
          { date: 'Aug 19', daily: 4, cumulative: 8 },
        ];

  const tickColor = isDark ? '#9ca3af' : '#4b5563';
  const axisStroke = isDark ? '#4b5563' : '#cbd5e1';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={isDark ? 0.15 : 0.4} stroke={isDark ? '#374151' : '#e2e8f0'} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: tickColor }} stroke={axisStroke} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: tickColor }} stroke={axisStroke} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="cumulative"
            name="Total Completed"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#completionGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
