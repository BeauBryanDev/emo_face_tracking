# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> This project was built by the owner before Claude's involvement. Claude's role is to assist with testing, debugging, and improvements — not to rebuild or over-engineer.

## Project Overview

**FaceEmotionTrackAI** is a real-time face analysis system providing face detection, emotion recognition, liveness detection, and biometric similarity matching via a streaming WebSocket API.

**Tech Stack**: FastAPI (Python 3.12) · PostgreSQL + pgvector · ONNX Runtime · React 18 + Vite + Three.js · Docker

**ML Pipeline order**: SCRFD (detection) → MiniFASNetV2 (liveness) → ArcFace (512D embeddings) → EmotiEffLib (emotion)

## Commands

### Backend (via Docker)

```bash
# Run all tests
docker exec emotrack_backend pytest

# Run a specific test file
docker exec emotrack_backend pytest tests/test_integration_auth.py

# Run with verbose + print output
docker exec emotrack_backend pytest tests/test_integration_auth.py -v -s

# Lint (ruff)
docker exec emotrack_backend ruff check app/

# Database migrations
docker exec emotrack_backend alembic revision --autogenerate -m "description"
docker exec emotrack_backend alembic upgrade head

# Debug access
docker logs emotrack_backend
docker exec -it emotrack_backend bash
docker exec emotrack_backend psql -U beauAdmin -d emotrack
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # Vite dev server
npm run build     # Production build
npm run preview   # Preview production build
```

### Docker Compose

```bash
docker compose up --build     # Start all services
docker compose down           # Stop all services
```

## Critical Rules

### No modifications to `app/` without explicit request
- **Never** edit `backend/app/` production code unless asked
- Test fixes go in `backend/tests/` only — use mocks and dependency overrides
- Report bugs found in `app/` to the user first

### Before committing / making architectural changes
- Ask the user before committing, adding dependencies, or changing architecture
- Never commit `.env` files or credentials

## Architecture

### Backend (`backend/app/`)

| Layer | Path | Purpose |
|-------|------|---------|
| Routers | `api/routers/` | auth, users, emotions, inference, analytics |
| WebSocket | `api/websockets/stream.py` | `/ws/stream` — real-time frame analysis |
| WS Manager | `api/websockets/manager.py` | Connection registry `{user_id → WebSocket}` |
| Config | `core/config.py` | Pydantic settings from environment |
| DB init | `core/database.py` | Engine, `init_db()`, `get_db` dependency |
| Session | `core/session.py` | Second `get_db` dependency (used by auth/users) |
| Security | `core/security.py` | JWT, password hashing (passlib + bcrypt) |
| ML Engine | `services/inference_engine.py` | Singleton loading all 4 ONNX models |
| Face Geometry | `services/face_geometry.py` | EAR/MAR/head-pose from 5-point landmarks |
| Face Math | `services/face_math.py` | Cosine similarity, PCA reduction |
| Analytics | `services/analytics.py` | PCA aggregation pipeline for embeddings |
| Models | `models/` | User, Emotion, FaceSessionEmbedding ORM models |
| ML Weights | `ml_weights/` | `.onnx` model files (not in version control) |

**`get_db` exists in TWO modules**: `core/session.py` and `core/database.py`. Different routers import from different sources. This matters for tests (see below).

### WebSocket Frame Response
`/ws/stream?token=<jwt>` returns per-frame JSON:
```json
{
  "status": "success",
  "bbox": [x1, y1, x2, y2],
  "liveness": {"is_live": bool, "score": 0.0},
  "biometrics": {"is_match": bool, "similarity_score": 0.0},
  "emotion": {"dominant_emotion": "string", "confidence": 0.0, "emotion_scores": {}},
  "geometry": {"ear": {}, "mar": {}, "head_pose": {}, "expressions": {}},
  "metrics": {"face_detection_ms": 0.0},
  "analytics": {"timestamp": 0.0, "ear": 0.0, "mar": 0.0}
}
```

### Frontend (`frontend/src/`)
React 18 + Vite + Tailwind. Key directories: `api/` (axios wrappers), `components/`, `pages/`, `hooks/`, `context/`, `core/` (WebSocket client). Uses **Three.js + @react-three/fiber** for 3D PCA scatter plot visualization, **Recharts** for 2D charts.

## Testing

### Integration Test Pattern

```python
from contextlib import asynccontextmanager
from sqlalchemy.pool import StaticPool

# 1. Override lifespan BEFORE creating TestClient — prevents ML loading + PG connection
@asynccontextmanager
async def _empty_lifespan(_app):
    yield

app.router.lifespan_context = _empty_lifespan

# 2. Shared in-memory SQLite — regular sqlite:// creates a separate DB per connection!
SQLITE_URL = "sqlite:///:memory:?cache=shared"

@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(
        SQLITE_URL,
        connect_args={"check_same_thread": False, "uri": True},
        poolclass=StaticPool,
    )
    _patch_vector_columns()
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()

# 3. Override BOTH get_db imports — routers import from different modules
from app.core.session import get_db as session_get_db
from app.core.database import get_db as database_get_db

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[session_get_db] = override_get_db
    app.dependency_overrides[database_get_db] = override_get_db
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
```

**Symptom when only one `get_db` is overridden**: API reads return empty results even though test data was inserted — the route silently queries real PostgreSQL.

### Patching PostgreSQL Types for SQLite

```python
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Text
from sqlalchemy.types import TypeDecorator

class VectorAsText(TypeDecorator):
    impl = Text
    cache_ok = True
    def process_bind_param(self, value, dialect):
        return str(list(value)) if value is not None else None
    def process_result_value(self, value, dialect):
        import ast
        return ast.literal_eval(value) if value is not None else None

class JsonAsText(TypeDecorator):
    """Use this — NOT plain Text() — for JSONB columns; plain Text() breaks dict inserts."""
    impl = Text
    cache_ok = True
    def process_bind_param(self, value, dialect):
        import json
        return json.dumps(value) if value is not None else None
    def process_result_value(self, value, dialect):
        import json
        try:
            return json.loads(value) if value is not None else None
        except (ValueError, TypeError):
            return value

def _patch_vector_columns():
    for mapper in Base.registry.mappers:
        for column in mapper.mapped_table.columns:
            if isinstance(column.type, Vector):
                column.type = VectorAsText()
            elif isinstance(column.type, JSONB):
                column.type = JsonAsText()  # NOT Text() — Text() breaks dict inserts
```

## Known Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|---------|
| `no such table: users` in tests | `sqlite://` creates separate DB per connection | Use `sqlite:///:memory:?cache=shared` + `StaticPool` |
| `ValueError: password cannot be longer than 72 bytes` | passlib 1.7.4 incompatible with bcrypt ≥ 5.0 | Pin `bcrypt==4.0.1` in requirements.txt |
| API returns empty results despite test data | Only one `get_db` override applied | Override **both** `session.get_db` and `database.get_db` |
| `ProgrammingError: type 'dict' is not supported` | JSONB patched to `Text()` | Use `JsonAsText` TypeDecorator instead |

## Face Geometry Details

File: `app/services/face_geometry.py`

- **EAR** (Eye Aspect Ratio): blink threshold `0.22`, drowsiness threshold `0.18`
- **MAR** (Mouth Aspect Ratio): yawn/talking detection
- **Head pose**: SolvePnP → direct Euler angle extraction from rotation matrix (NOT `decomposeHomographyMat` — that had bugs)
- **SCRFD 5-point landmarks**: index 0=left eye, 1=right eye, 2=nose, 3=mouth-left, 4=mouth-right

## Critical Version Pins

```
bcrypt==4.0.1         # passlib 1.7.4 compatibility
passlib[bcrypt]==1.7.4
numpy==1.26.4
onnxruntime==1.20.0
sqlalchemy==2.0.35
pgvector==0.3.6
fastapi==0.110.0
```

## Resources

- Detailed test fix notes: `privates/test_int_auth_fix.txt`
- Working test examples: `backend/tests/test_integration_auth.py`, `backend/tests/test_integration_emotions.py`
- Canonical fixtures: `backend/tests/conftest.py`
- Container names: `emotrack_backend` (API), `emotrack_db` (PostgreSQL), `emotrack_frontend` (React)
