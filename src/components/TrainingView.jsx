import { useState, useEffect } from 'react';
import DatasetSelector from './DatasetSelector';
import TrainingForm from './TrainingForm';
import TaskMonitor from './TaskMonitor';
import { trainingAPI } from '../services/api';

const TrainingView = ({ onNavigate }) => {
  const [selectedDataset, setSelectedDataset] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hasRunningTasks, setHasRunningTasks] = useState(false);

  useEffect(() => {
    checkRunningTasks();
    // Verificar cada 3 segundos si hay tasks corriendo
    const interval = setInterval(checkRunningTasks, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkRunningTasks = async () => {
    try {
      const data = await trainingAPI.getTasks();
      const tasks = data.tasks || [];
      const running = tasks.some(t => t.status === 'running');
      setHasRunningTasks(running);
    } catch (err) {
      console.error('Failed to check running tasks:', err);
    }
  };

  const handleTriggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    checkRunningTasks(); // Actualizar inmediatamente
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Model Training</h1>
        <p className="text-blue-100">
          Train synthetic data generation models using your cardiovascular datasets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          <DatasetSelector
            selectedDataset={selectedDataset}
            onDatasetChange={setSelectedDataset}
          />
          
          <TrainingForm 
            selectedDataset={selectedDataset}
            onTriggerRefresh={handleTriggerRefresh}
            hasRunningTasks={hasRunningTasks}
            onNavigate={onNavigate}
          />

          {selectedDataset && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-md">
              <h3 className="font-semibold text-blue-900 mb-1 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Selected Dataset
              </h3>
              <p className="text-sm text-blue-700 font-mono break-all">{selectedDataset}</p>
            </div>
          )}
        </div>

        {/* Right Column - Task Monitor */}
        <div>
          <TaskMonitor refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default TrainingView;
