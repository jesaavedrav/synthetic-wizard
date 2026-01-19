import { useState, useEffect } from 'react';
import { generateAPI, modelsAPI, datasetsAPI } from '../services/api';
import ExpandableJsonCell from './ExpandableJsonCell';

const anomalyTypes = [
  { value: 'outlier', label: 'Outlier' },
  { value: 'missing', label: 'Missing Values' },
  { value: 'category_noise', label: 'Category Noise' },
  // Agrega más tipos según soporte del backend
];

const defaultParams = {
  outlier: { factor: 4, proportion: 0.02 },
  missing: { proportion: 0.05 },
  category_noise: { proportion: 0.05 },
};

export default function AnomalyInjectorView() {
  const [numSamples, setNumSamples] = useState(100);
  const [sendToKafka, setSendToKafka] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [trainedModels, setTrainedModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [loadingModels, setLoadingModels] = useState(true);
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [anomalyType, setAnomalyType] = useState('outlier');
  const [anomalyParams, setAnomalyParams] = useState(defaultParams['outlier']);
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');

  useEffect(() => {
    loadTrainedModels();
    loadDatasets();
  }, []);

  useEffect(() => {
    // Reset params when anomaly type changes
    setAnomalyParams(defaultParams[anomalyType] || {});
  }, [anomalyType]);

  useEffect(() => {
    // Load columns from selected dataset
    if (selectedDataset) {
      fetchColumns(selectedDataset);
    }
  }, [selectedDataset]);

  const loadTrainedModels = async () => {
    try {
      setLoadingModels(true);
      const models = await modelsAPI.getTrainedModels();
      setTrainedModels(models);
      if (models.length > 0) {
        setSelectedModel(models[0]);
      }
    } catch (err) {
      setError('Failed to load trained models.');
    } finally {
      setLoadingModels(false);
    }
  };

  const loadDatasets = async () => {
    try {
      const ds = await datasetsAPI.getDatasets();
      setDatasets(ds);
      if (ds.length > 0) setSelectedDataset(ds[0]);
    } catch (err) {
      setError('Failed to load datasets.');
    }
  };

  const fetchColumns = async (dataset) => {
    // Suponiendo que el backend expone columnas en /datasets o similar
    // Si no, puedes obtenerlas de un modelo entrenado
    // Aquí solo mockeamos
    setColumns(['BMI', 'Age', 'Sex', 'BloodPressure', 'Cholesterol']);
  };

  const handleGenerate = async () => {
    if (!selectedModel) {
      setError('Please select a trained model first');
      return;
    }
    if (!selectedDataset) {
      setError('Please select a dataset');
      return;
    }
    if (!anomalyType || selectedColumns.length === 0) {
      setError('Select anomaly type and at least one column');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const methodToUse = selectedModel.training_metadata?.method || selectedModel.method;
      let baseModelName = selectedModel.model_name;
      const methodSuffixes = ['_ctgan', '_tvae', '_gaussian_copula', '_gaussian', '_smote', '_copula'];
      for (const suffix of methodSuffixes) {
        if (baseModelName.endsWith(suffix)) {
          baseModelName = baseModelName.slice(0, -suffix.length);
          break;
        }
      }
      const payload = {
        num_samples: numSamples,
        send_to_kafka: sendToKafka,
        model_name: baseModelName,
        method: methodToUse,
        anomaly: {
          type: anomalyType,
          columns: selectedColumns,
          params: anomalyParams
        }
      };
      const data = await generateAPI.generateDataWithAnomaly(payload);
      setGeneratedData(data);
      setShowTable(true);
    } catch (err) {
      setError('Failed to generate data with anomaly.');
    } finally {
      setLoading(false);
    }
  };

  const handleParamChange = (param, value) => {
    setAnomalyParams(prev => ({ ...prev, [param]: value }));
  };

  const handleColumnToggle = (col) => {
    setSelectedColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow p-8 border border-gray-100 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-gray-900 tracking-tight">Anomaly Injector</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Dataset</label>
          <select
            value={selectedDataset?.name || selectedDataset || ''}
            onChange={e => {
              const value = e.target.value;
              const found = datasets.find(ds => (ds.name || ds) === value);
              setSelectedDataset(found);
            }}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 text-gray-900 transition"
          >
            {datasets.map((ds, idx) => (
              <option key={ds.name || ds} value={ds.name || ds}>
                {ds.name || ds}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
          <select
            value={selectedModel ? trainedModels.findIndex(m => m.model_name === selectedModel.model_name && (m.training_metadata?.method || m.method) === (selectedModel.training_metadata?.method || selectedModel.method)) : -1}
            onChange={e => setSelectedModel(trainedModels[parseInt(e.target.value)])}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 text-gray-900 transition"
          >
            {trainedModels.map((m, idx) => (
              <option key={idx} value={idx}>
                {m.model_name} ({(m.training_metadata?.method || m.method).toUpperCase()})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Anomaly Type</label>
          <select
            value={anomalyType}
            onChange={e => setAnomalyType(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 text-gray-900 transition"
          >
            {anomalyTypes.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Target Columns</label>
          <div className="flex flex-wrap gap-2">
            {columns.map(col => (
              <button
                key={col}
                type="button"
                className={`px-3 py-1 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition shadow-sm ${selectedColumns.includes(col) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-indigo-50'}`}
                onClick={() => handleColumnToggle(col)}
              >
                {col}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Parameters</label>
          <div className="space-y-2">
            {Object.keys(anomalyParams).map(param => (
              <div key={param} className="flex items-center gap-2">
                <span className="w-24 text-xs text-gray-500 font-medium">{param}</span>
                <input
                  type="number"
                  value={anomalyParams[param]}
                  onChange={e => handleParamChange(param, Number(e.target.value))}
                  className="p-2 border border-gray-200 rounded-lg w-24 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 text-gray-900 transition"
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Samples</label>
          <input
            type="number"
            min={1}
            max={10000}
            value={numSamples}
            onChange={e => setNumSamples(Number(e.target.value))}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 text-gray-900 transition"
          />
        </div>
        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            checked={sendToKafka}
            onChange={e => setSendToKafka(e.target.checked)}
            id="sendToKafka"
            className="w-5 h-5 text-indigo-500 border-gray-300 rounded focus:ring-indigo-400 focus:ring-2 cursor-pointer"
          />
          <label htmlFor="sendToKafka" className="text-sm text-gray-700 font-medium cursor-pointer">Send to Kafka</label>
        </div>
      </div>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-xl shadow-md hover:from-indigo-600 hover:to-purple-600 transition-all font-semibold text-base disabled:opacity-60 disabled:cursor-not-allowed mt-4"
      >
        {loading ? 'Generating...' : 'Generate with Anomaly'}
      </button>
      {error && <div className="mt-6 text-red-600 text-base font-medium">{error}</div>}
      {showTable && generatedData && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Generated Data</h3>
          <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50">
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">#</th>
                    {Object.keys((generatedData.samples && generatedData.samples[0]) || generatedData[0] || {}).map(col => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {(generatedData.samples || generatedData).slice(0, 100).map((row, i) => (
                    <tr key={i} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 font-semibold">{i + 1}</td>
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                          {typeof val === 'object' && val !== null ? (
                            <ExpandableJsonCell value={val} />
                          ) : (
                            typeof val === 'number' ? val.toFixed(2) : val
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(generatedData.samples || generatedData).length > 100 && (
              <div className="bg-gray-50 px-4 py-3 text-sm text-gray-400 text-center border-t border-gray-100">
                Showing first 100 rows. Download CSV to see all data.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
