import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrediction } from '@/hooks/usePrediction';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Label } from './ui';
import { Loader2, Send, User, Briefcase, Wallet, CreditCard, Building } from 'lucide-react';
import type { ApplicationData } from '@/types';

const initialData: ApplicationData = {
  ext_source_1: 0.5,
  ext_source_2: 0.5,
  ext_source_3: 0.5,
  days_birth: -12000,
  days_employed: -3000,
  amt_income_total: 200000,
  amt_credit: 500000,
  amt_annuity: 25000,
  credit_to_income_ratio: 2.5,
  annuity_to_income_ratio: 0.125,
  bureau_active_credits_cnt: 0,
  prev_app_approved_cnt: 0,
};

export function ApplicationForm() {
  const [form, setForm] = useState<ApplicationData>(initialData);
  const { submitApplication, loading, error } = usePrediction();
  const navigate = useNavigate();

  const handleChange = (field: keyof ApplicationData, value: string) => {
    const num = parseFloat(value);
    setForm((prev) => ({ ...prev, [field]: isNaN(num) ? 0 : num }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await submitApplication(form);
      navigate(`/result/${result.prediction_id}`);
    } catch {
      // error handled in hook
    }
  };

  const sections = [
    {
      title: 'Внешние скоринги',
      icon: <Building className="h-4 w-4" />,
      fields: [
        { key: 'ext_source_1', label: 'EXT_SOURCE_1', min: 0, max: 1, step: 0.01 },
        { key: 'ext_source_2', label: 'EXT_SOURCE_2', min: 0, max: 1, step: 0.01 },
        { key: 'ext_source_3', label: 'EXT_SOURCE_3', min: 0, max: 1, step: 0.01 },
      ],
    },
    {
      title: 'Личные данные',
      icon: <User className="h-4 w-4" />,
      fields: [
        { key: 'days_birth', label: 'Возраст (дней, отрицательное)', min: -25000, max: -6000, step: 1 },
        { key: 'days_employed', label: 'Стаж работы (дней, отрицательное)', min: -15000, max: 0, step: 1 },
      ],
    },
    {
      title: 'Финансы',
      icon: <Wallet className="h-4 w-4" />,
      fields: [
        { key: 'amt_income_total', label: 'Годовой доход', min: 0, max: 10000000, step: 1000 },
        { key: 'amt_credit', label: 'Сумма кредита', min: 0, max: 10000000, step: 1000 },
        { key: 'amt_annuity', label: 'Ежемесячный платёж', min: 0, max: 500000, step: 100 },
      ],
    },
    {
      title: 'Кредитная история',
      icon: <CreditCard className="h-4 w-4" />,
      fields: [
        { key: 'credit_to_income_ratio', label: 'Кредит / Доход', min: 0, max: 20, step: 0.1 },
        { key: 'annuity_to_income_ratio', label: 'Аннуитет / Доход', min: 0, max: 1, step: 0.01 },
        { key: 'bureau_active_credits_cnt', label: 'Активных кредитов в бюро', min: 0, max: 50, step: 1 },
        { key: 'prev_app_approved_cnt', label: 'Одобренных заявок ранее', min: 0, max: 50, step: 1 },
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Новая заявка</h1>
        <p className="text-muted-foreground mt-2">
          Заполните данные заёмщика для скоринговой оценки
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {section.icon}
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <Input
                      id={field.key}
                      type="number"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={form[field.key as keyof ApplicationData] ?? ''}
                      onChange={(e) => handleChange(field.key as keyof ApplicationData, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="gap-2 min-w-[200px]">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Скоринг...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Отправить на скоринг
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}