import { useState } from 'react';
import { predict, explainPrediction } from '@/services/api';
import type { ApplicationData, PredictionResponse, ExplainResponse } from '@/types';

export function usePrediction() {
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitApplication = async (data: ApplicationData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await predict(data);
      setResult(response);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchExplanation = async (predictionId: string) => {
    setExplaining(true);
    try {
      const response = await explainPrediction(predictionId);
      setExplanation(response);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setExplaining(false);
    }
  };

  const reset = () => {
    setResult(null);
    setExplanation(null);
    setError(null);
  };

  return {
    result,
    explanation,
    loading,
    explaining,
    error,
    submitApplication,
    fetchExplanation,
    reset,
  };
}