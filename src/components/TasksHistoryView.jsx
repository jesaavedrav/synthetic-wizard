import { useState, useEffect } from 'react';
import TaskMonitor from './TaskMonitor';
import { trainingAPI } from '../services/api';

const TasksHistoryView = () => {
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    running: 0,
    failed: 0,
    pending: 0
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadTaskStats();
    // Actualizar stats cada 3 segundos
    const interval = setInterval(loadTaskStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadTaskStats = async () => {
    try {
      const data = await trainingAPI.getTasks();
      const tasks = data.tasks || [];
      
      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        running: tasks.filter(t => t.status === 'running').length,
        failed: tasks.filter(t => t.status === 'failed').length,
        pending: tasks.filter(t => t.status === 'pending').length
      };
      
      setTaskStats(stats);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Failed to load task stats:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Training Tasks History</h1>
        <p className="text-purple-100">
          View all training tasks and their status - past, present, and pending
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border-2 border-indigo-200 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-medium">Total Tasks</p>
              <p className="text-3xl font-bold text-indigo-900">{taskStats.total}</p>
            </div>
            <div className="bg-indigo-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-2 border-green-200 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-900">{taskStats.completed}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {taskStats.total > 0 && (
            <div className="mt-2 text-xs text-green-700">
              {((taskStats.completed / taskStats.total) * 100).toFixed(1)}% success rate
            </div>
          )}
        </div>

        {/* Running */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Running</p>
              <p className="text-3xl font-bold text-blue-900">{taskStats.running}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          {taskStats.running > 0 && (
            <div className="mt-2 flex items-center text-xs text-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
              Active training
            </div>
          )}
        </div>

        {/* Failed */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border-2 border-red-200 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Failed</p>
              <p className="text-3xl font-bold text-red-900">{taskStats.failed}</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {taskStats.pending > 0 && (
            <div className="mt-2 text-xs text-yellow-700">
              + {taskStats.pending} pending
            </div>
          )}
        </div>
      </div>

      {/* Task Monitor Component */}
      <TaskMonitor refreshTrigger={refreshTrigger} />

      {/* Additional Info */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-l-4 border-indigo-500 p-6 rounded-xl shadow-md">
        <div className="flex items-start space-x-3">
          <svg className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-indigo-900 mb-2">About Training Tasks</h3>
            <p className="text-sm text-indigo-700 mb-2">
              This page shows all training tasks that have been executed. Tasks are automatically refreshed every 3 seconds to show the latest status.
            </p>
            <ul className="text-sm text-indigo-700 space-y-1 list-disc list-inside">
              <li><strong>Running:</strong> Task is currently executing training</li>
              <li><strong>Completed:</strong> Task finished successfully with trained model</li>
              <li><strong>Failed:</strong> Task encountered an error during execution</li>
              <li><strong>Pending:</strong> Task is queued and waiting to start</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksHistoryView;
