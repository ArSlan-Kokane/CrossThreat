# Environment Configuration for CrossThreat

## Frontend (.env.local)

```bash
# API Backend URL
# Default: http://127.0.0.1:8000
# Override for custom backend locations
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Backend (Python)

### Environment Variables

```bash
# Processed data directory
# Default: ./data/processed
# Override to use pre-trained models from different location
CROSSTHREAT_PROCESSED_DIR=/path/to/processed

# Frontend URL (for CORS whitelist)
# Add additional frontend origins for deployment
FRONTEND_URL=http://localhost:3000
```

### Running the Backend

**Development:**
```bash
# With defaults
npm run api

# With custom processed directory
CROSSTHREAT_PROCESSED_DIR=/path/to/models npm run api

# With custom CORS frontend origin
FRONTEND_URL=https://myapp.com npm run api
```

**Production:**
```bash
# Using uvicorn directly with host binding
CROSSTHREAT_PROCESSED_DIR=/prod/models \
FRONTEND_URL=https://production-domain.com \
  python -m uvicorn engines.server:app --host 0.0.0.0 --port 8000 --workers 4
```

## Docker Example

**Dockerfile:**
```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY crossthreat/ ./crossthreat/
COPY data/processed/ ./data/processed/

ENV CROSSTHREAT_PROCESSED_DIR=/app/data/processed
ENV FRONTEND_URL=https://frontend-domain.com

EXPOSE 8000
CMD ["python", "-m", "uvicorn", "engines.server:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      CROSSTHREAT_PROCESSED_DIR: /app/data/processed
      FRONTEND_URL: http://localhost:3000

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8000
    depends_on:
      - backend
```

## API Documentation

Once backend is running:

- **Swagger UI:** `http://127.0.0.1:8000/api/docs`
- **ReDoc:** `http://127.0.0.1:8000/api/redoc`
- **OpenAPI Schema:** `http://127.0.0.1:8000/openapi.json`

## Troubleshooting

### Backend connection fails
1. Verify backend is running: `curl http://127.0.0.1:8000/api/health`
2. Check `NEXT_PUBLIC_API_URL` environment variable
3. Ensure CORS is not blocking requests (check browser console)
4. Verify firewall allows port 8000

### CORS errors
1. Add frontend URL to `FRONTEND_URL` environment variable
2. Restart backend
3. Clear browser cache and reload

### Data pipeline issues
1. Verify `CROSSTHREAT_PROCESSED_DIR` exists and contains required pickle files
2. Required files: `metadata.pkl`, `baseline_model.pkl`, `temporal_model.pth`, `test_windows.pkl`
3. Check file permissions: `ls -la /path/to/processed/`
