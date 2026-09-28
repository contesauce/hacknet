CREATE TABLE IF NOT EXISTS saves (
  sub TEXT PRIMARY KEY,      -- Google account id (JWT `sub`)
  email TEXT NOT NULL,
  state TEXT NOT NULL,       -- serialized GameState, JSON
  updated_at INTEGER NOT NULL
);
