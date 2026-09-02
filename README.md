# CrossThreat

CrossThreat is a passive cyber-threat forecasting prototype with a Next.js analyst dashboard and a FastAPI inference service. The dashboard consumes the trained artifacts in `data/processed` and replays network traffic sequences with explainability and MITRE ATT&CK stage mapping.

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.10+
- Backend dependencies: `requirements.txt`

### Install

```bash
npm install
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### Run Locally

**Terminal 1 - Start the API:**
```bash
npm run api
```
The API listens at `http://127.0.0.1:8000`. Verify with:
```bash
curl http://127.0.0.1:8000/api/health
```

**Terminal 2 - Start the dashboard:**
```bash
npm run dev
```
Open `http://localhost:3000`. The dashboard uses `http://127.0.0.1:8000` by default.

To use a different API origin:
```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 npm run dev
```

### Validation

Run pre-commit checks:
```bash
npm run lint
npm run build
python -m py_compile engines/*.py
```

## Runtime Configuration

### Backend

The backend resolves its processed-artifact directory relative to the repository by default. Set `CROSSTHREAT_PROCESSED_DIR` when artifacts are stored elsewhere:

```bash
CROSSTHREAT_PROCESSED_DIR=/path/to/processed python -m engines.server
```

For production deployments with custom frontend URLs:
```bash
FRONTEND_URL=https://myapp.com npm run api
```

### API Endpoints

- `/api/health` - Health check endpoint
- `/api/metadata` - Model metadata and feature schema
- `/api/replay/list` - List available hosts
- `/api/replay/host/{host}` - Get threat replay timeline for a host
- `/api/generalization` - Out-of-distribution generalization results
- `/api/docs` - Swagger UI (interactive API documentation)
- `/api/redoc` - ReDoc (alternative API documentation)

## Architecture

```
Backend (Python/FastAPI)                Frontend (Next.js/React)
├─ engines/server.py (API server)       ├─ app/page.tsx (landing)
│  ├─ baseline_model.py                 ├─ app/layout.tsx (root)
│  ├─ temporal_model.py                 ├��� app/dashboard/page.tsx
│  ├─ evidence_engine.py                └─ lib/api.ts (API client)
│  ├─ stage_mapper.py
│  └─ [other ML engines]
└─ data/processed/
   ├─ metadata.pkl
   ├─ baseline_model.pkl
   ├─ temporal_model.pth
   └─ test_windows.pkl
```

**Data Flow:**
1. Frontend makes requests to `/api/replay/host/{host}` via centralized API client
2. Backend loads scaled features from pickle and runs inference
3. LSTM predicts next-state threat label with confidence
4. Evidence engine generates SHAP attributions (current window) and gradient attributions (temporal sequence)
5. Stage mapper resolves MITRE ATT&CK tactic based on predicted state
6. Response includes: predictions, attributions, rule triggers, metrics
7. Dashboard renders timeline with side-by-side model comparison

## Security

- CORS restricted to whitelisted frontend origins
- Input validation on all API parameters
- Request timeouts prevent hanging operations
- No credentials sent cross-origin
- See `ENVIRONMENT.md` for production deployment security notes

## Documentation

- `ENVIRONMENT.md` - Environment variables and deployment configs
- `INTEGRATION_FIXES.md` - Backend integration improvements summary
- API Docs: `http://127.0.0.1:8000/api/docs` (when backend is running)

## Support

For issues or questions:
1. Check `ENVIRONMENT.md` troubleshooting section
2. Verify health check: `curl http://127.0.0.1:8000/api/health`
3. Review FastAPI docs at `/api/docs`
