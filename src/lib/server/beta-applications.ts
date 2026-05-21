import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  normalizeBetaApplicationInput,
  serializeBetaApplicationRecord,
  type BetaApplicationRecord,
} from '@/lib/server/beta-application-schema';

const DEFAULT_DB_PATH = path.join(process.cwd(), 'data', 'beta-applications.sqlite');

let database: Database.Database | null = null;

export type CreateBetaApplicationParams = {
  payload: unknown;
  requestId: string;
  userAgent: string | null;
  referrer: string | null;
};

export function createBetaApplication({
  payload,
  requestId,
  userAgent,
  referrer,
}: CreateBetaApplicationParams) {
  const normalized = normalizeBetaApplicationInput(payload);
  const db = getDatabase();
  const submittedAt = new Date().toISOString();
  const publicId = generatePublicId();
  const meta = JSON.stringify({
    raw_payload: normalized.raw_payload,
    request_id: requestId,
    normalized_aliases: normalized.normalized_aliases,
    user_agent: userAgent,
    referrer,
  });

  const result = db
    .prepare(
      `INSERT INTO beta_applications (
        public_id,
        name,
        company_name,
        contact,
        team_size,
        review_status,
        slot_status,
        source,
        submitted_at,
        meta
      ) VALUES (
        @public_id,
        @name,
        @company_name,
        @contact,
        @team_size,
        'pending',
        'unassigned',
        @source,
        @submitted_at,
        @meta
      )`,
    )
    .run({
      public_id: publicId,
      name: normalized.name,
      company_name: normalized.company_name,
      contact: normalized.contact,
      team_size: normalized.team_size,
      source: normalized.source,
      submitted_at: submittedAt,
      meta,
    });

  const record = db
    .prepare(
      `SELECT
        id,
        public_id,
        name,
        company_name,
        contact,
        team_size,
        review_status,
        slot_status,
        source,
        submitted_at
      FROM beta_applications
      WHERE id = ?`,
    )
    .get(result.lastInsertRowid) as BetaApplicationRecord | undefined;

  if (!record) {
    throw new Error('Failed to load created beta application');
  }

  return {
    record: serializeBetaApplicationRecord(record),
  };
}

function getDatabase() {
  if (database) {
    return database;
  }

  const configuredPath = process.env.BETA_DB_PATH;
  const resolvedPath = configuredPath
    ? path.resolve(configuredPath)
    : DEFAULT_DB_PATH;
  mkdirSync(path.dirname(resolvedPath), { recursive: true });

  const db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('user_version = 1');

  db.exec(`
    CREATE TABLE IF NOT EXISTS beta_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      public_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      company_name TEXT NOT NULL,
      contact TEXT NOT NULL,
      team_size TEXT,
      review_status TEXT NOT NULL DEFAULT 'pending',
      slot_status TEXT NOT NULL DEFAULT 'unassigned',
      source TEXT NOT NULL DEFAULT 'landing_page',
      submitted_at TEXT NOT NULL,
      meta TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_beta_applications_public_id
      ON beta_applications(public_id);

    CREATE INDEX IF NOT EXISTS idx_beta_applications_submitted_at
      ON beta_applications(submitted_at);

    CREATE INDEX IF NOT EXISTS idx_beta_applications_company_name
      ON beta_applications(company_name);

    CREATE INDEX IF NOT EXISTS idx_beta_applications_contact
      ON beta_applications(contact);

    CREATE INDEX IF NOT EXISTS idx_beta_applications_review_status
      ON beta_applications(review_status);

    CREATE INDEX IF NOT EXISTS idx_beta_applications_source
      ON beta_applications(source);
  `);

  database = db;
  return db;
}

function generatePublicId() {
  return `BTA${randomBytes(6).toString('hex').toUpperCase()}`;
}
