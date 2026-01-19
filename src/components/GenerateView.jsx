import { useState, useEffect } from 'react';
import { generateAPI, modelsAPI } from '../services/api';
import ExpandableJsonCell from './ExpandableJsonCell';

const GenerateView = () => {
  const [numSamples, setNumSamples] = useState(100);
  const [sendToKafka, setSendToKafka] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [trainedModels, setTrainedModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [loadingModels, setLoadingModels] = useState(true);

  useEffect(() => {
    loadTrainedModels();
  }, []);

  const loadTrainedModels = async () => {
    try {
      setLoadingModels(true);
      const models = await modelsAPI.getTrainedModels();
      setTrainedModels(models);
      if (models.length > 0) {
        setSelectedModel(models[0]);
      }
    } catch (err) {
      console.error('Failed to load trained models:', err);
      setError('Failed to load trained models. Make sure you have trained at least one model.');
    } finally {
      setLoadingModels(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedModel) {
      setError('Please select a trained model first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Usar training_metadata.method que tiene el método correcto
      const methodToUse = selectedModel.training_metadata?.method || selectedModel.method;
      
      // Extraer el nombre base del modelo sin el sufijo del método
      // Por ejemplo: "cardiovascular_model_gaussian" -> "cardiovascular_model"
      // El backend agregará automáticamente el sufijo basado en el método
      let baseModelName = selectedModel.model_name;
      
      // Remover sufijos comunes de métodos del nombre
      const methodSuffixes = ['_ctgan', '_tvae', '_gaussian_copula', '_gaussian', '_smote', '_copula'];
      for (const suffix of methodSuffixes) {
        if (baseModelName.endsWith(suffix)) {
          baseModelName = baseModelName.slice(0, -suffix.length);
          break;
        }
      }
      
      const result = await generateAPI.generateData(
        numSamples, 
        sendToKafka, 
        baseModelName, // Enviar nombre base sin sufijo
        methodToUse
      );
      
      if (sendToKafka) {
        // Si se envió a Kafka, mostrar mensaje de éxito
        setGeneratedData({
          status: 'success',
          message: `Successfully sent ${numSamples} samples to Kafka`,
          kafka_sent: true,
          num_samples_generated: numSamples
        });
        setShowTable(false);
      } else {
        // Si se generó localmente, mostrar la data
        setGeneratedData(result);
        setShowTable(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!generatedData || !generatedData.samples) return;

    const samples = generatedData.samples;
    const headers = Object.keys(samples[0]);
    const csvContent = [
      headers.join(','),
      ...samples.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synthetic_data_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Generate Synthetic Data</h1>
        <p className="text-indigo-100">
          Create synthetic cardiovascular data using your trained models
        </p>
      </div>

      {/* Configuration Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Configuration
        </h2>

        <div className="space-y-4">
          {/* Trained Model Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Trained Model
            </label>
            {loadingModels ? (
              <div className="flex items-center space-x-3 text-gray-500 p-3 bg-gray-50 rounded-lg">
                <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading trained models...</span>
              </div>
            ) : trainedModels.length === 0 ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-yellow-700 text-sm">No trained models found. Please train a model first.</p>
                </div>
              </div>
            ) : (
              <>
                <select
                  value={selectedModel ? trainedModels.findIndex(m => m.model_name === selectedModel.model_name) : -1}
                  onChange={(e) => setSelectedModel(trainedModels[parseInt(e.target.value)])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                >
                  {trainedModels.map((model, index) => {
                    const displayMethod = model.training_metadata?.method || model.method;
                    return (
                      <option key={index} value={index}>
                        {model.model_name} ({displayMethod.toUpperCase()}) - {(model.size_bytes / 1024 / 1024).toFixed(2)} MB
                      </option>
                    );
                  })}
                </select>
                {selectedModel && (
                  <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-indigo-600 font-medium">Method:</span>
                        <span className="text-indigo-900 ml-1">
                          {(selectedModel.training_metadata?.method || selectedModel.method).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-indigo-600 font-medium">File:</span>
                        <span className="text-indigo-900 ml-1 font-mono">{selectedModel.file_name}</span>
                      </div>
                      {selectedModel.modified_at && (
                        <div className="col-span-2">
                          <span className="text-indigo-600 font-medium">Last Modified:</span>
                          <span className="text-indigo-900 ml-1">
                            {new Date(selectedModel.modified_at).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Number of Samples */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Samples
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={numSamples}
                onChange={(e) => setNumSamples(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <input
                type="number"
                min="10"
                max="10000"
                value={numSamples}
                onChange={(e) => setNumSamples(parseInt(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Generate between 10 and 10,000 synthetic samples
            </p>
          </div>

          {/* Send to Kafka Checkbox */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border-2 border-purple-200">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="sendToKafka"
                checked={sendToKafka}
                onChange={(e) => setSendToKafka(e.target.checked)}
                className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer"
              />
              <div className="flex-1">
                <label htmlFor="sendToKafka" className="text-sm font-semibold text-gray-900 cursor-pointer flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Send to Kafka
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  {sendToKafka 
                    ? 'Data will be sent to Kafka topic instead of being displayed here. You won\'t see a preview or download option.'
                    : 'Data will be generated and displayed in a table below. You can download it as CSV.'}
                </p>
                {sendToKafka && (
                  <div className="mt-2 flex items-start space-x-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                    <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-xs text-yellow-800">
                      Kafka mode: Generated data will be streamed to the configured Kafka topic.
                    </span>
                  </div>
                )}
              </div>
            </div>
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

          {/* Info Note */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="text-blue-700 font-medium mb-1">Generation Info</p>
                <p className="text-blue-600">
                  Select a trained model from the list above. The model will be used to generate synthetic cardiovascular data based on the patterns learned during training.
                  {trainedModels.length > 0 && (
                    <span className="block mt-1">
                      <strong>{trainedModels.length}</strong> trained model{trainedModels.length !== 1 ? 's' : ''} available.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !selectedModel || trainedModels.length === 0}
            className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
              loading || !selectedModel || trainedModels.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Generate Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {generatedData && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Generation Results
            </h2>
            {!generatedData.kafka_sent && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowTable(!showTable)}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                >
                  {showTable ? 'Hide Table' : 'Show Table'}
                </button>
                <button
                  onClick={downloadCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download CSV</span>
                </button>
              </div>
            )}
          </div>

          {/* Kafka Success Message */}
          {generatedData.kafka_sent && (
            <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
              <div className="flex items-start">
                <svg className="w-8 h-8 text-purple-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">
                    Data Sent to Kafka Successfully!
                  </h3>
                  <p className="text-purple-700 mb-3">
                    {generatedData.message}
                  </p>
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <div className="text-sm text-gray-700">
                      <strong className="text-purple-900">Samples Generated:</strong> {generatedData.num_samples_generated}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards - solo si no es Kafka */}
          {!generatedData.kafka_sent && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium">Samples Generated</p>
                  <p className="text-2xl font-bold text-blue-900">{generatedData.num_samples_generated}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <p className="text-sm text-purple-600 font-medium">Status</p>
                  <p className="text-2xl font-bold text-purple-900 capitalize">{generatedData.status}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <p className="text-sm text-green-600 font-medium">Columns</p>
                  <p className="text-2xl font-bold text-green-900">
                    {generatedData.samples && generatedData.samples.length > 0 
                      ? Object.keys(generatedData.samples[0]).length 
                      : 0}
                  </p>
                </div>
              </div>

              {/* Data Table */}
              {showTable && generatedData.samples && generatedData.samples.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
                            #
                          </th>
                          {Object.keys(generatedData.samples[0]).map((key) => (
                            <th
                              key={key}
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {generatedData.samples.slice(0, 100).map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-medium">
                              {idx + 1}
                            </td>
                            {Object.values(row).map((value, i) => (
                              <td key={i} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                {typeof value === 'object' && value !== null ? (
                                  <ExpandableJsonCell value={value} />
                                ) : (
                                  typeof value === 'number' ? value.toFixed(2) : value
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {generatedData.samples.length > 100 && (
                    <div className="bg-gray-50 px-4 py-3 text-sm text-gray-500 text-center border-t border-gray-200">
                      Showing first 100 of {generatedData.samples.length} rows. Download CSV to see all data.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GenerateView;
