import { useEffect } from 'react';
import { usePrediction } from '@/hooks/usePrediction';
import { ScoreGauge } from './ScoreGauge';
import { ShapWaterfall } from './ShapWaterfall';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from './ui';
import { getDecisionBg, getDecisionLabel, formatPercent } from '@/utils/formatters';
import { ArrowLeft, Loader2, RefreshCw, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PredictionResultProps {
  predictionId: string;
}

export function PredictionResult({ predictionId }: PredictionResultProps) {
  const { result, explanation, explaining, fetchExplanation } = usePrediction();
  const navigate = useNavigate();

  useEffect(() => {
    if (predictionId && !explanation) {
      fetchExplanation(predictionId);
    }
  }, [predictionId]);

  if (!result) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center text-muted-foreground">
          Нет данных о предсказании
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate('/apply')} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Новая заявка
      </Button>

      {/* Main Result Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Результат скоринга</CardTitle>
              <CardDescription>
                Модель {result.model_version} • {result.calibrated ? 'Калибровано' : 'Не калибровано'}
              </CardDescription>
            </div>
            <Badge className={getDecisionBg(result.decision)}>
              {getDecisionLabel(result.decision)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <ScoreGauge probability={result.probability} decision={result.decision} />
            
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Вероятность дефолта</p>
                <p className="text-3xl font-bold tabular-nums text-rose-500">
                  {formatPercent(result.probability, 2)}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Порог принятия решения</p>
                <p className="text-xl font-semibold tabular-nums">{formatPercent(result.threshold)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">ID предсказания</p>
                <p className="text-xs font-mono text-muted-foreground">{result.prediction_id}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Ключевые факторы решения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {result.top_features.map((feat, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  {feat.direction === 'positive' ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                  )}
                  <span className="text-sm font-medium">{feat.feature}</span>
                </div>
                <span className={cn(
                  "text-sm font-mono font-semibold",
                  feat.impact > 0 ? 'text-rose-500' : 'text-emerald-500'
                )}>
                  {feat.impact > 0 ? '+' : ''}{feat.impact.toFixed(3)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SHAP Waterfall */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SHAP-интерпретация</CardTitle>
          <CardDescription>
            Как каждый фактор повлиял на вероятность дефолта
          </CardDescription>
        </CardHeader>
        <CardContent>
          {explaining ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ShapWaterfall explanation={explanation} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// helper
import { cn } from './ui';