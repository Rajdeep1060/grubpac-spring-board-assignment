import React, { useState, useRef } from 'react';
import { useBoardStore } from '../store/boardStore';
import { VelocityChart } from '../components/analytics/VelocityChart';
import { TaskStatusChart } from '../components/analytics/TaskStatusChart';
import { PriorityBreakdownChart } from '../components/analytics/PriorityBreakdownChart';
import { CompletionTrendChart } from '../components/analytics/CompletionTrendChart';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../hooks/useToast';
import { Download, BarChart3, Calendar, Filter } from 'lucide-react';
import html2canvas from 'html2canvas';

export const AnalyticsPage: React.FC = () => {
  const { tasks, sprints } = useBoardStore();
  const { toast } = useToast();
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    if (!startDate && !endDate) return true;
    const taskDate = new Date(task.createdAt);
    if (startDate && taskDate < new Date(startDate)) return false;
    if (endDate && taskDate > new Date(endDate)) return false;
    return true;
  });

  const handleExportPNG = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);
    toast.info('Generating analytics snapshot...', 'Exporting');

    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#090d16' : '#ffffff',
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `SprintDesk_Analytics_${new Date().toISOString().split('T')[0]}.png`;
      link.click();

      toast.success('Analytics report exported as PNG image!', 'Export Complete');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PNG image report.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Analytics & Data Visualisations
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-time data insights, sprint velocity, workload distribution, and completion metrics.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleExportPNG}
          isLoading={isExporting}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export PNG Report
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs text-xs">
        <div className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300">
          <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Date Range Filter:</span>
        </div>
        <div className="w-40">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="py-1.5 text-xs"
          />
        </div>
        <span className="text-gray-400">to</span>
        <div className="w-40">
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="py-1.5 text-xs"
          />
        </div>
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium ml-2"
          >
            <Filter className="w-3.5 h-3.5" />
            Clear dates
          </button>
        )}
      </div>

      <div ref={dashboardRef} className="space-y-6 p-2 bg-transparent rounded-3xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Sprint Velocity Chart</h3>
              <span className="text-xs text-gray-400">Completed tasks per sprint</span>
            </div>
            <VelocityChart tasks={filteredTasks} sprints={sprints} />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Task Status Distribution</h3>
              <span className="text-xs text-gray-400">Backlog vs Progress vs Review vs Done</span>
            </div>
            <TaskStatusChart tasks={filteredTasks} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Priority Breakdown by Status</h3>
              <span className="text-xs text-gray-400">High, Medium, and Low priorities</span>
            </div>
            <PriorityBreakdownChart tasks={filteredTasks} />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Cumulative Completion Trend</h3>
              <span className="text-xs text-gray-400">Cumulative completed tasks over time</span>
            </div>
            <CompletionTrendChart tasks={filteredTasks} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
