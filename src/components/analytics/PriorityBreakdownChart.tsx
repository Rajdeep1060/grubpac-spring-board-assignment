import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Task } from '../../types';
import { useThemeStore } from '../../store/themeStore';

interface PriorityBreakdownChartProps {
  tasks: Task[];
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700/80 shadow-xl rounded-2xl p-3 text-xs backdrop-blur-md space-y-1.5 min-w-[150px]">
        <p className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-1">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-3 pt-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-gray-600 dark:text-gray-300 font-medium">{entry.name}:</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const PriorityBreakdownChart: React.FC<PriorityBreakdownChartProps> = ({ tasks }) => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const columns = [
    { id: 'backlog', name: 'Backlog' },
    { id: 'in-progress', name: 'In Progress' },
    { id: 'review', name: 'Review' },
    { id: 'done', name: 'Done' },
  ];

  const data = columns.map((col) => {
    const colTasks = tasks.filter((t) => t.status === col.id);
    return {
      name: col.name,
      High: colTasks.filter((t) => t.priority === 'high').length,
      Medium: colTasks.filter((t) => t.priority === 'medium').length,
      Low: colTasks.filter((t) => t.priority === 'low').length,
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
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{value}</span>}
          />
          <Bar dataKey="High" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Medium" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Low" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
