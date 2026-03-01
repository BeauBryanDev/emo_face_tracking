import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine.url import make_url
from app.core.config import settings

# Configure basic logging for database events
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _create_engine_from_settings():
    """
    Create the SQLAlchemy engine with settings that are compatible with both
    PostgreSQL (production) and SQLite (tests/CI).

    - For PostgreSQL: use an explicit connection pool with pre-ping enabled.
    - For SQLite: avoid pool_size/max_overflow which are not supported with
      the default SQLite pools (e.g. SingletonThreadPool).
    """
    database_url = settings.DATABASE_URL
    url = make_url(database_url)

    if url.get_backend_name() == "sqlite":
        # SQLite-specific engine (used mainly in tests / CI)
        # Do NOT pass pool_size/max_overflow – they cause the error you saw:
        # "Invalid argument(s) 'max_overflow' sent to create_engine() ..."
        return create_engine(
            database_url,
            connect_args={"check_same_thread": False},
        )

    # PostgreSQL (and other non-SQLite) engine configuration
    # pool_pre_ping=True ensures that connections are validated before use.
    return create_engine(
        database_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=15,
    )


# Create a module-level engine using the helper above
engine = _create_engine_from_settings()

# SessionLocal is a factory for new Session objects
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all declarative SQLAlchemy models
Base = declarative_base()

def init_db():
    """
    Initializes database prerequisites.
    Crucially, it ensures the pgvector extension is enabled at the database level.
    This must run before any models attempt to use the Vector column type.
    """
    try:
        
        with engine.connect() as connection:
            
            # Execute raw SQL to enable the vector extension
            
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            
            connection.commit()
            
        logger.info("Successfully verified pgvector extension in PostgreSQL.")
        
    except Exception as e:
        
        logger.error(f"Failed to initialize database extensions: {e}")
        
        raise e

# TODO : disable this method as it is already defined in session.py and causes circular imports
def get_db():
    """
    FastAPI dependency function to provide a database session per request.
    Yields a session and safely closes it after the HTTP request completes,
    preventing memory leaks and connection exhaustion.
    """
    db = SessionLocal()
    try:
        
        yield db
        
    finally:
        
        db.close()
