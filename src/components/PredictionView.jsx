import { useState } from 'react';
import { predictionAPI } from '../services/api';

const fieldOptions = {
  "GENERAL_HEALTH": ["Excellent", "Very Good", "Good", "Fair", "Poor"],
  "CHECKUP": ["Within the past year", "Within the past 2 years", "Within the past 5 years", "5 or more years ago", "Never"],
  "EXERCISE": ["Yes", "No"],
  "SKIN_CANCER": ["Yes", "No"],
  "OTHER_CANCER": ["Yes", "No"],
  "DEPRESSION": ["Yes", "No"],
  "DIABETES": ["Yes", "No", "No, pre-diabetes or borderline diabetes", "Yes, but only during pregnancy (female)"],
  "ARTHRITIS": ["Yes", "No"],
  "SEX": ["Male", "Female"],
  "AGE_CATEGORY": ["18-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80+"],
  "SMOKING_HISTORY": ["Yes", "No"]
};

const fieldRanges = {
  "HEIGHT_CM": {
    "min": 91.0,
    "max": 241.0,
    "q1": 163.0,
    "median": 173.0,
    "q3": 180.0,
    "iqr_max": 206.0
  },
  "WEIGHT_KG": {
    "min": 24.0,
    "max": 293.0,
    "q1": 68.0,
    "median": 82.0,
    "q3": 95.0,
    "iqr_max": 136.0
  },
  "BMI": {
    "min": 12.02,
    "max": 99.34,
    "q1": 24.03,
    "median": 27.32,
    "q3": 31.52,
    "iqr_max": 42.75
  },
  "ALCOHOL_CONSUMPTION": {
    "min": 0.0,
    "max": 30.0,
    "q1": 0.0,
    "median": 0.0,
    "q3": 2.0,
    "iqr_max": 5.0
  },
  "FRUIT_CONSUMPTION": {
    "min": 0.0,
    "max": 120.0,
    "q1": 8.0,
    "median": 30.0,
    "q3": 30.0,
    "iqr_max": 63.0
  },
  "GREEN_VEGETABLES_CONSUMPTION": {
    "min": 0.0,
    "max": 128.0,
    "q1": 6.0,
    "median": 12.0,
    "q3": 24.0,
    "iqr_max": 51.0
  },
  "FRIED_POTATO_CONSUMPTION": {
    "min": 0.0,
    "max": 120.0,
    "q1": 0.0,
    "median": 4.0,
    "q3": 12.0,
    "iqr_max": 30.0
  }
};

const defaultFormData = {
  GENERAL_HEALTH: "Very Good",
  CHECKUP: "Within the past year",
  EXERCISE: "Yes",
  SKIN_CANCER: "No",
  OTHER_CANCER: "No",
  DEPRESSION: "No",
  DIABETES: "No",
  ARTHRITIS: "No",
  SEX: "Female",
  AGE_CATEGORY: "35-39",
  HEIGHT_CM: 168,
  WEIGHT_KG: 60,
  BMI: 21.3,
  SMOKING_HISTORY: "No",
  ALCOHOL_CONSUMPTION: 1,
  FRUIT_CONSUMPTION: 4,
  GREEN_VEGETABLES_CONSUMPTION: 4,
  FRIED_POTATO_CONSUMPTION: 0
};

export default function PredictionView() {
  const [modelType, setModelType] = useState('dl'); // 'dl' or 'rf'
  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const result = await predictionAPI.predictPatient(formData, modelType);
      setPrediction(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (fieldName, label) => {
    const options = fieldOptions[fieldName];
    const range = fieldRanges[fieldName];
    
    if (options) {
      // Categorical field - use select
      return (
        <div key={fieldName}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <select
            value={formData[fieldName]}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 hover:bg-white transition-all"
          >
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    } else if (range) {
      // Continuous field with range - use number input with min/max
      return (
        <div key={fieldName}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <input
            type="number"
            step="0.01"
            min={range.min}
            max={range.max}
            value={formData[fieldName]}
            onChange={(e) => handleInputChange(fieldName, parseFloat(e.target.value) || 0)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 hover:bg-white transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">
            Range: {range.min} - {range.max} (Median: {range.median})
          </p>
        </div>
      );
    } else {
      // Continuous field without range - use basic number input
      return (
        <div key={fieldName}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <input
            type="number"
            step="0.01"
            value={formData[fieldName]}
            onChange={(e) => handleInputChange(fieldName, parseFloat(e.target.value) || 0)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 hover:bg-white transition-all"
          />
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Patient Health Prediction</h1>
        <p className="text-green-100">
          Use our trained models to predict patient health outcomes
        </p>
      </div>

      {/* Model Selector */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          Select Model
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setModelType('dl')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              modelType === 'dl'
                ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                : 'border-gray-200 bg-gray-50 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <span className="font-semibold text-gray-900">Deep Learning</span>
            </div>
            <p className="text-xs text-gray-600">Neural network-based prediction model</p>
          </button>
          <button
            onClick={() => setModelType('rf')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              modelType === 'rf'
                ? 'border-green-500 bg-green-50 shadow-lg'
                : 'border-gray-200 bg-gray-50 hover:border-green-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold text-gray-900">Random Forest</span>
            </div>
            <p className="text-xs text-gray-600">Ensemble tree-based prediction model</p>
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Patient Information
        </h2>

        <form onSubmit={handlePredict}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Health Status */}
            <div className="col-span-full">
              <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Health Status</h3>
            </div>
            {renderField('GENERAL_HEALTH', 'General Health')}
            {renderField('CHECKUP', 'Last Checkup')}
            {renderField('EXERCISE', 'Regular Exercise')}

            {/* Medical Conditions */}
            <div className="col-span-full mt-4">
              <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Medical Conditions</h3>
            </div>
            {renderField('SKIN_CANCER', 'Skin Cancer')}
            {renderField('OTHER_CANCER', 'Other Cancer')}
            {renderField('DEPRESSION', 'Depression')}
            {renderField('DIABETES', 'Diabetes')}
            {renderField('ARTHRITIS', 'Arthritis')}

            {/* Demographics */}
            <div className="col-span-full mt-4">
              <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Demographics</h3>
            </div>
            {renderField('SEX', 'Sex')}
            {renderField('AGE_CATEGORY', 'Age Category')}

            {/* Physical Measurements */}
            <div className="col-span-full mt-4">
              <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Physical Measurements</h3>
            </div>
            {renderField('HEIGHT_CM', 'Height (cm)')}
            {renderField('WEIGHT_KG', 'Weight (kg)')}
            {renderField('BMI', 'BMI')}

            {/* Lifestyle */}
            <div className="col-span-full mt-4">
              <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Lifestyle</h3>
            </div>
            {renderField('SMOKING_HISTORY', 'Smoking History')}
            {renderField('ALCOHOL_CONSUMPTION', 'Alcohol Consumption (drinks/week)')}
            {renderField('FRUIT_CONSUMPTION', 'Fruit Consumption (servings/week)')}
            {renderField('GREEN_VEGETABLES_CONSUMPTION', 'Green Vegetables (servings/week)')}
            {renderField('FRIED_POTATO_CONSUMPTION', 'Fried Potato (servings/week)')}
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Predicting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>Get Prediction</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Prediction Results */}
      {prediction && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Prediction Results
          </h2>

          <div className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(prediction).map(([key, value]) => (
                <div key={key} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="text-blue-700 font-medium mb-1">Prediction Info</p>
                <p className="text-blue-600">
                  Model used: <strong>{modelType === 'dl' ? 'Deep Learning' : 'Random Forest'}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
