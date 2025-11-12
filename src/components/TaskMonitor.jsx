import { useState, useEffect } from 'react';
import { trainingAPI } from '../services/api';

const TaskMonitor = ({ refreshTrigger }) => {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  useEffect(() => {
    loadTasks();
    // Poll for updates every 3 seconds
    const interval = setInterval(loadTasks, 3000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const loadTasks = async () => {
    try {
      const data = await trainingAPI.getTasks();
      setTasks(data.tasks || []);
      setTotal(data.total || 0);
      setError(null);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const toggleTask = (taskId) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const isExpanded = (taskId) => expandedTasks.has(taskId);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Training Tasks
        </h2>
        <div className="flex items-center space-x-3 text-gray-500">
          <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Training Tasks
        </h2>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Training Tasks
        </h2>
        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
          {total} total
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-500">No training tasks yet</p>
          <p className="text-sm text-gray-400 mt-1">Start a training to see it here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const expanded = isExpanded(task.task_id);
            
            return (
              <div
                key={task.task_id}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 bg-white"
              >
                {/* Accordion Header - Always Visible */}
                <button
                  onClick={() => toggleTask(task.task_id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1 text-left">
                    {/* Status Badge */}
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${getStatusColor(task.status)}`}>
                      {task.status.toUpperCase()}
                    </div>
                    
                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {task.message}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">
                        ID: {task.task_id.substring(0, 8)}...
                      </div>
                    </div>

                    {/* Progress indicator for running tasks */}
                    {task.status === 'running' && task.progress !== null && (
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-12 text-right">
                          {task.progress.toFixed(0)}%
                        </span>
                      </div>
                    )}

                    {/* Completed indicator */}
                    {task.status === 'completed' && (
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}

                    {/* Error indicator */}
                    {task.error && (
                      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>

                  {/* Expand/Collapse Icon */}
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ml-4 flex-shrink-0 ${expanded ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Accordion Content - Expandable */}
                {expanded && (
                  <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                    <div className="p-4 space-y-4">
                      {/* Full Task ID */}
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="text-xs font-semibold text-gray-600 mb-1">Task ID</div>
                        <div className="text-sm font-mono text-gray-800 break-all">{task.task_id}</div>
                      </div>

                      {/* Progress Bar - Detailed */}
                      {task.status === 'running' && task.progress !== null && (
                        <div className="bg-white p-3 rounded-lg border border-blue-200">
                          <div className="flex justify-between text-xs text-gray-600 mb-2 font-medium">
                            <span>Training Progress</span>
                            <span>{task.progress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                              style={{ width: `${task.progress}%` }}
                            >
                              {task.progress > 10 && (
                                <span className="text-xs text-white font-bold">
                                  {task.progress.toFixed(0)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Error Details */}
                      {task.error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                          <div className="flex items-start">
                            <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                              <div className="text-red-800 font-semibold text-sm mb-1">Error Details</div>
                              <div className="text-red-700 text-sm">{task.error}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Training Result & Metadata */}
                      {task.result && (
                        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-green-800 font-semibold">Training Completed Successfully</span>
                          </div>
                          
                          {/* Model Path */}
                          {task.result.model_path && (
                            <div className="mb-3 bg-white p-3 rounded border border-green-200">
                              <div className="text-xs font-semibold text-gray-600 mb-1">Model Saved</div>
                              <div className="text-sm text-gray-800 font-mono bg-gray-50 px-2 py-1 rounded break-all">
                                {task.result.model_path}
                              </div>
                            </div>
                          )}

                          {/* Training Metadata Grid */}
                          {task.result.training_metadata && (
                            <div className="bg-white p-3 rounded border border-green-200">
                              <div className="text-xs font-semibold text-gray-700 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Training Details
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                {/* Method */}
                                {task.result.training_metadata.method && (
                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-xs text-gray-500 mb-0.5">Method</div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {task.result.training_metadata.method.toUpperCase()}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Epochs */}
                                {task.result.training_metadata.epochs !== undefined && (
                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-xs text-gray-500 mb-0.5">Epochs</div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {task.result.training_metadata.epochs}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Batch Size */}
                                {task.result.training_metadata.batch_size && (
                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-xs text-gray-500 mb-0.5">Batch Size</div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {task.result.training_metadata.batch_size.toLocaleString()}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Training Time */}
                                {task.result.training_metadata.training_time_seconds && (
                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-xs text-gray-500 mb-0.5">Training Time</div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {task.result.training_metadata.training_time_seconds.toFixed(2)}s
                                    </div>
                                  </div>
                                )}
                                
                                {/* Dataset Rows */}
                                {task.result.training_metadata.dataset_rows && (
                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-xs text-gray-500 mb-0.5">Dataset Rows</div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {task.result.training_metadata.dataset_rows.toLocaleString()}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Dataset Columns */}
                                {task.result.training_metadata.dataset_columns && (
                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-xs text-gray-500 mb-0.5">Dataset Columns</div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {task.result.training_metadata.dataset_columns}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Dataset Path - full width */}
                              {task.result.training_metadata.dataset_path && (
                                <div className="mt-3 bg-gray-50 p-2 rounded">
                                  <div className="text-xs text-gray-500 mb-0.5">Dataset</div>
                                  <div className="text-sm font-mono text-gray-900 break-all">
                                    {task.result.training_metadata.dataset_path}
                                  </div>
                                </div>
                              )}
                              
                              {/* Trained At - full width */}
                              {task.result.training_metadata.trained_at && (
                                <div className="mt-3 bg-gray-50 p-2 rounded">
                                  <div className="text-xs text-gray-500 mb-0.5">Trained At</div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {task.result.training_metadata.trained_at}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Fallback: si no hay training_metadata, mostrar JSON completo */}
                          {!task.result.training_metadata && !task.result.model_path && (
                            <div className="bg-white p-3 rounded border border-green-200">
                              <pre className="text-xs overflow-x-auto text-gray-700">
                                {JSON.stringify(task.result, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center text-xs text-gray-500 mb-1">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Started
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(task.started_at)}
                          </div>
                        </div>
                        {task.completed_at && (
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Completed
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(task.completed_at)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskMonitor;
