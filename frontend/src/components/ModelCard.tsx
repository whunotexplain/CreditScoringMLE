import { Card } from './Card';
import { Activity, Calendar, Hash, Gauge, BookOpen } from 'lucide-react';

export function ModelCard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Model Card</h1>
        <p className="text-muted-foreground mt-1">
          Документация модели кредитного скоринга
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Общая информация</h3>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Версия</dt>
              <dd className="font-medium">v1.0.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Алгоритм</dt>
              <dd className="font-medium">XGBoost (gradient boosting)</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Дата обучения</dt>
              <dd className="font-medium">2024-08-01</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Размер датасета</dt>
              <dd className="font-medium">307,511 заявок</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Метрики качества</h3>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">ROC-AUC</dt>
              <dd className="font-medium">0.81</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">PR-AUC</dt>
              <dd className="font-medium">0.28</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Brier Score</dt>
              <dd className="font-medium">0.065</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Gini</dt>
              <dd className="font-medium">0.62</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Описание модели</h3>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            Модель предназначена для оценки вероятности дефолта физических лиц при выдаче потребительских кредитов. 
            Обучена на данных Home Credit Default Risk (Kaggle).
          </p>
          <p>
            <strong>Входные признаки:</strong> демографические данные, доход, кредитная история из бюро, 
            поведенческие данные по предыдущим продуктам (всего 247 признаков после feature engineering).
          </p>
          <p>
            <strong>Калибровка:</strong> применяется Isotonic Regression для корректировки вероятностей, 
            что критично для бизнес-оптимизации порога.
          </p>
          <p>
            <strong>Ограничения:</strong> модель обучена на данных 2016–2018 гг. и может не отражать 
            актуальные экономические условия. Клиенты без кредитной истории представлены недостаточно (&lt;5%).
          </p>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Fairness & Регуляторика</h3>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Проведена проверка на демографическое смещение:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Разница AUC по полу: &lt; 0.01 (приемлемо)</li>
            <li>Разница AUC по возрастным группам: &lt; 0.02 (приемлемо)</li>
            <li>Модель использует SHAP для объяснения каждого решения</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}