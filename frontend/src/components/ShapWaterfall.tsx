import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ExplainResponse } from '@/types';

interface ShapWaterfallProps {
  explanation: ExplainResponse | null;
}

export function ShapWaterfall({ explanation }: ShapWaterfallProps) {
  const data = useMemo(() => {
    if (!explanation) return [];
    
    const { features, values } = explanation.waterfall_data;
    return features.map((feature, i) => ({
      feature: feature.length > 25 ? feature.slice(0, 25) + '...' : feature,
      value: values[i],
      fullFeature: feature,
    })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 10);
  }, [explanation]);

  if (!explanation) return null;

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <XAxis type="number" tickFormatter={(v) => v.toFixed(2)} />
          <YAxis dataKey="feature" type="category" width={150} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => [value.toFixed(4), 'SHAP value']}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value >= 0 ? '#f43f5e' : '#10b981'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-rose-500" /> Риск ↑
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-500" /> Риск ↓
        </div>
      </div>
    </div>
  );
}