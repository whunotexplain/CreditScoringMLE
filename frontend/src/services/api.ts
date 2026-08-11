import axios from 'axios';
import type {
  ApplicationData,
  PredictionResponse,
  ExplainResponse,
  HealthResponse,
  BatchResponse,
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'Unknown error';
    return Promise.reject(new Error(message));
  }
);

export const predict = async (data: ApplicationData): Promise<PredictionResponse> => {
  const response = await api.post<PredictionResponse>('/predict', data);
  return response.data;
};

export const predictBatch = async (file: File): Promise<BatchResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<BatchResponse>('/predict/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const explainPrediction = async (predictionId: string): Promise<ExplainResponse> => {
  const response = await api.get<ExplainResponse>(`/explain/${predictionId}`);
  return response.data;
};

export const healthCheck = async (): Promise<HealthResponse> => {
  const response = await api.get<HealthResponse>('/health');
  return response.data;
};

export const getMetrics = async () => {
  const response = await api.get('/metrics');
  return response.data;
};

export default api;