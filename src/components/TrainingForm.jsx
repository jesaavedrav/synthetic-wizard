import { useState, useEffect } from 'react';
import { trainingAPI } from '../services/api';

function TrainingForm({ selectedDataset, onTriggerRefresh, hasRunningTasks, onNavigate }) {
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [epochs, setEpochs] = useState(50);
  const [batchSize, setBatchSize] = useState(500);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      const data = await trainingAPI.getMethods();
      // data es un array de MethodInfo con campos adicionales
      setMethods(data);
      if (data.length > 0) {
        setSelectedMethod(data[0].method);
        // Establecer valores por defecto del primer método
        if (data[0].default_epochs) setEpochs(data[0].default_epochs);
        if (data[0].default_batch_size) setBatchSize(data[0].default_batch_size);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Obtener el método seleccionado actual
  const currentMethod = methods.find(m => m.method === selectedMethod);

  // Handler para cambio de método
  const handleMethodChange = (methodValue) => {
    setSelectedMethod(methodValue);
    const method = methods.find(m => m.method === methodValue);
    if (method) {
      // Actualizar epochs y batch_size con los valores por defecto del método
      if (method.default_epochs) setEpochs(method.default_epochs);
      if (method.default_batch_size) setBatchSize(method.default_batch_size);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDataset) {
      setError('Please select a dataset first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Solo enviar epochs y batch_size si el método los soporta
      const epochsValue = currentMethod?.supports_epochs ? parseInt(epochs) : null;
      const batchSizeValue = currentMethod?.supports_batch_size ? parseInt(batchSize) : null;
      
      const result = await trainingAPI.startTraining(
        selectedDataset,
        epochsValue,
        selectedMethod,
        'cardiovascular_model', // Nombre base sin sufijo de método
        batchSizeValue,
        overwriteExisting
      );
      onTriggerRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Configure Training
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Training Method
          </label>
          <select
            value={selectedMethod}
            onChange={(e) => handleMethodChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={methods.length === 0 || hasRunningTasks}
          >
            {methods.map((method, index) => (
              <option key={index} value={method.method}>
                {method.name}
              </option>
            ))}
          </select>
          {currentMethod && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500 italic">
                {currentMethod.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {currentMethod.supports_epochs && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    Supports Epochs
                  </span>
                )}
                {currentMethod.supports_batch_size && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    Supports Batch Size
                  </span>
                )}
                {!currentMethod.supports_epochs && !currentMethod.supports_batch_size && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                    No training parameters needed
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Epochs - solo mostrar si el método lo soporta */}
        {currentMethod?.supports_epochs && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Epochs: {epochs}
            </label>
            <input
              type="range"
              value={epochs}
              onChange={(e) => setEpochs(e.target.value)}
              min="1"
              max="100"
              disabled={hasRunningTasks}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        )}

        {/* Batch Size - solo mostrar si el método lo soporta */}
        {currentMethod?.supports_batch_size && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch Size: {batchSize}
            </label>
            <input
              type="range"
              value={batchSize}
              onChange={(e) => setBatchSize(e.target.value)}
              min="100"
              max="5000"
              step="100"
              disabled={hasRunningTasks}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>100</span>
              <span>2500</span>
              <span>5000</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 italic">
              Number of samples processed in each training batch
            </p>
          </div>
        )}

        <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
          <input
            type="checkbox"
            id="overwrite"
            checked={overwriteExisting}
            onChange={(e) => setOverwriteExisting(e.target.checked)}
            disabled={hasRunningTasks}
            className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <label htmlFor="overwrite" className="ml-3 text-sm text-gray-700 cursor-pointer flex-1 disabled:cursor-not-allowed">
            <span className="font-medium">Overwrite Existing Model</span>
            <p className="text-xs text-gray-500 mt-0.5">
              Replace the model if it already exists with the same name
            </p>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Training Status Indicator */}
        {hasRunningTasks && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-blue-900">Training in Progress</span>
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
                <p className="text-xs text-blue-700 mt-0.5">
                  A model is currently being trained. Check the{' '}
                  <button
                    onClick={() => onNavigate('tasks')}
                    className="underline hover:text-blue-900 font-medium"
                  >
                    Task Monitor
                  </button>
                  {' '}for details.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedDataset || hasRunningTasks}
          className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
            loading || !selectedDataset || hasRunningTasks
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Starting Training...</span>
            </>
          ) : hasRunningTasks ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Training in Progress...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Start Training</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TrainingForm;
