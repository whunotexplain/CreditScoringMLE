import { formatScore } from '@/utils/formatters';

interface ScoreGaugeProps {
  probability: number;
  decision: string;
}

export function ScoreGauge({ probability, decision }: ScoreGaugeProps) {
  const score = formatScore(probability);
  const percentage = (score / 1000) * 100;
  
  const getColor = () => {
    if (decision === 'approve') return '#10b981';
    if (decision === 'review') return '#f59e0b';
    return '#f43f5e';
  };

  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg height={radius * 2.5} width={radius * 2.5} className="rotate-[-90deg]">
          <circle
            stroke="#1e293b"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={getColor()}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums">{score}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Score</span>
        </div>
      </div>
      
      <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-rose-500" /> 0–350
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" /> 350–650
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500" /> 650–1000
        </div>
      </div>
    </div>
  );
}