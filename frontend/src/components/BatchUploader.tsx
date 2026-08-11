import { useState, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { predictBatch } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from './ui';
import { Upload, FileSpreadsheet, Loader2, Download, CheckCircle } from 'lucide-react';
import type { BatchResponse } from '@/types';

export function BatchUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { execute, loading, data: result } = useApi<BatchResponse>();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    await execute(predictBatch(file));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Batch Scoring</h1>
        <p className="text-muted-foreground mt-2">
          Загрузите CSV-файл с заявками для массовой обработки
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-colors
              ${dragActive ? 'border-primary bg-primary/5' : 'border-border'}
            `}
          >
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">
              {file ? file.name : 'Перетащите CSV-файл или нажмите для выбора'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Поддерживаются файлы до 50MB с колонками из application формы
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button variant="outline" type="button" className="cursor-pointer" asChild>
                <span>Выбрать файл</span>
              </Button>
            </label>
          </div>

          {file && !result && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4" />
                    Запустить скоринг
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-500">
              <CheckCircle className="h-5 w-5" />
              Обработка завершена
            </CardTitle>
            <CardDescription>Batch ID: {result.batch_id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-card border">
                <p className="text-sm text-muted-foreground">Всего</p>
                <p className="text-2xl font-bold">{result.summary.total}</p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-emerald-500/20">
                <p className="text-sm text-emerald-500">Одобрено</p>
                <p className="text-2xl font-bold text-emerald-500">{result.summary.approved}</p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-rose-500/20">
                <p className="text-sm text-rose-500">Отказ</p>
                <p className="text-2xl font-bold text-rose-500">{result.summary.rejected}</p>
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">ID</th>
                    <th className="px-4 py-3 text-left font-medium">Вероятность</th>
                    <th className="px-4 py-3 text-left font-medium">Решение</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {result.predictions.slice(0, 10).map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 font-mono">{p.id}</td>
                      <td className="px-4 py-3">{(p.probability * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        <span className={`
                          inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                          ${p.decision === 'approve' ? 'bg-emerald-500/10 text-emerald-500' : ''}
                          ${p.decision === 'reject' ? 'bg-rose-500/10 text-rose-500' : ''}
                        `}>
                          {p.decision}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.predictions.length > 10 && (
                <p className="px-4 py-3 text-xs text-muted-foreground text-center border-t">
                  Показано 10 из {result.predictions.length} записей
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}