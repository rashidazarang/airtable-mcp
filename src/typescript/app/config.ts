import fs from 'node:fs';
import path from 'node:path';
import { scryptSync } from 'node:crypto';
import { config as loadEnv } from 'dotenv';
import { governanceOutputSchema, GovernanceSnapshot } from './types';
import { GovernanceError } from '../errors';
import { validateApiKey } from './validateApiKey';

loadEnv();

function resolveVersion(): string {
  if (process.env.npm_package_version) return process.env.npm_package_version;
  try {
    const pkgPath = path.resolve(__dirname, '..', '..', '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface AirtableAuthConfig {
  personalAccessToken: string;
  patHash: string;
  defaultBaseId?: string;
  allowedBases: string[];
  tokenFormatWarnings: string[];
}

export interface AppConfig {
  version: string;
  auth: AirtableAuthConfig;
  governance: GovernanceSnapshot;
  logLevel: LogLevel;
  exceptionQueueSize: number;
}

const DEFAULT_EXCEPTION_QUEUE_SIZE = 500;

function parseCsv(value?: string | null): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

/**
 * Creates a short fingerprint of a token for log correlation and rate-limit keying.
 * Uses scrypt (a memory-hard KDF) so the output is a stable, opaque identifier
 * that lets logs correlate requests without exposing the raw PAT.
 * Runs once at startup so the computational cost is negligible.
 */
function fingerprintToken(token: string): string {
  return scryptSync(token, 'airtable-mcp-fingerprint', 16).toString('hex').slice(0, 12);
}

function resolveLogLevel(): LogLevel {
  const raw = (process.env.LOG_LEVEL || 'info').toLowerCase();
  if (raw === 'error' || raw === 'warn' || raw === 'info' || raw === 'debug') {
    return raw;
  }
  return 'info';
}

function determineAllowedBases(defaultBaseId?: string): string[] {
  const fromEnv = parseCsv(process.env.AIRTABLE_ALLOWED_BASES || process.env.AIRTABLE_BASE_ALLOWLIST);
  const baseSet = new Set<string>();
  if (defaultBaseId) {
    baseSet.add(defaultBaseId);
  }
  fromEnv.forEach((base) => baseSet.add(base));
  // Allow empty base list - users can use list_bases tool to discover bases
  // and then specify them dynamically in tool calls
  return Array.from(baseSet);
}

function parseAllowedTables(raw?: string | null): Array<{ baseId: string; table: string }> {
  if (!raw) {
    return [];
  }
  const tables: Array<{ baseId: string; table: string }> = [];
  for (const entry of raw.split(',')) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const [baseId, table] = trimmed.split(':');
    if (!baseId || !table) {
      throw new GovernanceError(
        `Invalid AIRTABLE_ALLOWED_TABLES entry "${trimmed}". Expected format baseId:tableName.`
      );
    }
    tables.push({ baseId: baseId.trim(), table: table.trim() });
  }
  return tables;
}

function readGovernanceFile(): Partial<GovernanceSnapshot> | undefined {
  const explicitPath = process.env.AIRTABLE_GOVERNANCE_PATH;
  const fallbackPath = path.resolve(process.cwd(), 'config', 'governance.json');

  const filePath = explicitPath || fallbackPath;
  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    const partialSchema = governanceOutputSchema.partial();
    const result = partialSchema.parse(parsed) as Partial<GovernanceSnapshot>;
    return result;
  } catch (error) {
    throw new GovernanceError(
      `Failed to parse governance configuration at ${filePath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function buildGovernanceSnapshot(allowedBases: string[]): GovernanceSnapshot {
  const baseSnapshot: GovernanceSnapshot = {
    allowedBases,
    allowedTables: [],
    allowedOperations: ['describe', 'query', 'create', 'update', 'upsert', 'delete', 'manage_schema', 'manage_webhooks', 'manage_comments'],
    piiFields: [],
    redactionPolicy: 'mask_on_inline',
    loggingPolicy: 'minimal',
    retentionDays: 7
  };

  const overrides = readGovernanceFile();

  const envAllowedTables = parseAllowedTables(process.env.AIRTABLE_ALLOWED_TABLES);

  const merged: GovernanceSnapshot = {
    ...baseSnapshot,
    ...(overrides ?? {})
  };

  // Ensure allow-lists include env tables/bases.
  const bases = new Set<string>(merged.allowedBases);
  allowedBases.forEach((base) => bases.add(base));
  merged.allowedBases = Array.from(bases);

  if (overrides?.allowedTables || envAllowedTables.length > 0) {
    const tableSet = new Map<string, { baseId: string; table: string }>();
    (overrides?.allowedTables ?? []).forEach((table) => {
      tableSet.set(`${table.baseId}:${table.table}`, table);
    });
    envAllowedTables.forEach((table) => {
      tableSet.set(`${table.baseId}:${table.table}`, table);
    });
    merged.allowedTables = Array.from(tableSet.values());
  }

  return governanceOutputSchema.parse(merged);
}

export function loadConfig(): AppConfig {
  const personalAccessToken =
    process.env.AIRTABLE_PAT ||
    process.env.AIRTABLE_TOKEN ||
    process.env.AIRTABLE_API_TOKEN ||
    process.env.AIRTABLE_API_KEY;

  if (!personalAccessToken) {
    throw new GovernanceError(
      'Missing Airtable credentials. Set AIRTABLE_PAT (preferred) or AIRTABLE_TOKEN.'
    );
  }

  const defaultBaseId = process.env.AIRTABLE_DEFAULT_BASE ?? process.env.AIRTABLE_BASE_ID ?? process.env.AIRTABLE_BASE;
  const allowedBases = determineAllowedBases(defaultBaseId);
  const governance = buildGovernanceSnapshot(allowedBases);

  // Validate token format and collect warnings
  const tokenValidation = validateApiKey(personalAccessToken);
  if (tokenValidation.warnings.length > 0) {
    // Log a generic count to stderr — individual warnings are available via
    // config.auth.tokenFormatWarnings for display in error messages, but we
    // avoid logging them here to prevent leaking token characteristics.
    console.error(`[airtable-mcp] ${tokenValidation.warnings.length} token format warning(s) detected. Use list_governance tool for details.`);
  }

  const auth: AirtableAuthConfig = {
    personalAccessToken,
    patHash: fingerprintToken(personalAccessToken),
    allowedBases,
    tokenFormatWarnings: tokenValidation.warnings
  };
  if (defaultBaseId) {
    auth.defaultBaseId = defaultBaseId;
  }

  return {
    version: resolveVersion(),
    auth,
    governance,
    logLevel: resolveLogLevel(),
    exceptionQueueSize:
      Number.parseInt(process.env.EXCEPTION_QUEUE_SIZE || '', 10) > 0
        ? Number.parseInt(process.env.EXCEPTION_QUEUE_SIZE as string, 10)
        : DEFAULT_EXCEPTION_QUEUE_SIZE
  };
}
