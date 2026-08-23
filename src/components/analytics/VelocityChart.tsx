import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  TooltipProps,
} from 'recharts';
import { Task, Sprint } from '../../types';
import { useThemeStore } from '../../store/themeStore';

interface VelocityChartProps {
  tasks: Task[];
  sprints: Sprint[];
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataItem = payload[0];
    const color = (dataItem.payload as { color?: string })?.color || dataItem.color || dataItem.fill || '#3b82f6';
    return (
      <div className="bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700/80 shadow-xl rounded-2xl p-3 text-xs backdrop-blur-md space-y-1.5 min-w-[150px]">
        <p className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-1">
          {label}
        </p>
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: color }} />
            <span className="text-gray-600 dark:text-gray-300 font-medium">Completed:</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white">{dataItem.value} tasks</span>
        </div>
      </div>
    );
  }
  return null;
};

export const VelocityChart: React.FC<VelocityChartProps> = ({ tasks, sprints }) => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const colors = ['#3b82f6', '#10b981', '#6366f1'];

  const data = sprints.map((sprint, index) => {
    const sprintCompleted = tasks.filter(
      (t) => t.sprintId === sprint.id && t.status === 'done'
    ).length;
    const sprintTotal = tasks.filter((t) => t.sprintId === sprint.id).length;

    return {
      name: sprint.name,
      completed: sprintCompleted,
      total: sprintTotal,
      color: colors[index % colors.length],
    };
  });

  const tickColor = isDark ? '#9ca3af' : '#4b5563';
  const axisStroke = isDark ? '#4b5563' : '#cbd5e1';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={isDark ? 0.15 : 0.4} stroke={isDark ? '#374151' : '#e2e8f0'} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} stroke={axisStroke} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: tickColor }} stroke={axisStroke} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="completed" name="Completed Tasks" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
