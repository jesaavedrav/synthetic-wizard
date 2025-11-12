// En desarrollo, usa el proxy de Vite (/api)
// En producción, usa la variable de entorno o el backend directo
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');

export const datasetsAPI = {
  // Get list of available datasets
  getDatasets: async () => {
    const response = await fetch(`${API_BASE_URL}/datasets`);
    if (!response.ok) {
      throw new Error('Failed to fetch datasets');
    }
    const data = await response.json();
    // La API devuelve: { datasets: [...], total_count: number }
    return data.datasets || [];
  }
};

export const trainingAPI = {
  // Get available training methods
  getMethods: async () => {
    const response = await fetch(`${API_BASE_URL}/train/methods`);
    if (!response.ok) {
      throw new Error('Failed to fetch training methods');
    }
    const data = await response.json();
    // La API devuelve: { methods: [...], default_method: string }
    return data.methods || [];
  },

  // Start a training task
  startTraining: async (dataset_path, epochs, method, model_name = 'cardiovascular_model', batch_size = null, overwrite_existing = false) => {
    const body = {
      dataset_path,
      method: method, // El método ya viene en el formato correcto del backend
      model_name, // Nombre base sin sufijo del método
      overwrite_existing
    };
    
    // Solo agregar epochs si se proporciona y no es null
    if (epochs !== null && epochs !== undefined) {
      body.epochs = epochs;
    }
    
    // Solo agregar batch_size si se proporciona y no es null
    if (batch_size !== null && batch_size !== undefined) {
      body.batch_size = batch_size;
    }
    
    const response = await fetch(`${API_BASE_URL}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error('Failed to start training');
    }
    return response.json();
  },

  // Get all training tasks
  getTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/train/tasks`);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return response.json();
  },

  // Get status of a specific task
  getTaskStatus: async (task_id) => {
    const response = await fetch(`${API_BASE_URL}/train/status/${task_id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch task status');
    }
    return response.json();
  }
};

export const modelsAPI = {
  // Get list of trained models
  getTrainedModels: async () => {
    const response = await fetch(`${API_BASE_URL}/models`);
    if (!response.ok) {
      throw new Error('Failed to fetch trained models');
    }
    const data = await response.json();
    // La API devuelve: { models: [...], total_count: number }
    return data.models || [];
  }
};

export const generateAPI = {
  // Generate synthetic data
  // Nota: Actualmente el endpoint usa el modelo por defecto 'cardiovascular_model'
  // Los parámetros model_name y method están preparados para futura actualización del backend
  generateData: async (num_samples = 100, send_to_kafka = false, model_name = null, method = null) => {
    const body = {
      num_samples,
      send_to_kafka
    };
    
    // Si el backend soporta estos parámetros en el futuro, se enviarán
    if (model_name) body.model_name = model_name;
    if (method) body.method = method;
    
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error('Failed to generate data');
    }
    return response.json();
  }
};

