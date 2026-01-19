import { useState } from 'react';
import Sidebar from './components/Sidebar';
import TrainingView from './components/TrainingView';
import GenerateView from './components/GenerateView';
import TasksHistoryView from './components/TasksHistoryView';
import AnomalyInjectorView from './components/AnomalyInjectorView';
import AuditLogsView from './components/AuditLogsView';
import PredictionView from './components/PredictionView';
import SettingsView from './components/SettingsView';

function App() {
  const [activeView, setActiveView] = useState('training');

  const renderView = () => {
    switch (activeView) {
      case 'training':
        return <TrainingView />;
      case 'generate':
        return <GenerateView />;
      case 'tasks':
        return <TasksHistoryView />;
      case 'anomaly':
        return <AnomalyInjectorView />;
      case 'audit':
        return <AuditLogsView />;
      case 'prediction':
        return <PredictionView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TrainingView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {renderView()}
        </div>
      </div>
    </div>
  );
}

export default App;
