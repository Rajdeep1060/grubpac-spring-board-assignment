import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, TooltipProps } from 'recharts';
import { Task } from '../../types';

interface TaskStatusChartProps {
  tasks: Task[];
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const color = (item.payload as { color?: string })?.color || item.color || '#3b82f6';
    return (
      <div className="bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700/80 shadow-xl rounded-2xl p-3 text-xs backdrop-blur-md space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full shadow-xs" style={{ backgroundColor: color }} />
          <span className="font-semibold text-gray-900 dark:text-white">{item.name}:</span>
          <span className="font-bold text-gray-900 dark:text-white">{item.value} tasks</span>
        </div>
      </div>
    );
  }
  return null;
};

export const TaskStatusChart: React.FC<TaskStatusChartProps> = ({ tasks }) => {
  const statusCounts = {
    backlog: tasks.filter((t) => t.status === 'backlog').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const data = [
    { name: 'Backlog', value: statusCounts['backlog'], color: '#9ca3af' },
    { name: 'In Progress', value: statusCounts['in-progress'], color: '#3b82f6' },
    { name: 'Review', value: statusCounts['review'], color: '#a855f7' },
    { name: 'Done', value: statusCounts['done'], color: '#10b981' },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
