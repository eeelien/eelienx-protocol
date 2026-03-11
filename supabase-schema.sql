-- ================================================
-- eelienx-protocol — Supabase Schema
-- Ejecuta esto en Supabase SQL Editor
-- ================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  encrypted_master_key TEXT NOT NULL,  -- masterKey cifrada con contraseña del usuario
  pbkdf_salt TEXT NOT NULL,            -- salt aleatorio para PBKDF2 (NO el email)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exchange TEXT NOT NULL,              -- 'bitso', 'binance', 'bybit', 'ledger', 'metamask'
  encrypted_api_key TEXT NOT NULL,     -- cifrada con llave personal del usuario
  encrypted_api_secret TEXT NOT NULL,  -- cifrada con llave personal del usuario
  balance_snapshot JSONB,              -- snapshot de balance (considerar cifrar también)
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, exchange)
);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Solo el service_role puede acceder (las API routes lo usan)
-- Los usuarios NO acceden directamente a la DB desde el browser
