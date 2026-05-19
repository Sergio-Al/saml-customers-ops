-- Enable pgvector extension for semantic search / RAG (Phase 5).
CREATE EXTENSION IF NOT EXISTS vector;

-- Useful UUID generation for default IDs.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
