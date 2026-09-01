# CrossThreat

CrossThreat is a passive cyber-threat forecasting prototype with a Next.js analyst dashboard and a FastAPI inference service. The dashboard consumes the trained artifacts in `data/processed` and replays host-level test windows.

## Prerequisites

Use Node.js 20 or newer and Python 3.10 or newer. The backend dependencies are listed in `requirements.txt`.

## Install

From this directory:

```bash
npm install
python3 -m venv .venv
source .venv/bin/activate          # Windows PowerShell: .venv\\Scripts\\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

The repository currently includes the processed model artifacts required for the demo under `data/processed`. If those artifacts are regenerated, run the data/model scripts from the repository root so their output remains under `data/processed`.

## Run locally

Start the API in one terminal:

```bash
npm run api
```

The API listens at `http://127.0.0.1:8000`. Confirm it is available with:

```bash
curl http://127.0.0.1:8000/api/health
```

Start the dashboard in a second terminal:

```bash
npm run dev
```

Open `http://localhost:3000`. The dashboard uses `http://127.0.0.1:8000` by default. To use another API origin, set `NEXT_PUBLIC_API_URL` before starting Next.js:

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 npm run dev
```

## Validation

Run the same checks used before committing:

```bash
npm run lint
npm run build
python -m py_compile engines/*.py
```

## Runtime configuration

The backend resolves its processed-artifact directory relative to the repository by default. Set `CROSSTHREAT_PROCESSED_DIR` when artifacts are stored elsewhere:

```bash
CROSSTHREAT_PROCESSED_DIR=/path/to/processed python -m engines.server
```

The API exposes `/api/health`, `/api/replay/list`, `/api/replay/host/{host}`, and `/api/generalization`. The replay endpoints use the `Host` column when available and fall back to `Src IP` for older processed-window files.
