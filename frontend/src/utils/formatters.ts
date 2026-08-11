export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercent = (value: number, digits = 1): string => {
  return `${(value * 100).toFixed(digits)}%`;
};

export const formatScore = (probability: number): number => {
  return Math.round((1 - probability) * 1000);
};

export const getDecisionColor = (decision: string): string => {
  switch (decision) {
    case 'approve': return 'text-emerald-500';
    case 'reject': return 'text-rose-500';
    case 'review': return 'text-amber-500';
    default: return 'text-slate-500';
  }
};

export const getDecisionBg = (decision: string): string => {
  switch (decision) {
    case 'approve': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
    case 'reject': return 'bg-rose-500/10 border-rose-500/20 text-rose-500';
    case 'review': return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
    default: return 'bg-slate-500/10 border-slate-500/20 text-slate-500';
  }
};

export const getDecisionLabel = (decision: string): string => {
  switch (decision) {
    case 'approve': return 'Одобрено';
    case 'reject': return 'Отказ';
    case 'review': return 'На рассмотрении';
    default: return decision;
  }
};