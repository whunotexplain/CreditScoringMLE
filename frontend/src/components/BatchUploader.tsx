import { useState, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { predictBatch } from '@/services/api';
import { Button } from './Button';
import { Card } from './Card';
import { Upload, FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import type { BatchResponse } from '@/types';

export function BatchUploader() {
  const [file, setFile] = useState<File | null>(null);
  const { data: result, loading, error, execute, reset } = useApi(predictBatch);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith('.csv')) setFile(f);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    await execute(file);
  };

  const downloadResults = () => {
    if (!result) return;
    const csv = [
      'id,probability,decision',
      ...result.predictions.map((p) => `${p.id},${p.probability},${p.decision}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scoring_results_${result.batch_id}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Batch Scoring</h1>
        <p className="text-muted-foreground mt-1">
          Загрузите CSV-файл с заявками для массовой обработки
        </p>
      </div>

      <Card
        className={`p-8 border-2 border-dashed transition-colors ${file ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/50'}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">
              {file ? file.name : 'Перетащите CSV-файл или выберите'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Файл должен содержать колонки, соответствующие полям заявки
            </p>
          </div>
          {!file && (
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
              />
              <Button type="button" variant="outline" asChild>
                <span>Выбрать файл</span>
              </Button>
            </label>
          )}
          {file && (
            <div className="flex gap-3">
              <Button onClick={handleUpload} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
                Обработать
              </Button>
              <Button variant="ghost" onClick={() => { setFile(null); reset(); }}>
                Удалить
              </Button>
            </div>
          )}
        </div>
      </Card>

      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {result && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Результаты</h3>
            <Button variant="outline" size="sm" onClick={downloadResults}>
              <Download className="mr-2 h-4 w-4" />
              Скачать CSV
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold">{result.summary.total}</p>
              <p className="text-xs text-muted-foreground">Всего</p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{result.summary.approved}</p>
              <p className="text-xs text-emerald-600/70">Одобрено</p>
            </div>
            <div className="rounded-lg bg-rose-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-rose-600">{result.summary.rejected}</p>
              <p className="text-xs text-rose-600/70">Отказ</p>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">ID</th>
                  <th className="px-4 py-2 text-left font-medium">Вероятность</th>
                  <th className="px-4 py-2 text-left font-medium">Решение</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.predictions.slice(0, 20).map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2">{p.id}</td>
                    <td className="px-4 py-2">{(p.probability * 100).toFixed(1)}%</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.decision === 'approve'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : p.decision === 'review'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-rose-500/10 text-rose-600'
                        }`}
                      >
                        {p.decision === 'approve' ? 'Одобрено' : p.decision === 'review' ? 'Review' : 'Отказ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.predictions.length > 20 && (
              <p className="px-4 py-2 text-xs text-muted-foreground bg-muted">
                Показано 20 из {result.predictions.length} записей. Скачайте полный CSV.
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}