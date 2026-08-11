import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { predict, explainPrediction } from '@/services/api';
import type { ApplicationData, PredictionResponse } from '@/types';
import { ScoreGauge } from './ScoreGauge';
import { ShapWaterfall } from './ShapWaterfall';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';
import { Card } from './Card';
import { Loader2, Send, RotateCcw } from 'lucide-react';

const defaultValues: ApplicationData = {
  ext_source_1: 0.5,
  ext_source_2: 0.6,
  ext_source_3: 0.7,
  days_birth: -12000,
  days_employed: -3000,
  amt_income_total: 200000,
  amt_credit: 500000,
  amt_annuity: 25000,
  credit_to_income_ratio: 2.5,
  annuity_to_income_ratio: 0.125,
  bureau_active_credits_cnt: 2,
  prev_app_approved_cnt: 1,
};

export function ApplicationForm() {
  const [form, setForm] = useState<ApplicationData>(defaultValues);
  const { data: result, loading, error, execute, reset } = useApi(predict);
  const [explanation, setExplanation] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await execute(form);
    if (res?.prediction_id) {
      try {
        const expl = await explainPrediction(res.prediction_id);
        setExplanation(expl);
      } catch {
        // explain optional
      }
    }
  };

  const update = (field: keyof ApplicationData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: field.includes('cnt') || field === 'days_birth' || field === 'days_employed'
        ? parseInt(value) || 0
        : parseFloat(value) || 0,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Новая заявка</h1>
        <p className="text-muted-foreground mt-1">
          Заполните данные заёмщика для скоринга
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Доход (₽)</Label>
                <Input
                  type="number"
                  value={form.amt_income_total}
                  onChange={(e) => update('amt_income_total', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Сумма кредита (₽)</Label>
                <Input
                  type="number"
                  value={form.amt_credit}
                  onChange={(e) => update('amt_credit', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ежемесячный платёж (₽)</Label>
                <Input
                  type="number"
                  value={form.amt_annuity}
                  onChange={(e) => update('amt_annuity', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Возраст (дней, отриц.)</Label>
                <Input
                  type="number"
                  value={form.days_birth}
                  onChange={(e) => update('days_birth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Стаж (дней, отриц.)</Label>
                <Input
                  type="number"
                  value={form.days_employed}
                  onChange={(e) => update('days_employed', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>EXT_SOURCE_1</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={form.ext_source_1}
                  onChange={(e) => update('ext_source_1', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>EXT_SOURCE_2</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={form.ext_source_2}
                  onChange={(e) => update('ext_source_2', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>EXT_SOURCE_3</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={form.ext_source_3}
                  onChange={(e) => update('ext_source_3', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Активных кредитов в бюро</Label>
                <Input
                  type="number"
                  value={form.bureau_active_credits_cnt}
                  onChange={(e) => update('bureau_active_credits_cnt', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Одобрено предыдущих заявок</Label>
                <Input
                  type="number"
                  value={form.prev_app_approved_cnt}
                  onChange={(e) => update('prev_app_approved_cnt', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Получить скоринг
              </Button>
              <Button type="button" variant="outline" onClick={() => { reset(); setExplanation(null); }}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Сбросить
              </Button>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-sm">
                {error}
              </div>
            )}
          </form>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {result && (
            <>
              <Card className="p-6">
                <ScoreGauge probability={result.probability} decision={result.decision} />
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Вероятность дефолта</p>
                    <p className="text-xl font-bold">{(result.probability * 100).toFixed(1)}%</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Порог</p>
                    <p className="text-xl font-bold">{(result.threshold * 100).toFixed(1)}%</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">Ключевые факторы:</p>
                  <div className="space-y-1.5">
                    {result.top_features.map((f) => (
                      <div
                        key={f.feature}
                        className="flex items-center justify-between rounded-md bg-muted px-3 py-1.5 text-sm"
                      >
                        <span className="font-medium">{f.feature}</span>
                        <span className={f.direction === 'positive' ? 'text-emerald-600' : 'text-rose-600'}>
                          {f.impact > 0 ? '+' : ''}
                          {f.impact.toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {explanation && (
                <Card className="p-4">
                  <ShapWaterfall explanation={explanation} />
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}