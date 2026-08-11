# Credit Scoring — End-to-End ML System

> Полноценная ML-система кредитного скоринга с интерпретацией модели (SHAP), калибровкой вероятностей, бизнес-оптимизацией порога и веб-интерфейсом.

---

## Содержание

- [Архитектура](#архитектура)
- [Датасет](#датасет)
- [Стек технологий](#стек-технологий)
- [Структура проекта](#структура-проекта)
- [ML Pipeline](#ml-pipeline)
- [API](#api)
- [Frontend](#frontend)
- [Docker](#docker)
- [Быстрый старт](#быстрый-старт)
- [Метрики и результаты](#метрики-и-результаты)
- [Roadmap](#roadmap)

---



### Сервисы (Docker)

| Сервис | Технология | Порт | Описание |
|--------|-----------|------|----------|
| `ml-backend` | Python 3.12 + FastAPI | `8000` | ML API, инференс, SHAP |
| `frontend` | Nginx + React build | `3000` | Веб-интерфейс |
| `postgres` | PostgreSQL 16 | `5432` | Логи предсказаний, метрики |
| `prometheus` | Prometheus | `9090` | Сбор метрик |
| `grafana` | Grafana | `9091` | Визуализация метрик |

---

## Датасет

### Home Credit Default Risk (Kaggle)

**Источник:** [Kaggle — Home Credit Default Risk](https://www.kaggle.com/c/home-credit-default-risk)

| Параметр | Значение |
|----------|----------|
| **Размер** | ~307 000 заявок |
| **Целевая переменная** | `TARGET` (0 = погашен, 1 = дефолт) |
| **Дисбаланс классов** | ~92% / 8% (сильный дисбаланс) |
| **Типы признаков** | Числовые, категориальные, временные |
| **Доп. таблицы** | `bureau`, `previous_application`, `POS_CASH_balance`, `credit_card_balance`, `installments_payments` |

### Ключевые признаки (после feature engineering)

| Признак | Описание |
|---------|----------|
| `EXT_SOURCE_1/2/3` | Внешние скоринговые оценки (нормализованные) |
| `DAYS_BIRTH` | Возраст заёмщика (в днях) |
| `DAYS_EMPLOYED` | Стаж на текущем месте работы |
| `AMT_INCOME_TOTAL` | Общий доход |
| `AMT_CREDIT` | Сумма кредита |
| `AMT_ANNUITY` | Ежемесячный платёж |
| `CREDIT_TO_INCOME_RATIO` | Отношение кредита к доходу |
| `ANNUITY_TO_INCOME_RATIO` | Отношение аннуитета к доходу |
| `BUREAU_ACTIVE_CREDITS_CNT` | Количество активных кредитов в бюро |
| `BUREAU_DAYS_CREDIT_MAX` | Максимальный срок с момента открытия кредита в бюро |
| `PREV_APP_APPROVED_CNT` | Количество одобренных предыдущих заявок |
| `POS_CASH_CNT_INSTALMENT_FUTURE_MEAN` | Среднее количество будущих платежей |

### Feature Engineering Pipeline

```
Сырые данные
    │
    ├── Числовые признаки
    │   ├── Логарифмическое преобразование (для right-skewed)
    │   ├── StandardScaler / RobustScaler
    │   └── Ratio features (CREDIT/INCOME, ANNUITY/INCOME и т.д.)
    │
    ├── Категориальные признаки
    │   ├── One-Hot Encoding (для признаков с ≤10 категориями)
    │   ├── Target Encoding (с CV smoothing, для признаков с >10 категориями)
    │   └── WOE Encoding (Weight of Evidence)
    │
    ├── Временные признаки
    │   ├── Агрегации по месяцам (mean, std, max, min, trend)
    │   └── Recency features (дней с последнего события)
    │
    └── Внешние таблицы
        ├── bureau: агрегации по кредитной истории
        ├── previous_application: статистика предыдущих заявок
        ├── POS_CASH_balance: история POS-займов
        ├── credit_card_balance: история кредитных карт
        └── installments_payments: история платежей
```

---

## Стек технологий

### ML / Data Science
- **XGBoost** — основная модель (градиентный бустинг)
- **LightGBM** — baseline для сравнения
- **scikit-learn** — preprocessing, metrics, calibration
- **SHAP** — интерпретация модели (TreeSHAP)
- **imbalanced-learn** — SMOTE, ADASYN для балансировки
- **Optuna** — гиперпараметрическая оптимизация

### Backend
- **FastAPI** — высокопроизводительный async API
- **Pydantic v2** — валидация данных
- **SQLAlchemy 2.0** + **asyncpg** — ORM для PostgreSQL
- **Alembic** — миграции БД
- **Prometheus Client** — метрики
- **pytest** + **httpx** — тестирование

### Frontend
- **React 19** + **TypeScript**
- **Vite** — сборка
- **Tailwind CSS** — стилизация
- **Recharts** — графики (ROC, PR, Calibration)
- **shadcn/ui** — UI-компоненты

### DevOps / Infra
- **Docker** + **Docker Compose**
- **Nginx** — reverse proxy + static files
- **PostgreSQL 16** — реляционная БД
- **Prometheus** + **Grafana** — мониторинг
- **GitHub Actions** — CI/CD

---

## Структура проекта

```
credit-scoring/
├── README.md
├── docker-compose.yml
├── Makefile
│
├── ml/                          # ML пайплайн
│   ├── notebooks/
│   │   ├── 01_eda.ipynb
│   │   ├── 02_feature_engineering.ipynb
│   │   ├── 03_model_training.ipynb
│   │   ├── 04_model_calibration.ipynb
│   │   ├── 05_shap_analysis.ipynb
│   │   └── 06_business_threshold.ipynb
│   ├── src/
│   │   ├── __init__.py
│   │   ├── config.py            # Конфигурация (пути, параметры)
│   │   ├── data_loader.py       # Загрузка и слияние таблиц
│   │   ├── features.py          # Feature engineering
│   │   ├── preprocessing.py     # Preprocessing pipeline
│   │   ├── model.py             # Обучение и валидация
│   │   ├── calibration.py       # Калибровка вероятностей
│   │   ├── threshold.py         # Бизнес-оптимизация порога
│   │   ├── explainability.py    # SHAP analysis
│   │   └── utils.py             # Вспомогательные функции
│   ├── models/                  # Сериализованные артефакты
│   │   ├── xgboost_model.joblib
│   │   ├── calibrator.joblib
│   │   ├── shap_explainer.joblib
│   │   ├── preprocessor.joblib
│   │   └── threshold.json
│   ├── configs/
│   │   └── model_config.yaml
│   ├── tests/
│   │   └── test_pipeline.py
│   └── requirements.txt
│
├── backend/                     # FastAPI сервис
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # Точка входа
│   │   ├── config.py            # Настройки (pydantic-settings)
│   │   ├── models.py            # SQLAlchemy модели
│   │   ├── schemas.py           # Pydantic схемы
│   │   ├── database.py          # Подключение к БД
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── predict.py       # /predict, /predict/batch
│   │   │   ├── explain.py       # /explain/{id}
│   │   │   ├── health.py        # /health
│   │   │   └── metrics.py       # /metrics
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── predictor.py     # Загрузка модели + инференс
│   │   │   ├── explainer.py     # SHAP explanations
│   │   │   └── logger.py        # Логирование в БД
│   │   └── core/
│   │       ├── __init__.py
│   │       ├── exceptions.py    # Кастомные исключения
│   │       └── middleware.py    # CORS, logging, rate limiting
│   ├── alembic/                 # Миграции
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── requirements.txt
│
├── frontend/                    # React приложение
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── ApplicationForm.tsx
│   │   │   ├── ScoreGauge.tsx
│   │   │   ├── ShapWaterfall.tsx
│   │   │   ├── BatchUploader.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── PredictionResult.tsx
│   │   │   └── Layout.tsx
│   │   ├── hooks/
│   │   │   ├── usePrediction.ts
│   │   │   └── useApi.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── utils/
│   │       └── formatters.ts
│   ├── public/
│   ├── index.html
│   ├── Dockerfile
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── monitoring/                  # Prometheus + Grafana
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── grafana/
│       └── dashboards/
│           └── credit_scoring.json
│
└── scripts/
    ├── download_data.sh         # Скачивание датасета
    ├── train_model.sh           # Обучение модели
    └── run_tests.sh             # Запуск тестов
```

---

## ML Pipeline

### 1. EDA (Exploratory Data Analysis)
- Анализ распределения признаков
- Корреляционный анализ
- Анализ пропусков и выбросов
- Визуализация дисбаланса классов

### 2. Feature Engineering
- Создание ratio-признаков
- Агрегации по внешним таблицам
- Target encoding с CV smoothing
- WOE encoding для категориальных
- Временные агрегации

### 3. Обучение модели
```python
# Основная модель
model = xgboost.XGBClassifier(
    n_estimators=5000,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    scale_pos_weight=11.4,  # Для балансировки классов
    eval_metric='auc',
    early_stopping_rounds=100,
    tree_method='hist',
)

# Stratified K-Fold CV (5 folds)
# Optuna для подбора гиперпараметров
```

### 4. Работа с дисбалансом
- **SMOTE** — синтетическая генерация миноритарного класса
- **Class weights** — взвешивание в функции потерь
- **Stratified CV** — стратифицированная кросс-валидация
- **Threshold tuning** — оптимизация порога классификации

### 5. Калибровка вероятностей
```python
from sklearn.calibration import IsotonicRegression

# После обучения XGBoost
calibrator = IsotonicRegression(out_of_bounds='clip')
calibrator.fit(model.predict_proba(X_val)[:, 1], y_val)

# Калиброванная вероятность
calibrated_proba = calibrator.predict(raw_proba)
```

**Метрики калибровки:**
- **Brier Score** — среднеквадратичная ошибка вероятностей
- **ECE** (Expected Calibration Error) — ожидаемая ошибка калибровки
- **Reliability Diagram** — график калибровки

### 6. Интерпретация (SHAP)
```python
import shap

explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Глобальная интерпретация
shap.summary_plot(shap_values, X_test)

# Локальная интерпретация (для одной заявки)
shap.waterfall_plot(shap.Explanation(
    values=shap_values[i],
    base_values=explainer.expected_value,
    data=X_test.iloc[i],
    feature_names=X_test.columns
))
```

### 7. Бизнес-оптимизация порога

```python
# Cost-sensitive threshold optimization
# FP (False Positive) = $5,000  — одобрили дефолтера
# FN (False Negative) = $500    — отказали надёжному клиенту

from sklearn.metrics import confusion_matrix

thresholds = np.linspace(0.01, 0.99, 100)
costs = []

for t in thresholds:
    y_pred = (proba >= t).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    cost = fp * 5000 + fn * 500
    costs.append(cost)

optimal_threshold = thresholds[np.argmin(costs)]
```

---

## API

### Endpoints

#### `POST /predict`
Предсказание для одной заявки.

**Request:**
```json
{
  "ext_source_1": 0.5,
  "ext_source_2": 0.6,
  "ext_source_3": 0.7,
  "days_birth": -12000,
  "days_employed": -3000,
  "amt_income_total": 200000,
  "amt_credit": 500000,
  "amt_annuity": 25000,
  "credit_to_income_ratio": 2.5,
  "annuity_to_income_ratio": 0.125,
  "bureau_active_credits_cnt": 2,
  "prev_app_approved_cnt": 1
}
```

**Response:**
```json
{
  "prediction_id": "uuid",
  "probability": 0.234,
  "decision": "approve",
  "threshold": 0.35,
  "shap_values": {
    "ext_source_2": -0.45,
    "credit_to_income_ratio": 0.32,
    "days_employed": -0.18
  },
  "top_features": [
    {"feature": "ext_source_2", "impact": -0.45, "direction": "positive"},
    {"feature": "credit_to_income_ratio", "impact": 0.32, "direction": "negative"}
  ],
  "calibrated": true,
  "model_version": "1.0.0"
}
```

#### `POST /predict/batch`
Batch inference для CSV-файла.

**Request:** `multipart/form-data` с файлом CSV.

**Response:**
```json
{
  "batch_id": "uuid",
  "predictions": [
    {"id": 1, "probability": 0.234, "decision": "approve"},
    {"id": 2, "probability": 0.789, "decision": "reject"}
  ],
  "summary": {
    "total": 1000,
    "approved": 850,
    "rejected": 150
  }
}
```

#### `GET /explain/{prediction_id}`
SHAP-интерпретация для конкретного предсказания.

**Response:**
```json
{
  "prediction_id": "uuid",
  "base_value": 0.08,
  "shap_values": [...],
  "waterfall_data": {
    "features": [...],
    "values": [...],
    "cumulative": [...]
  }
}
```

#### `GET /health`
Health check сервиса.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "calibrator_loaded": true,
  "db_connected": true,
  "model_version": "1.0.0",
  "timestamp": "2026-08-08T11:46:00Z"
}
```

#### `GET /metrics`
Prometheus-метрики.

---

## Frontend

### Экраны

1. **Форма заявки** — ввод данных заёмщика с валидацией
2. **Результат** — Score Gauge (0–100), вердикт, вероятность
3. **Интерпретация** — SHAP Waterfall: какие факторы повлияли
4. **Batch Upload** — drag-n-drop CSV, таблица результатов
5. **Dashboard** — метрики модели, графики ROC/PR/Calibration

### Score Gauge

```
0 ─────── 35 ─────── 65 ─────── 100
   🔴 reject  🟡 review  🟢 approve
```

- **0–35**: Отказ (красная зона)
- **35–65**: Ручной review (жёлтая зона)
- **65–100**: Одобрение (зелёная зона)

---

## Docker

### Запуск всего стека

```bash
# Клонирование
 git clone https://github.com/yourusername/credit-scoring.git
 cd credit-scoring

# Запуск
 docker-compose up --build

# Сервисы будут доступны:
# Frontend:    http://localhost:3000
# API Docs:    http://localhost:8000/docs
# Prometheus:  http://localhost:9090
# Grafana:     http://localhost:9091
```

### Структура docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: credit_scoring
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres

  ml-backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - postgres
    volumes:
      - ./ml/models:/app/models:ro
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:postgres@postgres/credit_scoring

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - ml-backend

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus:/etc/prometheus

  grafana:
    image: grafana/grafana
    ports:
      - "9091:3000"
    volumes:
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
```

---

## Быстрый старт

### Локальная разработка (без Docker)

```bash
# 1. Клонирование
 git clone https://github.com/yourusername/credit-scoring.git
 cd credit-scoring

# 2. ML Pipeline
 cd ml
 python -m venv venv
 source venv/bin/activate  # Windows: venv\Scripts\activate
 pip install -r requirements.txt
 python src/train.py

# 3. Backend
 cd ../backend
 python -m venv venv
 source venv/bin/activate
 pip install -r requirements.txt
 alembic upgrade head
 uvicorn app.main:app --reload

# 4. Frontend
 cd ../frontend
 npm install
 npm run dev
```

---

## Метрики и результаты

### Целевые метрики

| Метрика | Целевое значение | Описание |
|---------|-----------------|----------|
| **ROC-AUC** | ≥ 0.80 | Способность модели ранжировать |
| **PR-AUC** | ≥ 0.50 | Качество на миноритарном классе |
| **Brier Score** | ≤ 0.10 | Качество калибровки вероятностей |
| **ECE** | ≤ 0.05 | Ожидаемая ошибка калибровки |
| **Precision@0.35** | ≥ 0.30 | Точность на оптимальном пороге |
| **Recall@0.35** | ≥ 0.70 | Полнота на оптимальном пороге |

### Ожидаемые результаты

| Модель | ROC-AUC | PR-AUC | Brier Score |
|--------|---------|--------|-------------|
| Logistic Regression (baseline) | 0.72 | 0.12 | 0.089 |
| LightGBM | 0.79 | 0.24 | 0.082 |
| **XGBoost (основная)** | **0.81** | **0.28** | **0.078** |
| XGBoost + Calibration | 0.81 | 0.28 | **0.065** |

### Бизнес-метрики

| Сценарий | Оптимальный порог | Ожидаемая экономия |
|----------|------------------|-------------------|
| Без оптимизации (0.50) | 0.50 | baseline |
| С оптимизацией порога | 0.35 | -15% потерь |

---

## Roadmap

- [x] EDA и feature engineering
- [x] Обучение XGBoost + LightGBM
- [x] Калибровка вероятностей (Isotonic)
- [x] SHAP-интерпретация
- [x] Бизнес-оптимизация порога
- [x] FastAPI backend
- [x] React frontend
- [x] Docker + Docker Compose
- [ ] Prometheus + Grafana мониторинг
- [ ] MLflow / Weights & Biases для трекинга экспериментов
- [ ] Airflow DAG для переобучения модели
- [ ] A/B тестирование моделей
- [ ] Feature Store (Feast)
- [ ] Модель дрейфа данных (Evidently AI)

---

## Лицензия

MIT License

---

## Автор

[Egor] — Data Scientist / ML Engineer

---

> Этот проект создан для образовательных целей и портфолио. Не используйте его в production без дополнительной валидации и compliance-проверок.
