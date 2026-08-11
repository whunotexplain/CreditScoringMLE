import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { healthCheck, getMetrics } from '@/services/api';
import type { HealthResponse } from '@/types';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Database,
  Server,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { cn } from './ui';

function StatusCard({
  title,
  status,
  icon: Icon,
  detail,
}: {
  title: string;
  status: 'ok' | 'warn' | 'error';
  icon: React.ElementType;
  detail?: string;
}) {
  const colors = {
    ok: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    warn: 'bg-amber-500/10 text-amber-600 border-amber-200',
    error: 'bg-rose-500/10 text-rose-600 border-rose-200',
  };

  return (
    <div className={cn('rounded-xl border p-4', colors[status])}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="mt-1 text-2xl font-bold">
            {status === 'ok' ? 'OK' : status === 'warn' ? 'WARN' : 'ERR'}
          </p>
          {detail && <p className="mt-1 text-xs opacity-70">{detail}</p>}
        </div>
        <Icon className="h-8 w-8 opacity-50" />
      </div>
    </div>
  );
}

export function Dashboard() {
  const { data: health, execute: checkHealth } = useApi(healthCheck);
  const { data: metrics } = useApi(getMetrics);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    checkHealth();
    const interval = setInterval(() => {
      checkHealth();
      setLastCheck(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Дашборд</h1>
        <p className="text-muted-foreground mt-1">
          Мониторинг системы кредитного скоринга · Обновлено: {lastCheck.toLocaleTimeString('ru-RU')}
        </p>
      </div>

      {/* Status Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="ML Service"
          status={health?.model_loaded ? 'ok' : 'error'}
          icon={Server}
          detail={health ? `v${health.model_version}` : undefined}
        />
        <StatusCard
          title="Калибровка"
          status={health?.calibrator_loaded ? 'ok' : 'warn'}
          icon={Activity}
        />
        <StatusCard
          title="База данных"
          status={health?.db_connected ? 'ok' : 'error'}
          icon={Database}
        />
        <StatusCard
          title="API"
          status={health?.status === 'healthy' ? 'ok' : 'error'}
          icon={CheckCircle}
        />
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">ROC-AUC</span>
          </div>
          <p className="text-3xl font-bold">0.81</p>
          <p className="text-xs text-muted-foreground mt-1">Цель: ≥ 0.80</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Всего заявок</span>
          </div>
          <p className="text-3xl font-bold">307,511</p>
          <p className="text-xs text-muted-foreground mt-1">Обучающий датасет</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Дефолт-рейт</span>
          </div>
          <p className="text-3xl font-bold">8.1%</p>
          <p className="text-xs text-muted-foreground mt-1">Исторический показатель</p>
        </div>
      </div>

      {/* Decisions */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Распределение решений</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-emerald-600 font-medium">Одобрено</span>
                <span className="font-bold">72%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[72%] bg-emerald-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-amber-600 font-medium">Ручной review</span>
                <span className="font-bold">15%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[15%] bg-amber-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-rose-600 font-medium">Отказ</span>
                <span className="font-bold">13%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[13%] bg-rose-500 rounded-full" />
              </div>
            </div>
          </div>
          <div className="hidden md:flex gap-6 text-center">
            <div>
              <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-1" />
              <p className="text-sm font-medium">Одобрено</p>
            </div>
            <div>
              <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-1" />
              <p className="text-sm font-medium">Review</p>
            </div>
            <div>
              <XCircle className="h-8 w-8 text-rose-500 mx-auto mb-1" />
              <p className="text-sm font-medium">Отказ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}